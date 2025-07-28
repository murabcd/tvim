import { createServerFn } from "@tanstack/react-start";

import { eq, desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { todos } from "@/lib/schema";

export const getAllTodos = createServerFn().handler(async () => {
	const result = await db.select().from(todos).orderBy(desc(todos.created));

	return result.map((todo) => ({
		id: todo.id,
		text: todo.text,
		completed: todo.completed,
		created: todo.created,
	}));
});

export const createTodo = createServerFn()
	.validator((text: string) => text)
	.handler(async ({ data: text }) => {
		const [newTodo] = await db
			.insert(todos)
			.values({
				text: text.trim(),
				completed: false,
			})
			.returning();

		return {
			id: newTodo.id,
			text: newTodo.text,
			completed: newTodo.completed,
			created: newTodo.created,
		};
	});

export const updateTodo = createServerFn()
	.validator((data: { id: number; completed: boolean }) => data)
	.handler(async ({ data }) => {
		await db
			.update(todos)
			.set({
				completed: data.completed,
				updated: new Date(),
			})
			.where(eq(todos.id, data.id));
	});

export const deleteTodo = createServerFn()
	.validator((id: number) => id)
	.handler(async ({ data: id }) => {
		await db.delete(todos).where(eq(todos.id, id));
	});

export const clearAllTodos = createServerFn().handler(async () => {
	await db.delete(todos);
});
