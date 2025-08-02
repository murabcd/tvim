import { useHotkeys } from "react-hotkeys-hook";

interface UseVimKeysProps {
	mode: "normal" | "insert" | "command" | "visual";
	onMoveUp: () => void;
	onMoveDown: () => void;
	onToggleTodo: () => void;
	onGoToTop: () => void;
	onGoToBottom: () => void;
	onInsertMode: () => void;
	onInsertModeBelow: () => void;
	onAppendMode: () => void;
	onCommandMode: () => void;
	onEscape: () => void;
	onUndo: () => void;
	onRedo: () => void;
	onSelectAll: () => void;
	onDeleteLine: () => void;
	onYankTodo: () => void;
	onPasteTodo: () => void;
	onPasteTodoAbove: () => void;
	onVisualMode: () => void;
	onVisualMoveUp: () => void;
	onVisualMoveDown: () => void;
	onVisualToggle: () => void;
	onVisualDelete: () => void;
	onHelp: () => void;
	onSortNewest: () => void;
	onSortOldest: () => void;
	onSortDueDate: () => void;
	onSortDueDateReverse: () => void;
	onToggleSort: () => void;
}

export function useVimKeys({
	mode,
	onMoveUp,
	onMoveDown,
	onToggleTodo,
	onGoToTop,
	onGoToBottom,
	onInsertMode,
	onInsertModeBelow,
	onAppendMode,
	onCommandMode,
	onEscape,
	onUndo,
	onRedo,
	onSelectAll,
	onDeleteLine,
	onYankTodo,
	onPasteTodo,
	onPasteTodoAbove,
	onVisualMode,
	onVisualMoveUp,
	onVisualMoveDown,
	onVisualToggle,
	onVisualDelete,
	onHelp,
	onSortNewest,
	onSortOldest,
	onSortDueDate,
	onSortDueDateReverse,
	onToggleSort,
}: UseVimKeysProps) {
	// === MODE SWITCHING ===
	// Insert modes
	useHotkeys("i", onInsertMode, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // Insert at cursor
	useHotkeys("o", onInsertModeBelow, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // Open line below (add new todo)
	useHotkeys("a", onAppendMode, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // Append at end

	// Command mode
	useHotkeys("shift+semicolon", onCommandMode, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // : command

	// Exit modes
	useHotkeys("escape", onEscape, {
		preventDefault: true,
		enabled: mode !== "normal",
	});
	useHotkeys("ctrl+c", onEscape, {
		preventDefault: true,
		enabled: mode !== "normal",
	});

	// === NAVIGATION ===
	// Basic movement
	useHotkeys("j", onMoveDown, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // Down
	useHotkeys("k", onMoveUp, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // Up
	useHotkeys("h", onMoveUp, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // Alternative up
	useHotkeys("l", onMoveDown, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // Alternative down

	// Arrow keys support
	useHotkeys("ArrowDown", onMoveDown, {
		preventDefault: true,
		enabled: mode === "normal",
	});
	useHotkeys("ArrowUp", onMoveUp, {
		preventDefault: true,
		enabled: mode === "normal",
	});

	// Jump navigation
	useHotkeys("g", onGoToTop, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // g - go to top (simplified)
	useHotkeys("shift+g", onGoToBottom, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // G - go to bottom

	// === TODO OPERATIONS ===
	// Toggle completion
	useHotkeys("space", onToggleTodo, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // Space - toggle
	useHotkeys("x", onToggleTodo, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // x - toggle (vim style)

	// Delete operations
	useHotkeys("d", onDeleteLine, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // d - delete line
	useHotkeys("Delete", onDeleteLine, {
		preventDefault: true,
		enabled: mode === "normal",
	});
	useHotkeys("Backspace", onDeleteLine, {
		preventDefault: true,
		enabled: mode === "normal",
	});

	// Copy/Paste operations
	useHotkeys("y", onYankTodo, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // y - yank
	useHotkeys("p", onPasteTodo, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // p - paste below
	useHotkeys("shift+p", onPasteTodoAbove, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // P - paste above

	// === UNDO/REDO ===
	useHotkeys("u", onUndo, { preventDefault: true, enabled: mode === "normal" }); // u - undo
	useHotkeys("ctrl+r", onRedo, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // Ctrl+r - redo

	// === VISUAL MODE ===
	// Enter visual mode
	useHotkeys("v", onVisualMode, {
		preventDefault: true,
		enabled: mode === "normal",
	});

	// Visual mode navigation
	useHotkeys("j", onVisualMoveDown, {
		preventDefault: true,
		enabled: mode === "visual",
	});
	useHotkeys("k", onVisualMoveUp, {
		preventDefault: true,
		enabled: mode === "visual",
	});

	// Visual mode operations
	useHotkeys("x", onVisualToggle, {
		preventDefault: true,
		enabled: mode === "visual",
	});
	useHotkeys("space", onVisualToggle, {
		preventDefault: true,
		enabled: mode === "visual",
	});
	useHotkeys("d", onVisualDelete, {
		preventDefault: true,
		enabled: mode === "visual",
	});

	// === HELP ===
	useHotkeys("F1", onHelp, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // F1 - help
	useHotkeys("shift+slash", onHelp, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // ? - help (vim style)

	// === SORT OPERATIONS ===
	useHotkeys("s", onToggleSort, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // s - toggle sort
	useHotkeys("1", onSortNewest, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // 1 - sort newest first
	useHotkeys("2", onSortOldest, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // 2 - sort oldest first
	useHotkeys("3", onSortDueDate, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // 3 - sort by due date (earliest first)
	useHotkeys("4", onSortDueDateReverse, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // 4 - sort by due date (latest first)
}
