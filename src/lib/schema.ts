import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";
// Import Better Auth schema
export * from "../../auth-schema";

export const todos = pgTable("todos", {
	id: text("id").primaryKey(),
	text: text("text").notNull(),
	completed: boolean("completed").default(false).notNull(),
	created: timestamp("created").defaultNow().notNull(),
	updated: timestamp("updated").defaultNow().notNull(),
});

export interface Todo {
	id: string;
	text: string;
	completed: boolean;
	created: Date;
}

export interface AppState {
	todos: Todo[];
	selectedIndex: number;
}
