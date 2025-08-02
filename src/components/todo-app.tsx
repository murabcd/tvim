import { useState, useEffect, useRef } from "react";
import { useRouteContext } from "@tanstack/react-router";

import { useTodos } from "@/hooks/use-todos";
import { useVimKeys } from "@/hooks/use-vim-keys";
import { useAuth } from "@/hooks/use-auth";
import { parseDueDate } from "@/lib/utils";

import type { Todo } from "@/lib/schema";

import { Input } from "@/components/ui/input";
import { TodoList } from "@/components/todo-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronDown, Eye, EyeOff, Tag, X } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HelpModal } from "@/components/help-modal";
import { DeleteTodoDialog } from "@/components/delete-todo-dialog";
import { Badge } from "@/components/ui/badge";

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
		"none" | "date-newest" | "date-oldest" | "due-date" | "due-date-reverse"
	>("none");
	const [helpOpen, setHelpOpen] = useState(false);
	const [editingTodoIndex, setEditingTodoIndex] = useState<number | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [todoToDelete, setTodoToDelete] = useState<{
		index: number;
		text: string;
	} | null>(null);
	const [visualSelectionToDelete, setVisualSelectionToDelete] = useState<{
		start: number;
		end: number;
		todoTexts: string[];
	} | null>(null);
	const [lastDeleteTime, setLastDeleteTime] = useState<number>(0);
	const inputRef = useRef<HTMLInputElement>(null);

	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const {
		state,
		loading,
		moveSelection,
		toggleTodo,
		deleteTodo,
		addTodo,
		updateDueDate,
		updateTodoTags,
		goToTop,
		goToBottom,
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
			if (editingTodoIndex !== null) {
				// Editing existing todo
				// Note: You'll need to implement updateTodo in your useTodos hook
				// For now, we'll just add a new todo and delete the old one
				addTodo(inputValue, position);
				deleteTodo(editingTodoIndex);
			} else {
				// Adding new todo
				addTodo(inputValue, position);
			}
			setInputValue("");
			setEditingTodoIndex(null);
			setMode("normal");
		}
	};

	// Vim-style insert mode handlers
	const handleInsertMode = () => {
		// 'i' - Insert at cursor (edit current todo)
		if (state.todos.length > 0 && state.selectedIndex >= 0) {
			const currentTodo = state.todos[state.selectedIndex];
			setInputValue(currentTodo.text);
			setEditingTodoIndex(state.selectedIndex);
			setMode("insert");
			// Position cursor at beginning for 'i'
			setTimeout(() => {
				if (inputRef.current) {
					inputRef.current.setSelectionRange(0, 0);
				}
			}, 0);
		} else {
			setInputValue("");
			setEditingTodoIndex(null);
			setMode("insert");
		}
	};

	const handleInsertModeBelow = () => {
		// 'o' - Open line below (add new todo below current)
		setInputValue("");
		setEditingTodoIndex(null);
		setMode("insert");
	};

	const handleAppendMode = () => {
		// 'a' - Append after cursor (edit current todo)
		if (state.todos.length > 0 && state.selectedIndex >= 0) {
			const currentTodo = state.todos[state.selectedIndex];
			setInputValue(currentTodo.text);
			setEditingTodoIndex(state.selectedIndex);
			setMode("insert");
			// Position cursor at end for 'a'
			setTimeout(() => {
				if (inputRef.current) {
					const length = inputRef.current.value.length;
					inputRef.current.setSelectionRange(length, length);
				}
			}, 0);
		} else {
			setInputValue("");
			setEditingTodoIndex(null);
			setMode("insert");
		}
	};

	const handleCommand = () => {
		if (commandValue.startsWith("add ")) {
			const text = commandValue.slice(4).trim();
			if (text) {
				addTodo(text);
			}
		} else if (commandValue.startsWith("due ")) {
			const parts = commandValue.slice(4).trim().split(" ");
			if (parts.length >= 2) {
				const datePart = parts[0];
				const text = parts.slice(1).join(" ");
				const dueDate = parseDueDate(datePart);

				if (dueDate && text) {
					addTodo(text, undefined, dueDate);
				}
			}
		} else if (commandValue.startsWith("set-due ")) {
			const dateString = commandValue.slice(8).trim();
			const dueDate = parseDueDate(dateString);

			if (
				dueDate !== null &&
				state.todos.length > 0 &&
				state.selectedIndex >= 0
			) {
				updateDueDate(state.selectedIndex, dueDate);
			}
		} else if (commandValue === "remove-due") {
			if (state.todos.length > 0 && state.selectedIndex >= 0) {
				updateDueDate(state.selectedIndex, null);
			}
		} else if (commandValue.startsWith("tag ")) {
			const tag = commandValue.slice(4).trim();
			if (tag && state.todos.length > 0 && state.selectedIndex >= 0) {
				const currentTodo = state.todos[state.selectedIndex];
				const currentTags = currentTodo.tags
					? currentTodo.tags.split(",").map((t) => t.trim())
					: [];
				if (!currentTags.includes(tag)) {
					updateTodoTags(state.selectedIndex, [...currentTags, tag]);
				}
			}
		} else if (commandValue.startsWith("untag ")) {
			const tag = commandValue.slice(6).trim();
			if (tag && state.todos.length > 0 && state.selectedIndex >= 0) {
				const currentTodo = state.todos[state.selectedIndex];
				const currentTags = currentTodo.tags
					? currentTodo.tags.split(",").map((t) => t.trim())
					: [];
				const updatedTags = currentTags.filter((t) => t !== tag);
				updateTodoTags(state.selectedIndex, updatedTags);
			}
		} else if (commandValue.startsWith("filter ")) {
			const tag = commandValue.slice(7).trim();
			if (tag) {
				setFilterTags([tag]);
			} else {
				setFilterTags([]);
			}
		} else if (commandValue === "clear-filter") {
			setFilterTags([]);
		} else if (commandValue === "toggle-completed") {
			setShowCompleted(!showCompleted);
		} else if (commandValue === "sort-newest") {
			setSortType("date-newest");
		} else if (commandValue === "sort-oldest") {
			setSortType("date-oldest");
		} else if (commandValue === "sort-due-earliest") {
			setSortType("due-date");
		} else if (commandValue === "sort-due-latest") {
			setSortType("due-date-reverse");
		} else if (commandValue === "sort-none") {
			setSortType("none");
		} else if (commandValue === "help" || commandValue === "h") {
			setHelpOpen(true);
			setCommandValue("");
			setMode("normal");
			return;
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
		// Toggle todos by index (this should work fine since toggle doesn't change array length)
		for (let i = start; i <= end; i++) {
			toggleTodo(i);
		}
		setMode("normal");
	};

	const handleDeleteTodo = (index: number) => {
		const todo = state.todos[index];
		if (!todo) return;

		const now = Date.now();
		const timeSinceLastDelete = now - lastDeleteTime;

		// If pressed 'd' twice within 500ms, delete immediately
		if (timeSinceLastDelete < 500) {
			deleteTodo(index);
			setLastDeleteTime(0); // Reset the timer
			setDeleteDialogOpen(false); // Close the dialog if it's open
			setTodoToDelete(null); // Clear the todo to delete
		} else {
			// First press - show confirmation dialog
			setTodoToDelete({ index, text: todo.text });
			setDeleteDialogOpen(true);
			setLastDeleteTime(now);
		}
	};

	const handleConfirmDelete = () => {
		if (todoToDelete) {
			deleteTodo(todoToDelete.index);
			setDeleteDialogOpen(false);
			setTodoToDelete(null);
			setLastDeleteTime(0); // Reset the timer after confirming
		} else if (visualSelectionToDelete) {
			// Delete visual selection from end to start to avoid index shifting issues
			for (
				let i = visualSelectionToDelete.end;
				i >= visualSelectionToDelete.start;
				i--
			) {
				deleteTodo(i);
			}
			setMode("normal");
			setDeleteDialogOpen(false);
			setVisualSelectionToDelete(null);
			setLastDeleteTime(0); // Reset the timer after confirming
		}
	};

	const handleVisualDelete = () => {
		const { start, end } = getVisualSelection();
		const selectedTodos = state.todos.slice(start, end + 1);
		const todoTexts = selectedTodos.map((todo) => todo.text);

		const now = Date.now();
		const timeSinceLastDelete = now - lastDeleteTime;

		// If pressed 'd' twice within 500ms, delete immediately
		if (timeSinceLastDelete < 500) {
			// Delete from end to start to avoid index shifting issues
			for (let i = end; i >= start; i--) {
				deleteTodo(i);
			}
			setMode("normal");
			setLastDeleteTime(0); // Reset the timer
			setVisualSelectionToDelete(null); // Clear the selection to delete
			setDeleteDialogOpen(false); // Close the dialog if it's open
		} else {
			// First press - show confirmation dialog
			setVisualSelectionToDelete({ start, end, todoTexts });
			setDeleteDialogOpen(true);
			setLastDeleteTime(now);
		}
	};

	const getSortButtonText = () => {
		switch (sortType) {
			case "date-newest":
				return "Newest first";
			case "date-oldest":
				return "Oldest first";
			case "due-date":
				return "Due date (earliest)";
			case "due-date-reverse":
				return "Due date (latest)";
			default:
				return "Sort";
		}
	};

	const handleSortNewest = () => setSortType("date-newest");
	const handleSortOldest = () => setSortType("date-oldest");
	const handleSortDueDate = () => setSortType("due-date");
	const handleSortDueDateReverse = () => setSortType("due-date-reverse");
	const handleToggleSort = () => {
		const sortOrder = [
			"none",
			"date-newest",
			"date-oldest",
			"due-date",
			"due-date-reverse",
		];
		const currentIndex = sortOrder.indexOf(sortType);
		const nextIndex = (currentIndex + 1) % sortOrder.length;
		setSortType(sortOrder[nextIndex] as any);
	};

	useVimKeys({
		mode,
		onMoveUp: () => moveSelection("up"),
		onMoveDown: () => moveSelection("down"),
		onToggleTodo: () => toggleTodo(state.selectedIndex),

		onGoToTop: goToTop,
		onGoToBottom: goToBottom,
		onInsertMode: handleInsertMode,
		onInsertModeBelow: handleInsertModeBelow,
		onAppendMode: handleAppendMode,
		onCommandMode: () => setMode("command"),
		onEscape: () => {
			setMode("normal");
			setInputValue("");
			setEditingTodoIndex(null);
			// Reset visual selection when exiting visual mode
			if (mode === "visual") {
				setVisualStart(0);
				setVisualEnd(0);
			}
		},
		onUndo: undo,
		onRedo: redo,
		onSelectAll: selectAll,
		onDeleteLine: () => handleDeleteTodo(state.selectedIndex),
		onYankTodo: yankTodo,
		onPasteTodo: pasteTodo,
		onPasteTodoAbove: pasteTodoAbove,
		onVisualMode: handleVisualMode,
		onVisualMoveUp: handleVisualMoveUp,
		onVisualMoveDown: handleVisualMoveDown,
		onVisualToggle: handleVisualToggle,
		onVisualDelete: handleVisualDelete,
		onHelp: () => setHelpOpen(true),
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

					<div className="hidden md:block text-xs text-muted-foreground">
						<p>
							Press{" "}
							<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
								Shift + ;
							</kbd>{" "}
							and type{" "}
							<kbd className="px-1 py-0.5 bg-muted rounded text-xs">:help</kbd>{" "}
							for keyboard shortcuts
						</p>
					</div>
				</div>

				{state.todos.length > 0 && (
					<div className="flex justify-between items-center mb-4">
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setShowCompleted(!showCompleted)}
								className="flex items-center gap-2"
							>
								{showCompleted ? (
									<Eye className="w-4 h-4" />
								) : (
									<EyeOff className="w-4 h-4" />
								)}
								{showCompleted ? "Show completed" : "Hide completed"}
							</Button>

							{filterTags.length > 0 && (
								<div className="flex items-center gap-1">
									<Tag className="w-4 h-4 text-muted-foreground" />
									{filterTags.map((tag) => (
										<Badge key={tag} variant="secondary" className="text-xs">
											{tag}
											<button
												type="button"
												onClick={() =>
													setFilterTags(filterTags.filter((t) => t !== tag))
												}
												className="ml-1 hover:text-destructive"
											>
												<X className="w-3 h-3" />
											</button>
										</Badge>
									))}
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setFilterTags([])}
										className="text-xs text-muted-foreground hover:text-foreground"
									>
										Clear
									</Button>
								</div>
							)}
						</div>

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
								<DropdownMenuItem onClick={() => setSortType("due-date")}>
									Due date: Earliest first
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setSortType("due-date-reverse")}
								>
									Due date: Latest first
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
							onRemoveTag={(todoIndex, tag) => {
								const todo = state.todos[todoIndex];
								if (todo) {
									const currentTags = todo.tags
										? todo.tags.split(",").map((t) => t.trim())
										: [];
									const updatedTags = currentTags.filter((t) => t !== tag);
									updateTodoTags(todoIndex, updatedTags);
								}
							}}
						/>
					)}

					<div className="border-t border-border bg-muted/30">
						{mode === "insert" ? (
							<div className="flex items-center p-2">
								<div className="w-8 text-center text-muted-foreground">~</div>
								<Input
									ref={inputRef}
									value={inputValue}
									onChange={(e) => setInputValue(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleSubmitTodo();
										} else if (e.key === "Escape") {
											setMode("normal");
											setInputValue("");
											setEditingTodoIndex(null);
										}
									}}
									placeholder={
										editingTodoIndex !== null
											? "Edit todo..."
											: "Enter new todo..."
									}
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
											e.preventDefault();
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
			<HelpModal open={helpOpen} onOpenChange={setHelpOpen} />
			<DeleteTodoDialog
				open={deleteDialogOpen}
				onOpenChange={(open) => {
					setDeleteDialogOpen(open);
					if (!open) {
						setLastDeleteTime(0); // Reset timer when dialog is closed
						setTodoToDelete(null);
						setVisualSelectionToDelete(null);
					}
				}}
				onConfirm={handleConfirmDelete}
				todoText={
					visualSelectionToDelete
						? `${visualSelectionToDelete.todoTexts.length} selected todos`
						: todoToDelete?.text || ""
				}
			/>
		</div>
	);
}
