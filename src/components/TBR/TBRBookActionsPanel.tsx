import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { ActionButton } from "./ActionButton";
import {
	getCurrentlyReadingBook,
	markAsCurrentlyReading,
	markAsRead,
	markAsOnDeck,
} from "@/services/bookActions";
import { DeleteBookDialog } from "./DeleteBookDialog";
import type { Tables } from "@/lib/database.types";

interface TBRBookActionsPanelProps {
	book: Tables<"books">;
	userId: string | null;
	onDelete: (bookId: string) => void;
	onStatusChange: (bookId: string) => void;
}

type DialogState = "confirm" | "conflict" | null;

export function TBRBookActionsPanel({
	book,
	userId,
	onDelete,
	onStatusChange,
}: TBRBookActionsPanelProps) {
	const [dialogState, setDialogState] = useState<DialogState>(null);
	const [existingBook, setExistingBook] = useState<{
		id: string;
		title: string;
	} | null>(null);
	const [isChecking, setIsChecking] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function closeDialog() {
		setDialogState(null);
		setExistingBook(null);
		setError(null);
	}

	async function handleCurrentlyReadingClick() {
		setIsChecking(true);
		setError(null);

		const { data: existing, error } = await getCurrentlyReadingBook();

		setIsChecking(false);

		if (error) {
			setError(error);
			return;
		}

		if (existing) {
			setExistingBook(existing);
			setDialogState("conflict");
		} else {
			setDialogState("confirm");
		}
	}

	async function handleConfirm() {
		setIsSubmitting(true);
		setError(null);

		const error = await markAsCurrentlyReading(book.id);

		setIsSubmitting(false);

		if (error) {
			setError(error);
			return;
		}

		closeDialog();
		onStatusChange(book.id);
	}

	async function handleReplace() {
		if (!existingBook) return;
		setIsSubmitting(true);
		setError(null);

		const [finishError, startError] = await Promise.all([
			markAsRead(existingBook.id),
			markAsCurrentlyReading(book.id),
		]);

		setIsSubmitting(false);

		if (finishError || startError) {
			setError("Failed to update. Please try again.");
			return;
		}

		closeDialog();
		onStatusChange(book.id);
	}

	async function handleAddToUpNext() {
		setIsSubmitting(true);
		setError(null);

		const error = await markAsOnDeck(book.id);

		setIsSubmitting(false);

		if (error) {
			setError(error);
			return;
		}

		closeDialog();
		onStatusChange(book.id);
	}

	const currentlyReadingButton = (
		<ActionButton>+ Currently Reading</ActionButton>
	);

	return (
		<div className="flex flex-col gap-2">
			<div className="grid grid-cols-2 gap-2 md:grid-cols-1">
				{userId ? (
					<>
						<ActionButton
							onClick={handleCurrentlyReadingClick}
							disabled={isChecking}
						>
							+ Currently Reading
						</ActionButton>

						<Dialog
							open={dialogState !== null}
							onOpenChange={(next) => {
								if (!next) closeDialog();
							}}
						>
							<DialogContent className="max-w-sm border-(--spooky-border) bg-(--spooky-surface) text-(--spooky-parchment) shadow-2xl shadow-black/70">
								{dialogState === "confirm" && (
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
										{error && (
											<p className="text-xs text-red-400/80">{error}</p>
										)}
										<div className="flex flex-col gap-2">
											<Button
												onClick={handleConfirm}
												disabled={isSubmitting}
												className="bg-(--spooky-crimson) hover:bg-(--spooky-crimson)/80 text-(--spooky-parchment) border border-(--spooky-crimson)/60 hover:border-(--spooky-crimson) transition-all duration-150 disabled:opacity-50"
											>
												{isSubmitting ? "Saving…" : "Fuck yeah!"}
											</Button>
											<Button
												variant="outline"
												onClick={closeDialog}
												disabled={isSubmitting}
												className="text-(--spooky-dust) hover:text-(--spooky-parchment) hover:bg-(--spooky-border)/40"
											>
												Oops, not yet
											</Button>
										</div>
									</>
								)}

								{dialogState === "conflict" && existingBook && (
									<>
										<DialogHeader>
											<DialogTitle className="font-sans uppercase font-light text-xs tracking-widest text-(--spooky-crimson) text-center">
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
										{error && (
											<p className="text-xs text-red-400/80">{error}</p>
										)}
										<div className="flex flex-col gap-2">
											<Button
												onClick={handleReplace}
												disabled={isSubmitting}
												className="bg-(--spooky-crimson) hover:bg-(--spooky-crimson)/80 text-(--spooky-parchment) border border-(--spooky-crimson)/60 hover:border-(--spooky-crimson) transition-all duration-150 disabled:opacity-50"
											>
												{isSubmitting
													? "Saving…"
													: `Mark ${existingBook.title} as read & start ${book.title}`}
											</Button>
											<Button
												onClick={handleAddToUpNext}
												disabled={isSubmitting}
												className="bg-(--spooky-surface) hover:bg-(--spooky-border)/40 text-(--spooky-parchment) border border-(--spooky-border) transition-all duration-150 disabled:opacity-50"
											>
												{isSubmitting ? "Saving…" : "Add to Up Next instead"}
											</Button>
											<Button
												variant="outline"
												onClick={closeDialog}
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
					</>
				) : (
					<AuthModal action="mark a book as currently reading">
						{currentlyReadingButton}
					</AuthModal>
				)}

				{userId ? (
						<ActionButton
							onClick={handleAddToUpNext}
							disabled={isSubmitting}
						>
							+ Up Next
						</ActionButton>
					) : (
						<AuthModal action="add a book to Up Next">
							<ActionButton>+ Up Next</ActionButton>
						</AuthModal>
					)}
			</div>
			<div className="flex">
				<DeleteBookDialog
					bookId={book.id}
					bookTitle={book.title}
					onDelete={onDelete}
				/>
			</div>
		</div>
	);
}
