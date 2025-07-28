import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";

import type { Todo, AppState } from "@/lib/schema";

import {
	getAllTodos,
	createTodo,
	updateTodo,
	deleteTodo,
	clearAllTodos,
} from "@/lib/todo-server";

const TODOS_QUERY_KEY = ["todos"];

export function useTodos() {
	const queryClient = useQueryClient();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [history, setHistory] = useState<Todo[][]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const clipboardRef = useRef<Todo | null>(null);

	// Query for todos
	const { data: todos = [], isLoading } = useQuery({
		queryKey: TODOS_QUERY_KEY,
		queryFn: getAllTodos,
	});

	const state: AppState = {
		todos,
		selectedIndex: Math.min(selectedIndex, Math.max(0, todos.length - 1)),
	};

	// Initialize todos from server-side data
	const initializeTodos = useCallback(
		(initialTodos: Todo[]) => {
			queryClient.setQueryData(TODOS_QUERY_KEY, initialTodos);
		},
		[queryClient],
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
		onMutate: async ({ data: text }) => {
			await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });
			const previousTodos =
				queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY) || [];

			saveToHistory(previousTodos);

			// Create temporary todo for optimistic update
			const tempTodo: Todo = {
				id: `temp-${nanoid()}`,
				text,
				completed: false,
				created: new Date(),
			};

			return { previousTodos, tempTodo };
		},
		onSuccess: (newTodo, _, context) => {
			if (context) {
				const previousTodos =
					queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY) || [];
				const updatedTodos = previousTodos.map((todo) =>
					todo.id === context.tempTodo.id ? newTodo : todo,
				);
				queryClient.setQueryData(TODOS_QUERY_KEY, updatedTodos);
			}
		},
		onError: (_, __, context) => {
			if (context?.previousTodos) {
				queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos);
			}
		},
	});

	// Update todo mutation with optimistic update
	const updateTodoMutation = useMutation({
		mutationFn: updateTodo,
		onMutate: async ({ data: updateData }) => {
			await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });
			const previousTodos =
				queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY) || [];

			saveToHistory(previousTodos);

			const optimisticTodos = previousTodos.map((todo) =>
				todo.id === updateData.id ? { ...todo, ...updateData } : todo,
			);

			queryClient.setQueryData(TODOS_QUERY_KEY, optimisticTodos);
			return { previousTodos };
		},
		onError: (_, __, context) => {
			if (context?.previousTodos) {
				queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
		},
	});

	// Delete todo mutation with optimistic update
	const deleteTodoMutation = useMutation({
		mutationFn: deleteTodo,
		onMutate: async ({ data: todoId }) => {
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
		onError: (_, __, context) => {
			if (context?.previousTodos) {
				queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos);
			}
		},
	});

	// Clear all todos mutation
	const clearTodosMutation = useMutation({
		mutationFn: clearAllTodos,
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });
			const previousTodos =
				queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY) || [];

			saveToHistory(previousTodos);
			queryClient.setQueryData(TODOS_QUERY_KEY, []);

			return { previousTodos };
		},
		onError: (_, __, context) => {
			if (context?.previousTodos) {
				queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos);
			}
		},
	});

	const addTodo = useCallback(
		async (text: string, position?: "below" | "above") => {
			const currentTodos =
				queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY) || [];

			// Create temporary todo for optimistic update
			const tempTodo: Todo = {
				id: `temp-${nanoid()}`,
				text,
				completed: false,
				created: new Date(),
			};

			let optimisticTodos: Todo[];
			let newSelectedIndex: number;

			if (position === "above") {
				optimisticTodos = [
					...currentTodos.slice(0, selectedIndex),
					tempTodo,
					...currentTodos.slice(selectedIndex),
				];
				newSelectedIndex = selectedIndex;
			} else if (position === "below") {
				optimisticTodos = [
					...currentTodos.slice(0, selectedIndex + 1),
					tempTodo,
					...currentTodos.slice(selectedIndex + 1),
				];
				newSelectedIndex = selectedIndex + 1;
			} else {
				optimisticTodos = [tempTodo, ...currentTodos];
				newSelectedIndex = 0;
			}

			queryClient.setQueryData(TODOS_QUERY_KEY, optimisticTodos);
			setSelectedIndex(newSelectedIndex);

			createTodoMutation.mutate({ data: text });
		},
		[createTodoMutation, queryClient, selectedIndex],
	);

	const deleteTodoById = useCallback(
		async (index: number) => {
			const todo = todos[index];
			if (!todo) return;

			deleteTodoMutation.mutate({ data: todo.id });
			setSelectedIndex(Math.max(0, Math.min(selectedIndex, todos.length - 2)));
		},
		[deleteTodoMutation, todos, selectedIndex],
	);

	const toggleTodo = useCallback(
		async (index: number) => {
			const todo = todos[index];
			if (!todo) return;

			updateTodoMutation.mutate({
				data: { id: todo.id, completed: !todo.completed },
			});
		},
		[updateTodoMutation, todos],
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
		clearTodosMutation.mutate({});
	}, [clearTodosMutation]);

	const yankTodo = useCallback(() => {
		if (todos[selectedIndex]) {
			clipboardRef.current = { ...todos[selectedIndex] };
		}
	}, [todos, selectedIndex]);

	const pasteTodo = useCallback(async () => {
		if (!clipboardRef.current) return;

		const currentTodos =
			queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY) || [];
		const tempTodo: Todo = {
			id: -Math.floor(Math.random() * 1000000),
			text: clipboardRef.current.text,
			completed: false,
			created: new Date(),
		};

		const optimisticTodos = [
			...currentTodos.slice(0, selectedIndex + 1),
			tempTodo,
			...currentTodos.slice(selectedIndex + 1),
		];

		queryClient.setQueryData(TODOS_QUERY_KEY, optimisticTodos);
		createTodoMutation.mutate({ data: clipboardRef.current.text });
	}, [createTodoMutation, queryClient, selectedIndex]);

	const undo = useCallback(() => {
		if (historyIndex > 0) {
			const previousState = history[historyIndex - 1];
			queryClient.setQueryData(TODOS_QUERY_KEY, [...previousState]);
			setHistoryIndex((prev) => prev - 1);
		}
	}, [history, historyIndex, queryClient]);

	const redo = useCallback(() => {
		if (historyIndex < history.length - 1) {
			const nextState = history[historyIndex + 1];
			queryClient.setQueryData(TODOS_QUERY_KEY, [...nextState]);
			setHistoryIndex((prev) => prev + 1);
		}
	}, [history, historyIndex, queryClient]);

	const selectAll = useCallback(async () => {
		if (todos.length === 0) return;

		const allCompleted = todos.every((todo) => todo.completed);

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
	}, [todos, queryClient, updateTodoMutation]);

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
		moveSelection,
		goToTop,
		goToBottom,
		saveTodos,
		loadTodos,
		clearTodos,
		yankTodo,
		pasteTodo,
		undo,
		redo,
		selectAll,
	};
}
