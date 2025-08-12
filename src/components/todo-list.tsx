import { useState } from "react";
import type { Todo } from "@/lib/schema";
import { formatDueDate, isOverdue, isDueToday, parseTags } from "@/lib/utils";

import {
	Check,
	Circle,
	Calendar,
	AlertTriangle,
	Tag,
	X,
	GripVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
	closestCenter,
} from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
	onReorder?: (oldIndex: number, newIndex: number) => void;
}

interface SortableTodoItemProps {
	todo: Todo;
	index: number;
	isSelected: boolean;
	isVisualSelected: boolean;
	onRemoveTag?: (tag: string) => void;
}

const getDueDateBadge = (todo: Todo) => {
	if (!todo.dueDate) return null;

	const dueDate = new Date(todo.dueDate);
	const isOverdueTodo = isOverdue(dueDate);
	const isDueTodayTodo = isDueToday(dueDate);

	let variant: "default" | "secondary" | "destructive" | "outline" = "default";
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

function SortableTodoItem({
	todo,
	index,
	isSelected,
	isVisualSelected,
	onRemoveTag,
}: SortableTodoItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: todo.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			data-selected={isSelected ? "true" : undefined}
			className={`flex items-center gap-3 p-3 ${
				isDragging ? "opacity-50" : ""
			} ${
				isVisualSelected
					? "bg-muted-foreground/10 text-foreground"
					: "hover:bg-muted/50"
			}`}
		>
			<div className="w-8 text-right text-sm text-muted-foreground">
				{index + 1}
			</div>

			<div
				{...attributes}
				{...listeners}
				className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
			>
				<GripVertical className="w-4 h-4 text-muted-foreground" />
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
				{getTagsBadges(todo, onRemoveTag)}
				{getDueDateBadge(todo)}
				<div className="text-xs text-muted-foreground">
					{new Date(todo.created).toLocaleDateString()}
				</div>
			</div>
		</div>
	);
}

export function TodoList({
	todos,
	selectedIndex,
	visualSelection,
	sortType = "none",
	onRemoveTag,
	onReorder,
}: TodoListProps) {
	const [activeId, setActiveId] = useState<string | null>(null);
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	);

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = todos.findIndex((todo) => todo.id === active.id);
			const newIndex = todos.findIndex((todo) => todo.id === over.id);

			if (oldIndex !== -1 && newIndex !== -1) {
				onReorder?.(oldIndex, newIndex);
			}
		}

		setActiveId(null);
	};

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

	const _getDueDateBadge = (todo: Todo) => {
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

	const _getTagsBadges = (todo: Todo, onRemoveTag?: (tag: string) => void) => {
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

	const activeTodo = activeId
		? todos.find((todo) => todo.id === activeId)
		: null;

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<SortableContext
				items={sortedTodos.map((todo) => todo.id)}
				strategy={verticalListSortingStrategy}
			>
				<div className="divide-y divide-border">
					{sortedTodos.map((todo, index) => {
						const isSelected =
							sortType !== "none"
								? index === sortedSelectedIndex
								: index === selectedIndex;
						const isVisualSelected = isVisuallySelected(index);

						return (
							<SortableTodoItem
								key={todo.id}
								todo={todo}
								index={index}
								isSelected={isSelected}
								isVisualSelected={isVisualSelected}
								onRemoveTag={
									onRemoveTag ? (tag) => onRemoveTag(index, tag) : undefined
								}
							/>
						);
					})}
				</div>
			</SortableContext>
			<DragOverlay>
				{activeTodo ? (
					<div className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg shadow-lg opacity-90">
						<div className="w-8 text-right text-sm text-muted-foreground">
							{sortedTodos.findIndex((todo) => todo.id === activeTodo.id) + 1}
						</div>
						<div className="flex items-center gap-2">
							<GripVertical className="w-4 h-4 text-muted-foreground" />
							{activeTodo.completed ? (
								<Check className="w-4 h-4 text-green-500" />
							) : (
								<Circle className="w-4 h-4 text-muted-foreground" />
							)}
						</div>
						<div
							className={`flex-1 ${activeTodo.completed ? "line-through text-muted-foreground" : ""}`}
						>
							{renderTextWithLinks(activeTodo.text)}
						</div>
					</div>
				) : null}
			</DragOverlay>
		</DndContext>
	);
}
