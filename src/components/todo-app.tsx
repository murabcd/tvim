import { useState, useEffect } from "react";
import { useRouteContext } from "@tanstack/react-router";

import { useTodos } from "@/hooks/use-todos";
import { useVimKeys } from "@/hooks/use-vim-keys";
import { useAuth } from "@/hooks/use-auth";

import type { Todo } from "@/lib/schema";

import { Input } from "@/components/ui/input";
import { TodoList } from "@/components/todo-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RouteContext {
	todos: Todo[];
}

export function TodoApp() {
	const { todos: initialTodos } = useRouteContext({
		from: "/",
	}) as RouteContext;
	const [mode, setMode] = useState<"normal" | "insert" | "command" | "visual">(
		"normal",
	);
	const [inputValue, setInputValue] = useState("");
	const [commandValue, setCommandValue] = useState("");
	const [visualStart, setVisualStart] = useState<number>(0);
	const [visualEnd, setVisualEnd] = useState<number>(0);
	const [sortType, setSortType] = useState<
		"none" | "date-newest" | "date-oldest"
	>("none");

	const { isAuthenticated, isLoading: authLoading } = useAuth();
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

	const getSortButtonText = () => {
		switch (sortType) {
			case "date-newest":
				return "Newest first";
			case "date-oldest":
				return "Oldest first";
			default:
				return "Sort";
		}
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
		<div className="min-h-screen bg-background text-foreground">
			<div className="container mx-auto p-4 max-w-4xl">
				<div className="mb-10">
					{/* Authentication Status */}
					<div className="mb-4 p-3 rounded-lg border border-border bg-muted/30">
						{authLoading ? (
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Skeleton className="w-2 h-2 rounded-full" />
									<Skeleton className="h-4 w-40" />
								</div>
								<Skeleton className="h-3 w-48" />
							</div>
						) : (
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div
										className={`w-2 h-2 rounded-full ${isAuthenticated ? "bg-green-500" : "bg-yellow-500"}`}
									></div>
									<span className="text-sm font-medium">
										{isAuthenticated
											? "Connected to database"
											: "Local storage mode"}
									</span>
								</div>
								<div className="hidden md:block text-xs text-muted-foreground">
									{isAuthenticated
										? "Todos are saved to your account."
										: "Todos are saved locally. Login to sync to database."}
								</div>
							</div>
						)}
					</div>

					<div className="hidden md:block text-xs text-muted-foreground space-y-1">
						<p>
							<span className="font-semibold">Navigation:</span> j/k (up/down) |
							g/G (top/bottom) | ↑/↓ (arrow keys)
						</p>
						<p>
							<span className="font-semibold">Insert:</span> i/I (insert) | o/O
							(new line) | a/A (append) | ESC (exit)
						</p>
						<p>
							<span className="font-semibold">Edit:</span> x/Space (toggle) |
							d/D (delete) | u (undo) | r (redo)
						</p>
						<p>
							<span className="font-semibold">Copy/Paste:</span> y/yy (yank) |
							p/P (paste) | v (visual mode)
						</p>
						<p>
							<span className="font-semibold">Command:</span> : (command mode) |
							:add &lt;text&gt; (add todo)
						</p>
					</div>
				</div>

				{state.todos.length > 0 && (
					<div className="flex justify-end mb-4">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									className="flex items-center gap-2 cursor-pointer"
								>
									<ArrowUpDown className="w-4 h-4" />
									{getSortButtonText()}
									<ChevronDown className="ml-2 h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem onClick={() => setSortType("date-newest")}>
									Date: Newest first
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setSortType("date-oldest")}>
									Date: Oldest first
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				)}

				<div className="border border-border rounded-lg overflow-hidden">
					{loading && state.todos.length === 0 ? (
						<div className="divide-y divide-border">
							{Array.from({ length: 3 }, (_, index) => (
								<div
									key={`loading-skeleton-${crypto.randomUUID()}`}
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
							visualSelection={
								mode === "visual" ? getVisualSelection() : undefined
							}
							sortType={sortType}
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
									{loading ? (
										<Skeleton className="inline-block w-32 h-3" />
									) : (
										`${mode.toUpperCase()} MODE - ${state.todos.length} todos`
									)}{" "}
									{mode === "visual" &&
										`(${getVisualSelection().end - getVisualSelection().start + 1} selected) `}
									{!isAuthenticated && state.todos.length > 0 && " (local)"}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
