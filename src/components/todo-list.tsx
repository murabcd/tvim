import type { Todo } from "@/lib/schema";
import { formatDueDate, isOverdue, isDueToday, parseTags } from "@/lib/utils";

import { Check, Circle, Calendar, AlertTriangle, Tag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TodoListProps {
	todos: Todo[];
	selectedIndex: number;
	visualSelection?: { start: number; end: number };
	sortType?:
		| "none"
		| "date-newest"
		| "date-oldest"
		| "due-date"
		| "due-date-reverse";
	onRemoveTag?: (todoIndex: number, tag: string) => void;
}

export function TodoList({
	todos,
	selectedIndex,
	visualSelection,
	sortType = "none",
	onRemoveTag,
}: TodoListProps) {
	if (todos.length === 0) {
		return (
			<div className="p-8 text-center text-muted-foreground">
				<p className="text-sm">
					<span className="block md:hidden">No todos yet.</span>
					<span className="hidden md:block">
						No todos yet. Use buttons in normal mode or ":add &lt;text&gt;"
						command to create your first todo.
					</span>
				</p>
			</div>
		);
	}

	const isVisuallySelected = (index: number): boolean => {
		if (!visualSelection) return false;

		// If no sorting, use direct index comparison
		if (sortType === "none") {
			return index >= visualSelection.start && index <= visualSelection.end;
		}

		// For sorted lists, we need to map the visual selection to the sorted indices
		const todo = sortedTodos[index];
		const originalIndex = todos.findIndex((t) => t.id === todo.id);
		return (
			originalIndex >= visualSelection.start &&
			originalIndex <= visualSelection.end
		);
	};

	// Sort todos based on sortType
	const sortedTodos = (() => {
		if (sortType === "none") return todos;

		const sorted = [...todos];

		switch (sortType) {
			case "date-newest":
				return sorted.sort((a, b) => {
					const dateA = new Date(a.created).getTime();
					const dateB = new Date(b.created).getTime();

					// If dates are the same, sort by ID to maintain consistent order
					if (dateA === dateB) {
						return a.id.localeCompare(b.id);
					}

					return dateB - dateA; // Newest first
				});
			case "date-oldest":
				return sorted.sort((a, b) => {
					const dateA = new Date(a.created).getTime();
					const dateB = new Date(b.created).getTime();

					// If dates are the same, sort by ID to maintain consistent order
					if (dateA === dateB) {
						return a.id.localeCompare(b.id);
					}

					return dateA - dateB; // Oldest first
				});
			case "due-date":
				return sorted.sort((a, b) => {
					// Todos without due dates go to the end
					if (!a.dueDate && !b.dueDate) {
						return a.id.localeCompare(b.id);
					}
					if (!a.dueDate) return 1;
					if (!b.dueDate) return -1;

					const dateA = new Date(a.dueDate).getTime();
					const dateB = new Date(b.dueDate).getTime();

					// If due dates are the same, sort by ID to maintain consistent order
					if (dateA === dateB) {
						return a.id.localeCompare(b.id);
					}

					return dateA - dateB; // Earliest due date first
				});
			case "due-date-reverse":
				return sorted.sort((a, b) => {
					// Todos without due dates go to the end
					if (!a.dueDate && !b.dueDate) {
						return a.id.localeCompare(b.id);
					}
					if (!a.dueDate) return 1;
					if (!b.dueDate) return -1;

					const dateA = new Date(a.dueDate).getTime();
					const dateB = new Date(b.dueDate).getTime();

					// If due dates are the same, sort by ID to maintain consistent order
					if (dateA === dateB) {
						return a.id.localeCompare(b.id);
					}

					return dateB - dateA; // Latest due date first
				});
			default:
				return todos;
		}
	})();

	// Find the currently selected todo in the sorted list
	const selectedTodo = todos[selectedIndex];
	const sortedSelectedIndex = sortedTodos.findIndex(
		(todo) => todo.id === selectedTodo?.id,
	);

	const getDueDateBadge = (todo: Todo) => {
		if (!todo.dueDate) return null;

		const dueDate = new Date(todo.dueDate);
		const isOverdueTodo = isOverdue(dueDate);
		const isDueTodayTodo = isDueToday(dueDate);

		let variant: "default" | "secondary" | "destructive" | "outline" =
			"default";
		let icon = <Calendar className="w-3 h-3" />;

		if (isOverdueTodo) {
			variant = "destructive";
			icon = <AlertTriangle className="w-3 h-3" />;
		} else if (isDueTodayTodo) {
			variant = "secondary";
		}

		return (
			<Badge variant={variant} className="text-xs gap-1">
				{icon}
				{formatDueDate(dueDate)}
			</Badge>
		);
	};

	const getTagsBadges = (todo: Todo, onRemoveTag?: (tag: string) => void) => {
		const tags = parseTags(todo.tags);
		if (tags.length === 0) return null;

		return (
			<div className="flex items-center gap-1">
				<Tag className="w-3 h-3 text-muted-foreground" />
				{tags.map((tag) => (
					<Badge
						key={tag}
						variant="outline"
						className="text-xs cursor-pointer hover:bg-destructive/10 hover:text-destructive"
						onClick={() => onRemoveTag?.(tag)}
					>
						{tag}
						{onRemoveTag && <X className="w-3 h-3 ml-1" />}
					</Badge>
				))}
			</div>
		);
	};

	const renderTextWithLinks = (text: string) => {
		const urlRegex = /(https?:\/\/[^\s]+)/g;
		const parts = text.split(urlRegex);

		return parts.map((part, _index) => {
			if (urlRegex.test(part)) {
				return (
					<a
						key={`link-${part}`}
						href={part}
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-500 hover:text-blue-700 underline break-all"
						onClick={(e) => e.stopPropagation()}
					>
						{part}
					</a>
				);
			}
			return part;
		});
	};

	return (
		<div className="divide-y divide-border">
			{sortedTodos.map((todo, index) => {
				const isSelected =
					sortType !== "none"
						? index === sortedSelectedIndex
						: index === selectedIndex;
				const isVisualSelected = isVisuallySelected(index);

				return (
					<div
						key={todo.id}
						className={`flex items-center gap-3 p-3 ${
							isVisualSelected
								? "bg-muted-foreground/10 text-foreground"
								: isSelected
									? "bg-accent text-accent-foreground"
									: "hover:bg-muted/50"
						}`}
					>
						<div className="w-8 text-right text-sm text-muted-foreground">
							{index + 1}
						</div>

						<div className="flex items-center gap-2">
							{todo.completed ? (
								<Check className="w-4 h-4 text-green-500" />
							) : (
								<Circle className="w-4 h-4 text-muted-foreground" />
							)}
						</div>

						<div
							className={`flex-1 ${todo.completed ? "line-through text-muted-foreground" : ""}`}
						>
							{renderTextWithLinks(todo.text)}
						</div>

						<div className="flex items-center gap-2">
							{getTagsBadges(
								todo,
								onRemoveTag ? (tag) => onRemoveTag(index, tag) : undefined,
							)}
							{getDueDateBadge(todo)}
							<div className="text-xs text-muted-foreground">
								{sortType === "date-newest" || sortType === "date-oldest"
									? new Date(todo.created).toLocaleString()
									: new Date(todo.created).toLocaleDateString()}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
