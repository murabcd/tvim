import { useState, useCallback, useRef, useEffect } from "react";

import type { Todo, AppState } from "@/lib/schema";

import {
	getAllTodos,
	createTodo,
	updateTodo,
	deleteTodo,
	clearAllTodos,
} from "@/lib/todo-server";

export function useTodos() {
	const [state, setState] = useState<AppState>({
		todos: [],
		selectedIndex: 0,
	});

	const [history, setHistory] = useState<Todo[][]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [loading, setLoading] = useState(false);
	const clipboardRef = useRef<Todo | null>(null);

	// Initialize todos from server-side data
	const initializeTodos = useCallback((todos: Todo[]) => {
		setState((prev) => ({ ...prev, todos }));
	}, []);

	// Load todos from database on mount (fallback if no server data)
	useEffect(() => {
		const loadTodos = async () => {
			if (state.todos.length === 0) {
				setLoading(true);
				try {
					const todos = await getAllTodos();
					setState((prev) => ({ ...prev, todos }));
				} catch (error) {
					console.error("Failed to load todos:", error);
				} finally {
					setLoading(false);
				}
			}
		};

		loadTodos();
	}, [state.todos.length]);

	const saveToHistory = useCallback(
		(todos: Todo[]) => {
			setHistory((prev) => {
				const newHistory = prev.slice(0, historyIndex + 1);
				newHistory.push([...todos]);
				return newHistory.slice(-50); // Keep last 50 states
			});
			setHistoryIndex((prev) => Math.min(prev + 1, 49));
		},
		[historyIndex],
	);

	const addTodo = useCallback(
		async (text: string, position?: "below" | "above") => {
			if (loading) return;

			setLoading(true);
			try {
				saveToHistory(state.todos);
				const newTodo = await createTodo({ data: text });

				setState((prev) => {
					let newTodos: Todo[];
					let newSelectedIndex: number;

					if (position === "above") {
						newTodos = [
							...prev.todos.slice(0, prev.selectedIndex),
							newTodo,
							...prev.todos.slice(prev.selectedIndex),
						];
						newSelectedIndex = prev.selectedIndex;
					} else if (position === "below") {
						newTodos = [
							...prev.todos.slice(0, prev.selectedIndex + 1),
							newTodo,
							...prev.todos.slice(prev.selectedIndex + 1),
						];
						newSelectedIndex = prev.selectedIndex + 1;
					} else {
						newTodos = [newTodo, ...prev.todos];
						newSelectedIndex = 0;
					}

					return {
						...prev,
						todos: newTodos,
						selectedIndex: newSelectedIndex,
					};
				});
			} catch (error) {
				console.error("Failed to add todo:", error);
			} finally {
				setLoading(false);
			}
		},
		[saveToHistory, state.todos, loading],
	);

	const deleteTodoById = useCallback(
		async (index: number) => {
			if (loading) return;

			const todo = state.todos[index];
			if (!todo) return;

			setLoading(true);
			try {
				saveToHistory(state.todos);
				await deleteTodo({ data: todo.id });

				setState((prev) => ({
					...prev,
					todos: prev.todos.filter((_, i) => i !== index),
					selectedIndex: Math.max(
						0,
						Math.min(prev.selectedIndex, prev.todos.length - 2),
					),
				}));
			} catch (error) {
				console.error("Failed to delete todo:", error);
			} finally {
				setLoading(false);
			}
		},
		[saveToHistory, state.todos, loading],
	);

	const toggleTodo = useCallback(
		async (index: number) => {
			if (loading) return;

			const todo = state.todos[index];
			if (!todo) return;

			setLoading(true);
			try {
				saveToHistory(state.todos);
				await updateTodo({ data: { id: todo.id, completed: !todo.completed } });

				setState((prev) => ({
					...prev,
					todos: prev.todos.map((t, i) =>
						i === index ? { ...t, completed: !t.completed } : t,
					),
				}));
			} catch (error) {
				console.error("Failed to toggle todo:", error);
			} finally {
				setLoading(false);
			}
		},
		[saveToHistory, state.todos, loading],
	);

	const moveSelection = useCallback((direction: "up" | "down") => {
		setState((prev) => {
			const newIndex =
				direction === "up"
					? Math.max(0, prev.selectedIndex - 1)
					: Math.min(prev.todos.length - 1, prev.selectedIndex + 1);
			return { ...prev, selectedIndex: newIndex };
		});
	}, []);

	const goToTop = useCallback(() => {
		setState((prev) => ({ ...prev, selectedIndex: 0 }));
	}, []);

	const goToBottom = useCallback(() => {
		setState((prev) => ({
			...prev,
			selectedIndex: Math.max(0, prev.todos.length - 1),
		}));
	}, []);

	const saveTodos = useCallback(() => {
		// No longer needed with database persistence
		console.log("Save todos called (using database now)");
	}, []);

	const loadTodos = useCallback(() => {
		// No longer needed with database persistence
		console.log("Load todos called (using database now)");
	}, []);

	const clearTodos = useCallback(async () => {
		if (loading) return;

		setLoading(true);
		try {
			saveToHistory(state.todos);
			await clearAllTodos();
			setState((prev) => ({ ...prev, todos: [] }));
		} catch (error) {
			console.error("Failed to clear todos:", error);
		} finally {
			setLoading(false);
		}
	}, [saveToHistory, state.todos, loading]);

	// New vim operations
	const yankTodo = useCallback(() => {
		if (state.todos[state.selectedIndex]) {
			clipboardRef.current = { ...state.todos[state.selectedIndex] };
		}
	}, [state.todos, state.selectedIndex]);

	const pasteTodo = useCallback(async () => {
		if (!clipboardRef.current || loading) return;

		setLoading(true);
		try {
			saveToHistory(state.todos);
			const newTodo = await createTodo({ data: clipboardRef.current.text });

			setState((prev) => ({
				...prev,
				todos: [
					...prev.todos.slice(0, prev.selectedIndex + 1),
					newTodo,
					...prev.todos.slice(prev.selectedIndex + 1),
				],
			}));
		} catch (error) {
			console.error("Failed to paste todo:", error);
		} finally {
			setLoading(false);
		}
	}, [saveToHistory, state.todos, loading]);

	const undo = useCallback(() => {
		if (historyIndex > 0) {
			const previousState = history[historyIndex - 1];
			setState((prev) => ({ ...prev, todos: [...previousState] }));
			setHistoryIndex((prev) => prev - 1);
		}
	}, [history, historyIndex]);

	const redo = useCallback(() => {
		if (historyIndex < history.length - 1) {
			const nextState = history[historyIndex + 1];
			setState((prev) => ({ ...prev, todos: [...nextState] }));
			setHistoryIndex((prev) => prev + 1);
		}
	}, [history, historyIndex]);

	const selectAll = useCallback(async () => {
		if (loading || state.todos.length === 0) return;

		setLoading(true);
		try {
			saveToHistory(state.todos);
			const allCompleted = state.todos.every((todo) => todo.completed);

			// Update all todos in the database
			await Promise.all(
				state.todos.map((todo) =>
					updateTodo({ data: { id: todo.id, completed: !allCompleted } }),
				),
			);

			setState((prev) => ({
				...prev,
				todos: prev.todos.map((todo) => ({
					...todo,
					completed: !allCompleted,
				})),
			}));
		} catch (error) {
			console.error("Failed to toggle all todos:", error);
		} finally {
			setLoading(false);
		}
	}, [saveToHistory, state.todos, loading]);

	return {
		state,
		loading,
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
