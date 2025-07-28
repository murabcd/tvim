import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const todos = pgTable("todos", {
	id: serial("id").primaryKey(),
	text: text("text").notNull(),
	completed: boolean("completed").default(false).notNull(),
	created: timestamp("created").defaultNow().notNull(),
	updated: timestamp("updated").defaultNow().notNull(),
});

export interface Todo {
	id: number;
	text: string;
	completed: boolean;
	created: Date;
}

export interface AppState {
	todos: Todo[];
	selectedIndex: number;
}
