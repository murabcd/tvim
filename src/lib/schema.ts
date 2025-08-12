import {
	pgTable,
	text,
	boolean,
	timestamp,
	index,
	integer,
} from "drizzle-orm/pg-core";
export * from "../../auth-schema";

export const todos = pgTable(
	"todos",
	{
		id: text("id").primaryKey(),
		userId: text("user_id"),
		text: text("text").notNull(),
		completed: boolean("completed").default(false).notNull(),
		dueDate: timestamp("due_date"),
		tags: text("tags"),
		order: integer("order"),
		created: timestamp("created").defaultNow().notNull(),
		updated: timestamp("updated").defaultNow().notNull(),
	},
	(table) => [index("todos_user_id_idx").on(table.userId)],
);

export interface Todo {
	id: string;
	userId?: string;
	text: string;
	completed: boolean;
	dueDate?: Date | null;
	tags?: string;
	order?: number;
	created: Date;
}

export interface AppState {
	todos: Todo[];
	selectedIndex: number;
}
