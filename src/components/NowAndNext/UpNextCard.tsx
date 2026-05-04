import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/TBR/ActionButton";
import { BookDescription } from "@/components/common/BookDescription";
import { CoverPlaceholder } from "@/components/TBR/CoverPlaceholder";
import { DeleteBookDialog } from "@/components/TBR/DeleteBookDialog";
import { MeetingDatePicker } from "@/components/common/MeetingDatePicker";
import {
	getCurrentlyReadingBook,
	markAsCurrentlyReading,
	markAsRead,
	markAsTBR,
} from "@/services/bookActions";
import type { Tables } from "@/lib/database.types";

interface UpNextCardProps {
	book: Tables<"books">;
	index: number;
	userId: string | null;
	meetingDate: Date | null;
	onDateChange: (date: Date) => void;
	onRemove: (bookId: string) => void;
	onStatusChange: (bookId: string) => void;
}

type DialogState = "confirmCurrent" | "conflict" | "confirmTBR" | null;

export function UpNextCard({
	book,
	index,
	userId,
	meetingDate,
	onDateChange,
	onRemove,
	onStatusChange,
}: UpNextCardProps) {
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

	async function handleMoveToCurrentlyReading() {
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
			setDialogState("confirmCurrent");
		}
	}

	async function handleConfirmCurrent() {
		setIsSubmitting(true);
		setError(null);
		const err = await markAsCurrentlyReading(book.id);
		setIsSubmitting(false);
		if (err) {
			setError(err);
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

	async function handleConfirmTBR() {
		setIsSubmitting(true);
		setError(null);
		const err = await markAsTBR(book.id);
		setIsSubmitting(false);
		if (err) {
			setError(err);
			return;
		}
		closeDialog();
		onStatusChange(book.id);
	}

	return (
		<div className="relative flex gap-4 p-4 border border-(--spooky-border) bg-(--spooky-surface)/40 rounded-sm overflow-hidden max-sm:flex-col max-sm:items-center">
			{/* Decorative queue number */}
			<span className="absolute top-2 right-3 font-section text-5xl font-semibold text-(--spooky-crimson)/45 leading-none select-none pointer-events-none">
				{String(index + 1).padStart(2, "0")}
			</span>

			{/* Cover */}
			<div className="shrink-0 md:self-start">
				{book.cover_url ? (
					<img
						src={book.cover_url}
						alt={book.title}
						className="w-auto rounded object-cover"
						style={{ boxShadow: "0 4px 12px -4px var(--spooky-crimson)" }}
					/>
				) : (
					<CoverPlaceholder className="w-16 h-24 rounded" />
				)}
			</div>

			{/* Content */}
			<div className="flex flex-col flex-1 min-w-0 gap-1">
				<span className="font-display font-semibold text-sm leading-snug text-(--spooky-parchment)">
					{book.title}
				</span>
				<span className="text-xs text-(--spooky-dust)">{book.author}</span>

				{book.description && (
					<div className="mt-1">
						<BookDescription
							description={book.description}
							pageCount={book.page_count}
							truncateAtChars={300}
						/>
					</div>
				)}

				{/* Meeting date */}
				<div className="mt-1">
					<p className="text-(--spooky-crimson) font-section uppercase tracking-wide py-2">
						yap session:
					</p>
					<MeetingDatePicker
						date={meetingDate}
						onChange={userId ? onDateChange : undefined}
					/>
				</div>

				{/* Actions */}
				{userId && (
					<div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-(--spooky-border)">
						<ActionButton
							onClick={handleMoveToCurrentlyReading}
							disabled={isChecking}
							className="text-xs"
						>
							→ Currently Reading
						</ActionButton>
						<ActionButton
							onClick={() => setDialogState("confirmTBR")}
							className="text-xs"
						>
							← Back to TBR
						</ActionButton>
						<DeleteBookDialog
							bookId={book.id}
							bookTitle={book.title}
							onDelete={onRemove}
							triggerWidth="auto"
						/>
					</div>
				)}
			</div>

			{/* Dialogs */}
			<Dialog
				open={dialogState !== null}
				onOpenChange={(next) => {
					if (!next) closeDialog();
				}}
			>
				<DialogContent className="max-w-sm border-(--spooky-border) bg-(--spooky-surface) text-(--spooky-parchment) shadow-2xl shadow-black/70">
					{dialogState === "confirmCurrent" && (
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
									onClick={handleConfirmCurrent}
									disabled={isSubmitting}
									className="bg-(--spooky-crimson) hover:bg-(--spooky-crimson)/80 text-(--spooky-parchment) border border-(--spooky-crimson)/60 transition-all duration-150 disabled:opacity-50"
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
							{error && <p className="text-xs text-red-400/80">{error}</p>}
							<div className="flex flex-col gap-2">
								<Button
									onClick={handleReplace}
									disabled={isSubmitting}
									className="bg-(--spooky-crimson) hover:bg-(--spooky-crimson)/80 text-(--spooky-parchment) border border-(--spooky-crimson)/60 transition-all duration-150 disabled:opacity-50"
								>
									{isSubmitting
										? "Saving…"
										: `Mark ${existingBook.title} as read & start ${book.title}`}
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

					{dialogState === "confirmTBR" && (
						<>
							<DialogHeader>
								<DialogTitle className="font-display text-base tracking-wide text-(--spooky-parchment)">
									Move back to TBR?
								</DialogTitle>
								<DialogDescription className="text-(--spooky-dust) text-sm">
									<span className="text-(--spooky-parchment) font-semibold">
										{book.title}
									</span>{" "}
									will be moved back to your TBR list.
								</DialogDescription>
							</DialogHeader>
							{error && <p className="text-xs text-red-400/80">{error}</p>}
							<div className="flex flex-col gap-2">
								<Button
									onClick={handleConfirmTBR}
									disabled={isSubmitting}
									className="bg-(--spooky-crimson) hover:bg-(--spooky-crimson)/80 text-(--spooky-parchment) border border-(--spooky-crimson)/60 transition-all duration-150 disabled:opacity-50"
								>
									{isSubmitting ? "Saving…" : "Yup"}
								</Button>
								<Button
									variant="outline"
									onClick={closeDialog}
									disabled={isSubmitting}
									className="text-(--spooky-dust) hover:text-(--spooky-parchment) hover:bg-(--spooky-border)/40"
								>
									Cancel
								</Button>
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
