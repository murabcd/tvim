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