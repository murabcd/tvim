import { createFileRoute } from "@tanstack/react-router";
import { TodoApp } from "@/components/todo-app";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return <TodoApp />;
}
