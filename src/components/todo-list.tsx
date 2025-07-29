import type { Todo } from "@/lib/schema";

import { Check, Circle } from "lucide-react";

interface TodoListProps {
	todos: Todo[];
	selectedIndex: number;
	visualSelection?: { start: number; end: number };
	sortType?: "none" | "date-newest" | "date-oldest";
}

export function TodoList({
	todos,
	selectedIndex,
	visualSelection,
	sortType = "none",
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
		return index >= visualSelection.start && index <= visualSelection.end;
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
			default:
				return todos;
		}
	})();

	// Find the currently selected todo in the sorted list
	const selectedTodo = todos[selectedIndex];
	const sortedSelectedIndex = sortedTodos.findIndex(
		(todo) => todo.id === selectedTodo?.id,
	);

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
							{todo.text}
						</div>

						<div className="text-xs text-muted-foreground">
							{sortType === "date-newest" || sortType === "date-oldest"
								? new Date(todo.created).toLocaleString()
								: new Date(todo.created).toLocaleDateString()}
						</div>
					</div>
				);
			})}
		</div>
	);
}
