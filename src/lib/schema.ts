import { pgTable, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
export * from "../../auth-schema";

export const todos = pgTable(
	"todos",
	{
		id: text("id").primaryKey(),
		userId: text("user_id"),
		text: text("text").notNull(),
		completed: boolean("completed").default(false).notNull(),
		created: timestamp("created").defaultNow().notNull(),
		updated: timestamp("updated").defaultNow().notNull(),
	},
	(table) => ({
		userIdIdx: index("todos_user_id_idx").on(table.userId),
	}),
);

export interface Todo {
	id: string;
	userId?: string;
	text: string;
	completed: boolean;
	created: Date;
}

export interface AppState {
	todos: Todo[];
	selectedIndex: number;
}
