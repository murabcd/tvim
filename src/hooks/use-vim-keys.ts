import { useHotkeys } from "react-hotkeys-hook";

interface UseVimKeysProps {
	mode: "normal" | "insert" | "command" | "visual";
	onMoveUp: () => void;
	onMoveDown: () => void;
	onToggleTodo: () => void;
	onDeleteTodo: () => void;
	onGoToTop: () => void;
	onGoToBottom: () => void;
	onInsertMode: () => void;
	onInsertModeBelow: () => void;
	onInsertModeAbove: () => void;
	onAppendMode: () => void;
	onAppendModeEnd: () => void;
	onCommandMode: () => void;
	onEscape: () => void;
	onUndo: () => void;
	onRedo: () => void;
	onSelectAll: () => void;
	onDeleteLine: () => void;
	onYankTodo: () => void;
	onPasteTodo: () => void;
	onVisualMode: () => void;
	onVisualMoveUp: () => void;
	onVisualMoveDown: () => void;
	onVisualToggle: () => void;
	onVisualDelete: () => void;
}

export function useVimKeys({
	mode,
	onMoveUp,
	onMoveDown,
	onToggleTodo,
	onDeleteTodo,
	onGoToTop,
	onGoToBottom,
	onInsertMode,
	onInsertModeBelow,
	onInsertModeAbove,
	onAppendMode,
	onAppendModeEnd,
	onCommandMode,
	onEscape,
	onUndo,
	onRedo,
	onSelectAll,
	onDeleteLine,
	onYankTodo,
	onPasteTodo,
	onVisualMode,
	onVisualMoveUp,
	onVisualMoveDown,
	onVisualToggle,
	onVisualDelete,
}: UseVimKeysProps) {
	// === MODE SWITCHING ===
	// Insert modes
	useHotkeys("i", onInsertMode, {
		preventDefault: true,
		enabled: mode === "normal",
	});
	useHotkeys("shift+i", onInsertMode, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // Insert at beginning
	useHotkeys("o", onInsertModeBelow, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // Open line below
	useHotkeys("shift+o", onInsertModeAbove, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // Open line above
	useHotkeys("a", onAppendMode, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // Append after cursor
	useHotkeys("shift+a", onAppendModeEnd, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // Append at end of line

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
	useHotkeys("g+g", onGoToTop, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // gg - go to top
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
	useHotkeys("d+d", onDeleteLine, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // dd - delete line
	useHotkeys("shift+d", onDeleteTodo, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // D - delete to end
	useHotkeys("Delete", onDeleteTodo, {
		preventDefault: true,
		enabled: mode === "normal",
	});
	useHotkeys("Backspace", onDeleteTodo, {
		preventDefault: true,
		enabled: mode === "normal",
	});

	// Copy/Paste operations
	useHotkeys("y+y", onYankTodo, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // yy - yank line
	useHotkeys("y", onYankTodo, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // y - yank
	useHotkeys("p", onPasteTodo, {
		preventDefault: true,
		enabled: mode === "normal",
	}); // p - paste below
	useHotkeys("shift+p", onPasteTodo, {
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
	useHotkeys("d+d", onVisualDelete, {
		preventDefault: true,
		enabled: mode === "visual",
	});
}
