import { createServerFn } from "@tanstack/react-start";
import { nanoid } from "nanoid";
import { eq, asc } from "drizzle-orm";

import { db } from "@/lib/db";
import { todos } from "@/lib/schema";

export const getAllTodos = createServerFn().handler(async () => {
	try {
		// Return todos ordered by creation date (oldest first) so new todos stay at the bottom by default
		const result = await db.select().from(todos).orderBy(asc(todos.created));

		return result.map((todo) => ({
			id: todo.id,
			userId: todo.userId,
			text: todo.text,
			completed: todo.completed,
			dueDate: todo.dueDate,
			tags: todo.tags,
			created: todo.created,
		}));
	} catch (error) {
		console.error("Error fetching todos:", error);
		return [];
	}
});

export const createTodo = createServerFn()
	.validator((data: { text: string; dueDate?: string; tags?: string }) => data)
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
					tags: data.tags,
				})
				.returning();

			return {
				id: newTodo.id,
				userId: newTodo.userId,
				text: newTodo.text,
				completed: newTodo.completed,
				dueDate: newTodo.dueDate,
				tags: newTodo.tags,
				created: newTodo.created,
			};
		} catch (error) {
			console.error("Error creating todo:", error);
			throw error;
		}
	});

export const updateTodo = createServerFn()
	.validator(
		(data: {
			id: string;
			completed?: boolean;
			dueDate?: string | null;
			tags?: string;
		}) => data,
	)
	.handler(async ({ data }) => {
		try {
			const updateData: {
				updated: Date;
				completed?: boolean;
				dueDate?: Date | null;
				tags?: string;
			} = {
				updated: new Date(),
			};

			if (data.completed !== undefined) {
				updateData.completed = data.completed;
			}

			if ("dueDate" in data) {
				updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
			}

			if ("tags" in data) {
				updateData.tags = data.tags;
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
				tags: updatedTodo.tags,
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
