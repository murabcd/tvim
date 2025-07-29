import type { Todo } from "@/lib/schema";

import { Check, Circle } from "lucide-react";

interface TodoListProps {
	todos: Todo[];
	selectedIndex: number;
	visualSelection?: { start: number; end: number };
}

export function TodoList({
	todos,
	selectedIndex,
	visualSelection,
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

	return (
		<div className="divide-y divide-border">
			{todos.map((todo, index) => {
				const isSelected = index === selectedIndex;
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
							{new Date(todo.created).toLocaleDateString()}
						</div>
					</div>
				);
			})}
		</div>
	);
}
