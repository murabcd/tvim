import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface HelpModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[100vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Help</DialogTitle>
				</DialogHeader>
				<div className="space-y-6 text-sm">
					<div>
						<h3 className="font-semibold text-foreground mb-2">Navigation</h3>
						<div className="grid grid-cols-2 gap-2 text-muted-foreground">
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">j</kbd> /{" "}
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">k</kbd> -
								Move down/up
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">↑</kbd> /{" "}
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">↓</kbd> -
								Arrow keys
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">g</kbd> /{" "}
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">G</kbd> -
								Go to top/bottom
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">h</kbd> /{" "}
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">l</kbd> -
								Alt navigation
							</div>
						</div>
					</div>

					<div>
						<h3 className="font-semibold text-foreground mb-2">Insert Mode</h3>
						<div className="grid grid-cols-2 gap-2 text-muted-foreground">
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">i</kbd> -
								Insert at cursor
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">a</kbd> -
								Append at end
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">o</kbd> -
								New line below
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">ESC</kbd>{" "}
								- Exit insert mode
							</div>
						</div>
					</div>

					<div>
						<h3 className="font-semibold text-foreground mb-2">
							Edit Operations
						</h3>
						<div className="grid grid-cols-2 gap-2 text-muted-foreground">
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">x</kbd> /{" "}
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
									Space
								</kbd>{" "}
								- Toggle todo
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">d</kbd> -
								Delete line
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">u</kbd> -
								Undo
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
									Ctrl+r
								</kbd>{" "}
								- Redo
							</div>
						</div>
					</div>

					<div>
						<h3 className="font-semibold text-foreground mb-2">Copy & Paste</h3>
						<div className="grid grid-cols-2 gap-2 text-muted-foreground">
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">y</kbd> -
								Yank (copy)
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">p</kbd> -
								Paste below
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">P</kbd> -
								Paste above
							</div>
						</div>
					</div>

					<div>
						<h3 className="font-semibold text-foreground mb-2">Visual Mode</h3>
						<div className="grid grid-cols-2 gap-2 text-muted-foreground">
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">v</kbd> -
								Enter visual mode
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">j/k</kbd>{" "}
								- Move selection
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">x</kbd> -
								Toggle selected
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">d</kbd> -
								Delete selected
							</div>
						</div>
					</div>

					<div>
						<h3 className="font-semibold text-foreground mb-2">Commands</h3>
						<div className="space-y-2 text-muted-foreground">
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
									Shift + ;
								</kbd>{" "}
								- Enter command mode
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
									:add &lt;text&gt;
								</kbd>{" "}
								- Add new todo
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
									:due &lt;date&gt; &lt;text&gt;
								</kbd>{" "}
								- Add todo with due date
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
									:set-due &lt;date&gt;
								</kbd>{" "}
								- Set due date for selected todo
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
									:remove-due
								</kbd>{" "}
								- Remove due date from selected todo
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
									:help
								</kbd>{" "}
								- Show this help
							</div>
						</div>
					</div>

					<div>
						<h3 className="font-semibold text-foreground mb-2">
							Due Date Formats
						</h3>
						<div className="space-y-2 text-muted-foreground">
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
									today
								</kbd>{" "}
								/{" "}
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
									tomorrow
								</kbd>{" "}
								/{" "}
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
									next week
								</kbd>
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
									monday
								</kbd>{" "}
								/{" "}
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">fri</kbd>{" "}
								/{" "}
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">sun</kbd>
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
									2024-01-15
								</kbd>{" "}
								/{" "}
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
									01/15/2024
								</kbd>
							</div>
						</div>
					</div>

					<div>
						<h3 className="font-semibold text-foreground mb-2">Sorting</h3>
						<div className="space-y-2 text-muted-foreground">
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">s</kbd> -
								Toggle sort
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">1</kbd> -
								Sort by newest first
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">2</kbd> -
								Sort by oldest first
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">3</kbd> -
								Sort by due date (earliest)
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">4</kbd> -
								Sort by due date (latest)
							</div>
						</div>
					</div>

					<div>
						<h3 className="font-semibold text-foreground mb-2">Help</h3>
						<div className="space-y-2 text-muted-foreground">
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">F1</kbd> -
								Open help
							</div>
							<div>
								<kbd className="px-1 py-0.5 bg-muted rounded text-xs">?</kbd> -
								Open help (vim style)
							</div>
						</div>
					</div>

					<div className="pt-4 border-t border-border">
						<p className="text-xs text-muted-foreground">
							Press{" "}
							<kbd className="px-1 py-0.5 bg-muted rounded text-xs">ESC</kbd> or
							click outside to close
						</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
