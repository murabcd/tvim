import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { useLocalStorage } from "usehooks-ts";

import type { Todo, AppState } from "@/lib/schema";
import { useAuth } from "@/hooks/use-auth";
import { extractTagsFromText, parseTags, formatTags } from "@/lib/utils";

import {
	getAllTodos,
	createTodo,
	updateTodo,
	deleteTodo,
	clearAllTodos,
} from "@/lib/todo-server";

const TODOS_QUERY_KEY = ["todos"];
const LOCAL_TODOS_KEY = "tvim-local-todos";

export function useTodos() {
	const queryClient = useQueryClient();
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [history, setHistory] = useState<Todo[][]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const clipboardRef = useRef<Todo | null>(null);
	const hasSyncedRef = useRef(false);
	const [showCompleted, setShowCompleted] = useState(true);
	const [filterTags, setFilterTags] = useState<string[]>([]);

	// Ordering constants
	const ORDER_STEP = 1000;

	const normalizeArrayOrders = useCallback((list: Todo[]): Todo[] => {
		return list.map((todo, index) => ({
			...todo,
			order: (index + 1) * ORDER_STEP,
		}));
	}, []);

	const hasOrderIssues = useCallback((list: Todo[]): boolean => {
		if (list.length === 0) return false;
		const seen = new Set<number>();
		for (let i = 0; i < list.length; i++) {
			const ord = list[i].order ?? 0;
			if (ord <= 0) return true;
			if (seen.has(ord)) return true;
			seen.add(ord);
			if (i > 0 && (list[i - 1].order ?? 0) >= ord) return true;
		}
		return false;
	}, []);

	// Use usehooks-ts useLocalStorage for better localStorage management
	const [localTodos, setLocalTodos] = useLocalStorage<Todo[]>(
		LOCAL_TODOS_KEY,
		[],
		{
			serializer: (value) => JSON.stringify(value),
			deserializer: (value) => {
				try {
					const todos = JSON.parse(value);
					// Ensure created field is a Date object
					return todos.map(
						(todo: { created: string | Date; [key: string]: unknown }) => ({
							...todo,
							created: new Date(todo.created),
						}),
					);
				} catch {
					return [];
				}
			},
		},
	);

	// Query for todos (only enabled when auth state is determined)
	const { data: serverTodos = [], isLoading: queryLoading } = useQuery({
		queryKey: TODOS_QUERY_KEY,
		queryFn: getAllTodos,
		enabled: !authLoading, // Only run query when auth loading is complete
	});

	// Use local todos when not authenticated, server todos when authenticated
	// Show local todos optimistically while auth is loading
	const allTodos = authLoading
		? localTodos
		: isAuthenticated
			? serverTodos.map((todo) => ({
					...todo,
					userId: todo.userId || undefined,
					dueDate: todo.dueDate || undefined,
					tags: todo.tags ?? undefined,
					order: todo.order ?? undefined,
				}))
			: localTodos;

	// Filter todos based on completion status and tags
	const todos = allTodos.filter((todo) => {
		// Filter by completion status
		if (!showCompleted && todo.completed) {
			return false;
		}

		// Filter by tags
		if (filterTags.length > 0) {
			const todoTags = parseTags(todo.tags ?? undefined);
			const hasMatchingTag = filterTags.some((filterTag) =>
				todoTags.some(
					(todoTag) => todoTag.toLowerCase() === filterTag.toLowerCase(),
				),
			);
			if (!hasMatchingTag) {
				return false;
			}
		}

		return true;
	});

	// Show loading state while auth is loading or query is loading
	const isLoading = authLoading || (isAuthenticated && queryLoading);

	const state: AppState = {
		todos,
		selectedIndex: Math.min(selectedIndex, Math.max(0, todos.length - 1)),
	};

	// Initialize todos from server-side data
	const initializeTodos = useCallback(
		(initialTodos: Todo[]) => {
			if (isAuthenticated) {
				queryClient.setQueryData(TODOS_QUERY_KEY, initialTodos);
			} else {
				setLocalTodos(initialTodos);
			}
		},
		[queryClient, isAuthenticated, setLocalTodos],
	);

	const saveToHistory = useCallback(
		(todosToSave: Todo[]) => {
			setHistory((prev) => {
				const newHistory = prev.slice(0, historyIndex + 1);
				newHistory.push([...todosToSave]);
				return newHistory.slice(-50); // Keep last 50 states
			});
			setHistoryIndex((prev) => Math.min(prev + 1, 49));
		},
		[historyIndex],
	);

	// Create todo mutation with optimistic update
	const createTodoMutation = useMutation({
		mutationFn: createTodo,
		onMutate: async ({ data }) => {
			if (!isAuthenticated) return null;

			await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });
			const previousTodos =
				queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY) || [];

			saveToHistory(previousTodos);

			// Create temporary todo for optimistic update
			const tempTodo: Todo = {
				id: `temp-${nanoid()}`,
				text: data.text,
				completed: false,
				dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
				created: new Date(),
			};

			return { previousTodos, tempTodo };
		},
		onSuccess: (newTodo, _, context) => {
			if (context && isAuthenticated) {
				const previousTodos =
					queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY) || [];
				const updatedTodos = previousTodos.map((todo) =>
					todo.id === context.tempTodo.id ? newTodo : todo,
				);
				queryClient.setQueryData(TODOS_QUERY_KEY, updatedTodos);
			}
			// Invalidate and refetch to ensure consistency with server state
			queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
		},
		onError: (_, __, context) => {
			if (context?.previousTodos && isAuthenticated) {
				queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos);
			}
		},
	});

	// Sync local todos to database when user logs in (only once)
	useEffect(() => {
		if (isAuthenticated && localTodos.length > 0 && !hasSyncedRef.current) {
			hasSyncedRef.current = true; // Mark as synced to prevent infinite loop

			// Immediately add local todos to the query cache for instant UI update
			const currentServerTodos =
				queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY) || [];
			const syncedTodos = localTodos.map((todo) => ({
				...todo,
				id: `syncing-${todo.id}`, // Temporary ID to avoid conflicts
			}));

			queryClient.setQueryData(TODOS_QUERY_KEY, [
				...syncedTodos,
				...currentServerTodos,
			]);

			// Sync local todos to database
			const syncPromises = localTodos.map((todo) =>
				createTodoMutation.mutateAsync({
					data: {
						text: todo.text,
						dueDate: todo.dueDate?.toISOString(),
					},
				}),
			);

			// Wait for all todos to be synced, then clear local storage and refetch
			Promise.all(syncPromises)
				.then(() => {
					// Clear local todos after successful sync
					setLocalTodos([]);
					// Invalidate the query cache to refetch todos from database
					queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
				})
				.catch((error) => {
					console.error("Failed to sync todos:", error);
					hasSyncedRef.current = false; // Reset on error so we can retry
					// Remove the temporary todos from cache on error
					queryClient.setQueryData(TODOS_QUERY_KEY, currentServerTodos);
				});
		}
	}, [
		isAuthenticated,
		localTodos,
		createTodoMutation,
		queryClient,
		setLocalTodos,
	]);

	// Reset sync flag when user logs out
	useEffect(() => {
		if (!isAuthenticated) {
			hasSyncedRef.current = false;
		}
	}, [isAuthenticated]);

	// Refetch todos when authentication state changes
	useEffect(() => {
		if (isAuthenticated) {
			// When user logs in, refetch todos from database
			queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
		}
	}, [isAuthenticated, queryClient]);

	// Update todo mutation with optimistic update
	const updateTodoMutation = useMutation({
		mutationFn: updateTodo,
		onMutate: async ({ data: updateData }) => {
			if (!isAuthenticated) return null;

			await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });
			const previousTodos =
				queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY) || [];

			saveToHistory(previousTodos);

			const optimisticTodos = previousTodos.map((todo) => {
				if (todo.id === updateData.id) {
					const updatedTodo = { ...todo };

					// Handle specific fields properly
					if ("completed" in updateData && updateData.completed !== undefined) {
						updatedTodo.completed = updateData.completed;
					}
					if ("dueDate" in updateData) {
						// Convert string to Date or null
						updatedTodo.dueDate = updateData.dueDate
							? new Date(updateData.dueDate)
							: null;
					}

					return updatedTodo;
				}
				return todo;
			});

			queryClient.setQueryData(TODOS_QUERY_KEY, optimisticTodos);
			return { previousTodos };
		},
		onSuccess: (updatedTodo, _, context) => {
			if (context && isAuthenticated) {
				// Update the cache with the returned data instead of refetching
				const currentTodos =
					queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY) || [];
				const updatedTodos = currentTodos.map((todo) =>
					todo.id === updatedTodo.id ? updatedTodo : todo,
				);
				queryClient.setQueryData(TODOS_QUERY_KEY, updatedTodos);
			}
		},
		onError: (_, __, context) => {
			if (context?.previousTodos && isAuthenticated) {
				queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos);
			}
		},
	});

	// Delete todo mutation with optimistic update
	const deleteTodoMutation = useMutation({
		mutationFn: deleteTodo,
		onMutate: async ({ data: todoId }) => {
			if (!isAuthenticated) return null;

			await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });
			const previousTodos =
				queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY) || [];

			saveToHistory(previousTodos);

			const optimisticTodos = previousTodos.filter(
				(todo) => todo.id !== todoId,
			);
			queryClient.setQueryData(TODOS_QUERY_KEY, optimisticTodos);

			return { previousTodos };
		},
		onSuccess: () => {
			// Invalidate and refetch to ensure consistency with server state
			queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
		},
		onError: (_, __, context) => {
			if (context?.previousTodos && isAuthenticated) {
				queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos);
			}
		},
	});

	// Clear all todos mutation
	const clearTodosMutation = useMutation({
		mutationFn: clearAllTodos,
		onMutate: async () => {
			if (!isAuthenticated) return null;

			await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });
			const previousTodos =
				queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY) || [];

			saveToHistory(previousTodos);
			queryClient.setQueryData(TODOS_QUERY_KEY, []);

			return { previousTodos };
		},
		onSuccess: () => {
			// Invalidate and refetch to ensure consistency with server state
			queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
		},
		onError: (_, __, context) => {
			if (context?.previousTodos && isAuthenticated) {
				queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos);
			}
		},
	});

	const addTodo = useCallback(
		async (text: string, position?: "below" | "above", dueDate?: Date) => {
			const currentTodos = isAuthenticated
				? queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY) || []
				: localTodos;

			// Extract tags from text
			const { text: cleanText, tags } = extractTagsFromText(text);

			// Generate order value based on position with wide spacing
			const generateOrder = (index: number) => {
				if (currentTodos.length === 0) return ORDER_STEP;
				if (index === 0) {
					const firstOrder = currentTodos[0].order ?? ORDER_STEP;
					const candidate = firstOrder - ORDER_STEP;
					return candidate > 0 ? candidate : ORDER_STEP / 2; // keep positive
				}
				if (index === currentTodos.length) {
					const lastOrder = currentTodos[currentTodos.length - 1].order ?? 0;
					return lastOrder + ORDER_STEP;
				}
				const prevOrder = currentTodos[index - 1].order ?? index * ORDER_STEP;
				const nextOrder = currentTodos[index].order ?? (index + 1) * ORDER_STEP;
				// midpoint while staying integer
				return Math.max(1, Math.floor((prevOrder + nextOrder) / 2));
			};

			// Create temporary todo for optimistic update
			const tempTodo: Todo = {
				id: `temp-${nanoid()}`,
				text: cleanText,
				completed: false,
				dueDate,
				tags: formatTags(tags),
				created: new Date(),
			};

			let optimisticTodos: Todo[];
			let newSelectedIndex: number;
			let orderValue: number;

			if (position === "above") {
				orderValue = generateOrder(selectedIndex);
				tempTodo.order = orderValue;
				optimisticTodos = [
					...currentTodos.slice(0, selectedIndex),
					tempTodo,
					...currentTodos.slice(selectedIndex),
				];
				newSelectedIndex = selectedIndex;
			} else if (position === "below") {
				orderValue = generateOrder(selectedIndex + 1);
				tempTodo.order = orderValue;
				optimisticTodos = [
					...currentTodos.slice(0, selectedIndex + 1),
					tempTodo,
					...currentTodos.slice(selectedIndex + 1),
				];
				newSelectedIndex = selectedIndex + 1;
			} else {
				orderValue = generateOrder(currentTodos.length);
				tempTodo.order = orderValue;
				optimisticTodos = [...currentTodos, tempTodo];
				newSelectedIndex = currentTodos.length;
			}

			if (isAuthenticated) {
				queryClient.setQueryData(TODOS_QUERY_KEY, optimisticTodos);
				createTodoMutation.mutate({
					data: {
						text: cleanText,
						dueDate: dueDate?.toISOString(),
						tags: formatTags(tags),
						order: orderValue.toString(),
					},
				});
				// If orders look wrong (non-positive/duplicates), normalize the entire list
				if (hasOrderIssues(optimisticTodos)) {
					const normalized = normalizeArrayOrders(optimisticTodos);
					queryClient.setQueryData(TODOS_QUERY_KEY, normalized);
					// persist
					Promise.all(
						normalized.map((t) =>
							updateTodoMutation.mutateAsync({
								data: { id: t.id, order: t.order?.toString() },
							}),
						),
					).catch(() => {});
				}
			} else {
				const next = hasOrderIssues(optimisticTodos)
					? normalizeArrayOrders(optimisticTodos)
					: optimisticTodos;
				setLocalTodos(next);
			}

			setSelectedIndex(newSelectedIndex);
		},
		[
			createTodoMutation,
			queryClient,
			selectedIndex,
			isAuthenticated,
			localTodos,
			setLocalTodos,
			hasOrderIssues,
			normalizeArrayOrders,
			updateTodoMutation,
		],
	);

	const deleteTodoById = useCallback(
		async (index: number) => {
			const todo = todos[index];
			if (!todo) return;

			if (isAuthenticated) {
				deleteTodoMutation.mutate({ data: todo.id });
			} else {
				const updatedTodos = localTodos.filter((_, i) => i !== index);
				setLocalTodos(updatedTodos);
			}

			setSelectedIndex(Math.max(0, Math.min(selectedIndex, todos.length - 2)));
		},
		[
			deleteTodoMutation,
			todos,
			selectedIndex,
			isAuthenticated,
			localTodos,
			setLocalTodos,
		],
	);

	const toggleTodo = useCallback(
		async (index: number) => {
			const todo = todos[index];
			if (!todo) return;

			if (isAuthenticated) {
				updateTodoMutation.mutate({
					data: { id: todo.id, completed: !todo.completed },
				});
			} else {
				const updatedTodos = localTodos.map((t, i) =>
					i === index ? { ...t, completed: !t.completed } : t,
				);
				setLocalTodos(updatedTodos);
			}
		},
		[updateTodoMutation, todos, isAuthenticated, localTodos, setLocalTodos],
	);

	const moveSelection = useCallback(
		(direction: "up" | "down") => {
			setSelectedIndex((prev) => {
				const newIndex =
					direction === "up"
						? Math.max(0, prev - 1)
						: Math.min(todos.length - 1, prev + 1);
				return newIndex;
			});
		},
		[todos.length],
	);

	const goToTop = useCallback(() => {
		setSelectedIndex(0);
	}, []);

	const goToBottom = useCallback(() => {
		setSelectedIndex(Math.max(0, todos.length - 1));
	}, [todos.length]);

	const saveTodos = useCallback(() => {
		console.log("Save todos called (using database now)");
	}, []);

	const loadTodos = useCallback(() => {
		console.log("Load todos called (using database now)");
	}, []);

	const clearTodos = useCallback(async () => {
		if (isAuthenticated) {
			clearTodosMutation.mutate({});
		} else {
			setLocalTodos([]);
		}
	}, [clearTodosMutation, isAuthenticated, setLocalTodos]);

	const yankTodo = useCallback(() => {
		if (todos[selectedIndex]) {
			clipboardRef.current = { ...todos[selectedIndex] };
		}
	}, [todos, selectedIndex]);

	const pasteTodo = useCallback(async () => {
		if (!clipboardRef.current) return;

		const currentTodos = isAuthenticated
			? queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY) || []
			: localTodos;

		const tempTodo: Todo = {
			id: `temp-${nanoid()}`,
			text: clipboardRef.current.text,
			completed: false,
			dueDate: clipboardRef.current.dueDate,
			created: new Date(),
		};

		const optimisticTodos = [
			...currentTodos.slice(0, selectedIndex + 1),
			tempTodo,
			...currentTodos.slice(selectedIndex + 1),
		];

		if (isAuthenticated) {
			queryClient.setQueryData(TODOS_QUERY_KEY, optimisticTodos);
			createTodoMutation.mutate({
				data: {
					text: clipboardRef.current.text,
					dueDate: clipboardRef.current.dueDate?.toISOString(),
				},
			});
		} else {
			setLocalTodos(optimisticTodos);
		}
	}, [
		createTodoMutation,
		queryClient,
		selectedIndex,
		isAuthenticated,
		localTodos,
		setLocalTodos,
	]);

	const pasteTodoAbove = useCallback(async () => {
		if (!clipboardRef.current) return;

		const currentTodos = isAuthenticated
			? queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY) || []
			: localTodos;

		const tempTodo: Todo = {
			id: `temp-${nanoid()}`,
			text: clipboardRef.current.text,
			completed: false,
			dueDate: clipboardRef.current.dueDate,
			created: new Date(),
		};

		const optimisticTodos = [
			...currentTodos.slice(0, selectedIndex),
			tempTodo,
			...currentTodos.slice(selectedIndex),
		];

		if (isAuthenticated) {
			queryClient.setQueryData(TODOS_QUERY_KEY, optimisticTodos);
			createTodoMutation.mutate({
				data: {
					text: clipboardRef.current.text,
					dueDate: clipboardRef.current.dueDate?.toISOString(),
				},
			});
		} else {
			setLocalTodos(optimisticTodos);
		}
	}, [
		createTodoMutation,
		queryClient,
		selectedIndex,
		isAuthenticated,
		localTodos,
		setLocalTodos,
	]);

	const undo = useCallback(() => {
		if (historyIndex > 0) {
			const previousState = history[historyIndex - 1];
			if (isAuthenticated) {
				queryClient.setQueryData(TODOS_QUERY_KEY, [...previousState]);
			} else {
				setLocalTodos([...previousState]);
			}
			setHistoryIndex((prev) => prev - 1);
		}
	}, [history, historyIndex, queryClient, isAuthenticated, setLocalTodos]);

	const redo = useCallback(() => {
		if (historyIndex < history.length - 1) {
			const nextState = history[historyIndex + 1];
			if (isAuthenticated) {
				queryClient.setQueryData(TODOS_QUERY_KEY, [...nextState]);
			} else {
				setLocalTodos([...nextState]);
			}
			setHistoryIndex((prev) => prev + 1);
		}
	}, [history, historyIndex, queryClient, isAuthenticated, setLocalTodos]);

	const updateDueDate = useCallback(
		async (index: number, dueDate: Date | null) => {
			const todo = todos[index];
			if (!todo) return;

			if (isAuthenticated) {
				updateTodoMutation.mutate({
					data: {
						id: todo.id,
						dueDate: dueDate ? dueDate.toISOString() : null,
					},
				});
			} else {
				const updatedTodos = localTodos.map((t, i) =>
					i === index ? { ...t, dueDate } : t,
				);
				setLocalTodos(updatedTodos);
			}
		},
		[updateTodoMutation, todos, isAuthenticated, localTodos, setLocalTodos],
	);

	const updateTodoTags = useCallback(
		async (index: number, tags: string[]) => {
			const todo = todos[index];
			if (!todo) return;

			if (isAuthenticated) {
				updateTodoMutation.mutate({
					data: {
						id: todo.id,
						tags: formatTags(tags),
					},
				});
			} else {
				const updatedTodos = localTodos.map((t, i) =>
					i === index ? { ...t, tags: formatTags(tags) } : t,
				);
				setLocalTodos(updatedTodos);
			}
		},
		[updateTodoMutation, todos, isAuthenticated, localTodos, setLocalTodos],
	);

	const normalizeOrders = useCallback(
		async (todosToNormalize: Todo[]) => {
			const normalizedTodos = normalizeArrayOrders(todosToNormalize);

			if (isAuthenticated) {
				queryClient.setQueryData(TODOS_QUERY_KEY, normalizedTodos);
				// Update all todos in the database with new orders
				Promise.all(
					normalizedTodos.map((todo) =>
						updateTodoMutation.mutateAsync({
							data: { id: todo.id, order: todo.order?.toString() },
						}),
					),
				).catch((error) => {
					console.error("Failed to normalize orders:", error);
				});
			} else {
				setLocalTodos(normalizedTodos);
			}
		},
		[
			queryClient,
			isAuthenticated,
			setLocalTodos,
			updateTodoMutation,
			normalizeArrayOrders,
		],
	);

	const reorderTodos = useCallback(
		async (oldIndex: number, newIndex: number) => {
			const currentTodos = isAuthenticated
				? queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY) || []
				: localTodos;

			if (
				oldIndex === newIndex ||
				oldIndex < 0 ||
				newIndex < 0 ||
				oldIndex >= currentTodos.length ||
				newIndex >= currentTodos.length
			) {
				return;
			}

			const reorderedTodos = [...currentTodos];
			const [movedTodo] = reorderedTodos.splice(oldIndex, 1);
			reorderedTodos.splice(newIndex, 0, movedTodo);

			// Normalize all orders deterministically to avoid duplicates/negatives
			const normalized = normalizeArrayOrders(reorderedTodos);

			if (isAuthenticated) {
				queryClient.setQueryData(TODOS_QUERY_KEY, normalized);
				// Persist all changed orders (small lists so OK)
				Promise.all(
					normalized.map((t) =>
						updateTodoMutation.mutateAsync({
							data: { id: t.id, order: t.order?.toString() },
						}),
					),
				).catch(() => {});
			} else {
				setLocalTodos(normalized);
			}

			// Update selected index to follow the moved todo
			setSelectedIndex(newIndex);
		},
		[
			queryClient,
			isAuthenticated,
			localTodos,
			setLocalTodos,
			updateTodoMutation,
			normalizeArrayOrders,
		],
	);

	const selectAll = useCallback(async () => {
		if (todos.length === 0) return;

		const allCompleted = todos.every((todo) => todo.completed);

		if (isAuthenticated) {
			// Optimistically update all todos
			const optimisticTodos = todos.map((todo) => ({
				...todo,
				completed: !allCompleted,
			}));

			queryClient.setQueryData(TODOS_QUERY_KEY, optimisticTodos);

			// Update all todos in the database
			Promise.all(
				todos.map((todo) =>
					updateTodoMutation.mutateAsync({
						data: { id: todo.id, completed: !allCompleted },
					}),
				),
			).catch((error) => {
				console.error("Failed to toggle all todos:", error);
			});
		} else {
			const updatedTodos = localTodos.map((todo) => ({
				...todo,
				completed: !allCompleted,
			}));
			setLocalTodos(updatedTodos);
		}
	}, [
		todos,
		queryClient,
		updateTodoMutation,
		isAuthenticated,
		localTodos,
		setLocalTodos,
	]);

	return {
		state,
		loading:
			isLoading ||
			createTodoMutation.isPending ||
			updateTodoMutation.isPending ||
			deleteTodoMutation.isPending ||
			clearTodosMutation.isPending,
		initializeTodos,
		addTodo,
		deleteTodo: deleteTodoById,
		toggleTodo,
		updateDueDate,
		updateTodoTags,
		reorderTodos,
		normalizeOrders,
		moveSelection,
		goToTop,
		goToBottom,
		saveTodos,
		loadTodos,
		clearTodos,
		yankTodo,
		pasteTodo,
		pasteTodoAbove,
		undo,
		redo,
		selectAll,
		showCompleted,
		setShowCompleted,
		filterTags,
		setFilterTags,
		isAuthenticated,
	};
}
