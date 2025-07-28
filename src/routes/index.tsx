import { createFileRoute } from "@tanstack/react-router";

import { getAllTodos } from "@/lib/todo-server";

import { TodoApp } from "@/components/todo-app";

export const Route = createFileRoute("/")({
	loader: async () => {
		try {
			const todos = await getAllTodos();
			return { todos };
		} catch (error) {
			console.error("Failed to load todos:", error);
			return { todos: [] };
		}
	},
	component: Home,
});

function Home() {
	return <TodoApp />;
}
