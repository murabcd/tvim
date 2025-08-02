import { createServerFn } from "@tanstack/react-start";
import { nanoid } from "nanoid";
import { eq, desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { todos } from "@/lib/schema";

export const getAllTodos = createServerFn().handler(async () => {
	try {
		// For now, return all todos since we're handling user-specific filtering on the client side
		// This allows the app to work with local storage when not authenticated
		const result = await db.select().from(todos);

		return result.map((todo) => ({
			id: todo.id,
			userId: todo.userId,
			text: todo.text,
			completed: todo.completed,
			dueDate: todo.dueDate,
			created: todo.created,
		}));
	} catch (error) {
		console.error("Error fetching todos:", error);
		return [];
	}
});

export const createTodo = createServerFn()
	.validator((data: { text: string; dueDate?: string }) => data)
	.handler(async ({ data }) => {
		try {
			// Create todo without user_id for now
			// User-specific filtering will be handled on the client side
			const [newTodo] = await db
				.insert(todos)
				.values({
					id: nanoid(),
					text: data.text.trim(),
					completed: false,
					dueDate: data.dueDate ? new Date(data.dueDate) : null,
				})
				.returning();

			return {
				id: newTodo.id,
				userId: newTodo.userId,
				text: newTodo.text,
				completed: newTodo.completed,
				dueDate: newTodo.dueDate,
				created: newTodo.created,
			};
		} catch (error) {
			console.error("Error creating todo:", error);
			throw error;
		}
	});

export const updateTodo = createServerFn()
	.validator(
		(data: { id: string; completed?: boolean; dueDate?: string | null }) =>
			data,
	)
	.handler(async ({ data }) => {
		try {
			const updateData: any = {
				updated: new Date(),
			};

			if (data.completed !== undefined) {
				updateData.completed = data.completed;
			}

			if ("dueDate" in data) {
				updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
			}

			const [updatedTodo] = await db
				.update(todos)
				.set(updateData)
				.where(eq(todos.id, data.id))
				.returning();

			const result = {
				id: updatedTodo.id,
				userId: updatedTodo.userId,
				text: updatedTodo.text,
				completed: updatedTodo.completed,
				dueDate: updatedTodo.dueDate,
				created: updatedTodo.created,
			};

			return result;
		} catch (error) {
			console.error("Error updating todo:", error);
			throw error;
		}
	});

export const deleteTodo = createServerFn()
	.validator((id: string) => id)
	.handler(async ({ data: id }) => {
		try {
			await db.delete(todos).where(eq(todos.id, id));
		} catch (error) {
			console.error("Error deleting todo:", error);
			throw error;
		}
	});

export const clearAllTodos = createServerFn().handler(async () => {
	try {
		await db.delete(todos);
	} catch (error) {
		console.error("Error clearing todos:", error);
		throw error;
	}
});
