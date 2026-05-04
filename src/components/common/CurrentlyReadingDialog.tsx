import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CurrentlyReadingFlowState } from "@/hooks/useCurrentlyReadingFlow";

interface CurrentlyReadingDialogProps {
	book: { id: string; title: string };
	flowState: CurrentlyReadingFlowState;
	existingBook: { id: string; title: string } | null;
	isSubmitting: boolean;
	error: string | null;
	onConfirm: () => void;
	onReplace: () => void;
	onClose: () => void;
	/** When provided, renders an "Add to Up Next instead" option in the conflict dialog. */
	onAddToUpNext?: () => void;
}

export function CurrentlyReadingDialog({
	book,
	flowState,
	existingBook,
	isSubmitting,
	error,
	onConfirm,
	onReplace,
	onClose,
	onAddToUpNext,
}: CurrentlyReadingDialogProps) {
	return (
		<Dialog
			open={flowState !== null}
			onOpenChange={(next) => {
				if (!next) onClose();
			}}
		>
			<DialogContent className="max-w-sm border-(--spooky-border) bg-(--spooky-surface) text-(--spooky-parchment) shadow-2xl shadow-black/70">
				{flowState === "confirm" && (
					<>
						<DialogHeader>
							<DialogTitle className="font-display text-base tracking-wide text-(--spooky-parchment)">
								Start reading?
							</DialogTitle>
							<DialogDescription className="text-(--spooky-dust) text-sm">
								Mark{" "}
								<span className="text-(--spooky-parchment) font-semibold">
									{book.title}
								</span>{" "}
								as currently reading?
							</DialogDescription>
						</DialogHeader>
						{error && <p className="text-xs text-red-400/80">{error}</p>}
						<div className="flex flex-col gap-2">
							<Button
								onClick={onConfirm}
								disabled={isSubmitting}
								className="bg-(--spooky-crimson) hover:bg-(--spooky-crimson)/80 text-(--spooky-parchment) border border-(--spooky-crimson)/60 transition-all duration-150 disabled:opacity-50"
							>
								{isSubmitting ? "Saving…" : "Fuck yeah!"}
							</Button>
							<Button
								variant="outline"
								onClick={onClose}
								disabled={isSubmitting}
								className="text-(--spooky-dust) hover:text-(--spooky-parchment) hover:bg-(--spooky-border)/40"
							>
								Oops, not yet
							</Button>
						</div>
					</>
				)}

				{flowState === "conflict" && existingBook && (
					<>
						<DialogHeader>
							<DialogTitle className="font-sans uppercase text-xs tracking-widest text-(--spooky-crimson) text-center">
								Now wait just one goddamn minute
							</DialogTitle>
							<DialogDescription className="text-(--spooky-dust) text-sm">
								<span className="text-(--spooky-parchment) font-semibold">
									{existingBook.title}
								</span>{" "}
								is currently being read. What do you want to do with{" "}
								<span className="text-(--spooky-parchment) font-semibold">
									{book.title}
								</span>
								?
							</DialogDescription>
						</DialogHeader>
						{error && <p className="text-xs text-red-400/80">{error}</p>}
						<div className="flex flex-col gap-2">
							<Button
								onClick={onReplace}
								disabled={isSubmitting}
								className="bg-(--spooky-crimson) hover:bg-(--spooky-crimson)/80 text-(--spooky-parchment) border border-(--spooky-crimson)/60 transition-all duration-150 disabled:opacity-50 whitespace-normal h-auto py-2"
							>
								{isSubmitting
									? "Saving…"
									: `Mark ${existingBook.title} as read & start ${book.title}`}
							</Button>
							{onAddToUpNext && (
								<Button
									onClick={onAddToUpNext}
									disabled={isSubmitting}
									className="bg-(--spooky-surface) hover:bg-(--spooky-border)/40 text-(--spooky-parchment) border border-(--spooky-border) transition-all duration-150 disabled:opacity-50"
								>
									{isSubmitting ? "Saving…" : "Add to Up Next instead"}
								</Button>
							)}
							<Button
								variant="outline"
								onClick={onClose}
								disabled={isSubmitting}
								className="text-(--spooky-dust) hover:text-(--spooky-parchment) hover:bg-(--spooky-border)/40"
							>
								Never mind
							</Button>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
