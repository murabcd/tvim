import { useState, useEffect } from "react";
import { useRouteContext } from "@tanstack/react-router";

import { useTodos } from "@/hooks/use-todos";
import { useVimKeys } from "@/hooks/use-vim-keys";

import type { Todo } from "@/lib/schema";

import { Input } from "@/components/ui/input";
import { TodoList } from "@/components/todo-list";
import { Skeleton } from "@/components/ui/skeleton";

interface RouteContext {
	todos: Todo[];
}

export function TodoApp() {
	const { todos: initialTodos } = useRouteContext({
		from: "/",
	}) as RouteContext;
	const [mode, setMode] = useState<"normal" | "insert" | "command" | "visual">("normal");
	const [inputValue, setInputValue] = useState("");
	const [commandValue, setCommandValue] = useState("");
	const [visualStart, setVisualStart] = useState<number>(0);
	const [visualEnd, setVisualEnd] = useState<number>(0);

	const {
		state,
		loading,
		moveSelection,
		toggleTodo,
		deleteTodo,
		addTodo,
		goToTop,
		goToBottom,
		yankTodo,
		pasteTodo,
		undo,
		redo,
		selectAll,
		initializeTodos,
	} = useTodos();

	// Initialize todos from server-side data
	useEffect(() => {
		if (initialTodos && initialTodos.length > 0) {
			initializeTodos(initialTodos);
		}
	}, [initialTodos, initializeTodos]);

	const handleSubmitTodo = (position?: "below" | "above") => {
		if (inputValue.trim()) {
			addTodo(inputValue, position);
			setInputValue("");
			setMode("normal");
		}
	};

	const handleCommand = () => {
		if (commandValue.startsWith("add ")) {
			const text = commandValue.slice(4).trim();
			if (text) {
				addTodo(text);
			}
		}
		setCommandValue("");
		setMode("normal");
	};

	const handleVisualMode = () => {
		setMode("visual");
		setVisualStart(state.selectedIndex);
		setVisualEnd(state.selectedIndex);
	};

	const handleVisualMoveUp = () => {
		const newEnd = Math.max(0, visualEnd - 1);
		setVisualEnd(newEnd);
	};

	const handleVisualMoveDown = () => {
		const newEnd = Math.min(state.todos.length - 1, visualEnd + 1);
		setVisualEnd(newEnd);
	};

	const getVisualSelection = () => {
		const start = Math.min(visualStart, visualEnd);
		const end = Math.max(visualStart, visualEnd);
		return { start, end };
	};

	const handleVisualToggle = () => {
		const { start, end } = getVisualSelection();
		for (let i = start; i <= end; i++) {
			toggleTodo(i);
		}
		setMode("normal");
	};

	const handleVisualDelete = () => {
		const { start, end } = getVisualSelection();
		for (let i = end; i >= start; i--) {
			deleteTodo(i);
		}
		setMode("normal");
	};

	useVimKeys({
		mode,
		onMoveUp: () => moveSelection("up"),
		onMoveDown: () => moveSelection("down"),
		onToggleTodo: () => toggleTodo(state.selectedIndex),
		onDeleteTodo: () => deleteTodo(state.selectedIndex),
		onGoToTop: goToTop,
		onGoToBottom: goToBottom,
		onInsertMode: () => setMode("insert"),
		onInsertModeBelow: () => setMode("insert"),
		onInsertModeAbove: () => setMode("insert"),
		onAppendMode: () => setMode("insert"),
		onAppendModeEnd: () => setMode("insert"),
		onCommandMode: () => setMode("command"),
		onEscape: () => setMode("normal"),
		onUndo: undo,
		onRedo: redo,
		onSelectAll: selectAll,
		onDeleteLine: () => deleteTodo(state.selectedIndex),
		onYankTodo: yankTodo,
		onPasteTodo: pasteTodo,
		onVisualMode: handleVisualMode,
		onVisualMoveUp: handleVisualMoveUp,
		onVisualMoveDown: handleVisualMoveDown,
		onVisualToggle: handleVisualToggle,
		onVisualDelete: handleVisualDelete,
	});

	return (
		<div className="min-h-screen bg-background text-foreground font-mono">
			<div className="container mx-auto p-4 max-w-4xl">
				<div className="mb-10">
					<h1 className="text-2xl font-bold mb-2">TVIM</h1>
					<div className="text-xs text-muted-foreground space-y-1">
						<p>
							<strong>Navigation:</strong> j/k (up/down) | gg/G (top/bottom) |
							↑/↓ (arrow keys)
						</p>
						<p>
							<strong>Insert:</strong> i/I (insert) | o/O (new line) | a/A
							(append) | ESC/Ctrl+C (exit)
						</p>
						<p>
							<strong>Edit:</strong> x/Space (toggle) | dd/D (delete) | u
							(undo) | Ctrl+R (redo)
						</p>
						<p>
							<strong>Copy/Paste:</strong> y/yy (yank) | p/P (paste) | v
							(visual mode)
						</p>
						<p>
							<strong>Command:</strong> : (command mode) | :add &lt;text&gt;
							(add todo)
						</p>
					</div>
				</div>

				<div className="border border-border rounded-lg overflow-hidden">
					{loading && state.todos.length === 0 ? (
						<div className="divide-y divide-border">
							{Array.from({ length: 3 }, (_, index) => (
								<div
									key={`loading-skeleton-${index}`}
									className="flex items-center gap-3 p-3"
								>
									<div className="w-8 text-right text-sm text-muted-foreground">
										{index + 1}
									</div>
									<Skeleton className="w-4 h-4 rounded-full" />
									<Skeleton className="flex-1 h-4" />
									<Skeleton className="w-16 h-3" />
								</div>
							))}
						</div>
					) : (
						<TodoList 
							todos={state.todos} 
							selectedIndex={state.selectedIndex}
							visualSelection={mode === "visual" ? getVisualSelection() : undefined}
						/>
					)}

					<div className="border-t border-border bg-muted/30">
						{mode === "insert" ? (
							<div className="flex items-center p-2">
								<div className="w-8 text-center text-muted-foreground">~</div>
								<Input
									value={inputValue}
									onChange={(e) => setInputValue(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleSubmitTodo();
										} else if (e.key === "Escape") {
											setMode("normal");
											setInputValue("");
										}
									}}
									placeholder="Enter new todo..."
									className="flex-1 mx-2 bg-transparent border-none focus:ring-0 text-foreground"
									autoFocus
								/>
							</div>
						) : mode === "command" ? (
							<div className="flex items-center p-2">
								<div className="w-8 text-center text-muted-foreground">:</div>
								<Input
									value={commandValue}
									onChange={(e) => setCommandValue(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleCommand();
										} else if (e.key === "Escape") {
											setMode("normal");
											setCommandValue("");
										}
									}}
									placeholder="add <text>"
									className="flex-1 mx-2 bg-transparent border-none focus:ring-0 text-foreground"
									autoFocus
								/>
							</div>
						) : (
							<div className="flex items-center p-2">
								<div className="w-8 text-center text-muted-foreground">~</div>
								<div className="flex-1 px-2 text-muted-foreground">
									{mode.toUpperCase()} MODE - {state.todos.length} todos{" "}
									{mode === "visual" && `(${getVisualSelection().end - getVisualSelection().start + 1} selected) `}
									{loading && "(loading...)"}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
