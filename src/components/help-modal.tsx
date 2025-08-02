import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

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
				<Accordion
					type="multiple"
					className="w-full"
					defaultValue={[
						"navigation",
						"insert-mode",
						"edit-operations",
						"copy-paste",
						"visual-mode",
					]}
				>
					<AccordionItem value="navigation">
						<AccordionTrigger>Navigation</AccordionTrigger>
						<AccordionContent>
							<div className="grid grid-cols-2 gap-2 text-muted-foreground">
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">j</kbd>{" "}
									/{" "}
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">k</kbd>{" "}
									- Move down/up
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">↑</kbd>{" "}
									/{" "}
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">↓</kbd>{" "}
									- Arrow keys
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">g</kbd>{" "}
									/{" "}
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">G</kbd>{" "}
									- Go to top/bottom
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">h</kbd>{" "}
									/{" "}
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">l</kbd>{" "}
									- Alt navigation
								</div>
							</div>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="insert-mode">
						<AccordionTrigger>Insert Mode</AccordionTrigger>
						<AccordionContent>
							<div className="grid grid-cols-2 gap-2 text-muted-foreground">
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">i</kbd>{" "}
									- Insert at cursor
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">a</kbd>{" "}
									- Append at end
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">o</kbd>{" "}
									- New line below
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
										ESC
									</kbd>{" "}
									- Exit insert mode
								</div>
							</div>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="edit-operations">
						<AccordionTrigger>Edit Operations</AccordionTrigger>
						<AccordionContent>
							<div className="grid grid-cols-2 gap-2 text-muted-foreground">
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">x</kbd>{" "}
									/{" "}
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
										Space
									</kbd>{" "}
									- Toggle todo
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">d</kbd>{" "}
									- Delete line
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">u</kbd>{" "}
									- Undo
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
										Ctrl+r
									</kbd>{" "}
									- Redo
								</div>
							</div>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="copy-paste">
						<AccordionTrigger>Copy & Paste</AccordionTrigger>
						<AccordionContent>
							<div className="grid grid-cols-2 gap-2 text-muted-foreground">
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">y</kbd>{" "}
									- Yank (copy)
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">p</kbd>{" "}
									- Paste below
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">P</kbd>{" "}
									- Paste above
								</div>
							</div>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="visual-mode">
						<AccordionTrigger>Visual Mode</AccordionTrigger>
						<AccordionContent>
							<div className="grid grid-cols-2 gap-2 text-muted-foreground">
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">v</kbd>{" "}
									- Enter visual mode
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
										j/k
									</kbd>{" "}
									- Move selection
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">x</kbd>{" "}
									- Toggle selected
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">d</kbd>{" "}
									- Delete selected
								</div>
							</div>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="commands">
						<AccordionTrigger>Commands</AccordionTrigger>
						<AccordionContent>
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
										:tag &lt;tag&gt;
									</kbd>{" "}
									- Add tag to selected todo
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
										:untag &lt;tag&gt;
									</kbd>{" "}
									- Remove tag from selected todo
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
										:filter &lt;tag&gt;
									</kbd>{" "}
									- Filter todos by tag
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
										:clear-filter
									</kbd>{" "}
									- Clear tag filter
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
										:toggle-completed
									</kbd>{" "}
									- Show/hide completed todos
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
										:sort-newest
									</kbd>{" "}
									- Sort by newest first
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
										:sort-oldest
									</kbd>{" "}
									- Sort by oldest first
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
										:sort-due-earliest
									</kbd>{" "}
									- Sort by due date (earliest first)
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
										:sort-due-latest
									</kbd>{" "}
									- Sort by due date (latest first)
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
										:sort-none
									</kbd>{" "}
									- Remove sorting
								</div>
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
										:help
									</kbd>{" "}
									- Show this help
								</div>
							</div>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="help">
						<AccordionTrigger>Help</AccordionTrigger>
						<AccordionContent>
							<div className="space-y-2 text-muted-foreground">
								<div>
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">
										Shift + ?
									</kbd>{" "}
									/{" "}
									<kbd className="px-1 py-0.5 bg-muted rounded text-xs">F1</kbd>{" "}
									- Open help
								</div>
							</div>
						</AccordionContent>
					</AccordionItem>
				</Accordion>

				<div className="pt-4 border-t border-border">
					<p className="text-xs text-muted-foreground">
						Press{" "}
						<kbd className="px-1 py-0.5 bg-muted rounded text-xs">ESC</kbd> or
						click outside to close
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
