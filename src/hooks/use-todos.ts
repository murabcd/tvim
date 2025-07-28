import { useState, useCallback, useRef } from 'react';
import type { Todo, AppState } from '../types';

export function useTodos() {
  const [state, setState] = useState<AppState>({
    todos: [],
    selectedIndex: 0,
  });
  
  const [history, setHistory] = useState<Todo[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const clipboardRef = useRef<Todo | null>(null);

  const saveToHistory = useCallback((todos: Todo[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push([...todos]);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const addTodo = useCallback((text: string, position?: 'below' | 'above') => {
    setState(prev => {
      saveToHistory(prev.todos);
      const newTodo: Todo = {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        created: new Date(),
      };
      
      let newTodos: Todo[];
      let newSelectedIndex: number;
      
      if (position === 'above') {
        newTodos = [
          ...prev.todos.slice(0, prev.selectedIndex),
          newTodo,
          ...prev.todos.slice(prev.selectedIndex)
        ];
        newSelectedIndex = prev.selectedIndex;
      } else if (position === 'below') {
        newTodos = [
          ...prev.todos.slice(0, prev.selectedIndex + 1),
          newTodo,
          ...prev.todos.slice(prev.selectedIndex + 1)
        ];
        newSelectedIndex = prev.selectedIndex + 1;
      } else {
        newTodos = [...prev.todos, newTodo];
        newSelectedIndex = prev.selectedIndex;
      }
      
      return {
        ...prev,
        todos: newTodos,
        selectedIndex: newSelectedIndex,
      };
    });
  }, [saveToHistory]);

  const deleteTodo = useCallback((index: number) => {
    setState(prev => {
      saveToHistory(prev.todos);
      return {
        ...prev,
        todos: prev.todos.filter((_, i) => i !== index),
        selectedIndex: Math.max(0, Math.min(prev.selectedIndex, prev.todos.length - 2)),
      };
    });
  }, [saveToHistory]);

  const toggleTodo = useCallback((index: number) => {
    setState(prev => {
      saveToHistory(prev.todos);
      return {
        ...prev,
        todos: prev.todos.map((todo, i) => 
          i === index ? { ...todo, completed: !todo.completed } : todo
        ),
      };
    });
  }, [saveToHistory]);

  const moveSelection = useCallback((direction: 'up' | 'down') => {
    setState(prev => {
      const newIndex = direction === 'up' 
        ? Math.max(0, prev.selectedIndex - 1)
        : Math.min(prev.todos.length - 1, prev.selectedIndex + 1);
      return { ...prev, selectedIndex: newIndex };
    });
  }, []);

  const goToTop = useCallback(() => {
    setState(prev => ({ ...prev, selectedIndex: 0 }));
  }, []);

  const goToBottom = useCallback(() => {
    setState(prev => ({ ...prev, selectedIndex: Math.max(0, prev.todos.length - 1) }));
  }, []);

  const saveTodos = useCallback(() => {
    localStorage.setItem('tvim-todos', JSON.stringify(state.todos));
  }, [state.todos]);

  const loadTodos = useCallback(() => {
    const saved = localStorage.getItem('tvim-todos');
    if (saved) {
      const todos = JSON.parse(saved);
      setState(prev => ({ ...prev, todos }));
    }
  }, []);

  const clearTodos = useCallback(() => {
    saveToHistory(state.todos);
    setState(prev => ({ ...prev, todos: [] }));
  }, [saveToHistory, state.todos]);

  // New vim operations
  const yankTodo = useCallback(() => {
    if (state.todos[state.selectedIndex]) {
      clipboardRef.current = { ...state.todos[state.selectedIndex] };
    }
  }, [state.todos, state.selectedIndex]);

  const pasteTodo = useCallback(() => {
    if (clipboardRef.current) {
      const newTodo = {
        ...clipboardRef.current,
        id: Date.now(),
        created: new Date(),
      };
      setState(prev => {
        saveToHistory(prev.todos);
        return {
          ...prev,
          todos: [
            ...prev.todos.slice(0, prev.selectedIndex + 1),
            newTodo,
            ...prev.todos.slice(prev.selectedIndex + 1)
          ],
        };
      });
    }
  }, [saveToHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setState(prev => ({ ...prev, todos: [...previousState] }));
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setState(prev => ({ ...prev, todos: [...nextState] }));
      setHistoryIndex(prev => prev + 1);
    }
  }, [history, historyIndex]);

  const selectAll = useCallback(() => {
    // In a todo app, this could mark all as selected or toggle all completion
    setState(prev => {
      saveToHistory(prev.todos);
      const allCompleted = prev.todos.every(todo => todo.completed);
      return {
        ...prev,
        todos: prev.todos.map(todo => ({ ...todo, completed: !allCompleted })),
      };
    });
  }, [saveToHistory]);

  return {
    state,
    addTodo,
    deleteTodo,
    toggleTodo,
    moveSelection,
    goToTop,
    goToBottom,
    saveTodos,
    loadTodos,
    clearTodos,
    yankTodo,
    pasteTodo,
    undo,
    redo,
    selectAll,
  };
}