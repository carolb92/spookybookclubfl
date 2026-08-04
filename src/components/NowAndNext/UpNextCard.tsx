import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { CurrentlyReadingDialog } from "@/components/common/CurrentlyReadingDialog";
import { useCurrentlyReadingFlow } from "@/hooks/useCurrentlyReadingFlow";
import { markAsTBR } from "@/services/bookActions";
import { bookKeys } from "@/lib/queryKeys";
import type { Tables } from "@/lib/database.types";

interface UpNextCardProps {
	book: Tables<"books">;
	index: number;
	userId: string | null;
	meetingDate: Date | null;
	onDateChange: (date: Date) => void;
	onRemove: (bookId: string) => void;
}

export function UpNextCard({
	book,
	index,
	userId,
	meetingDate,
	onDateChange,
	onRemove,
}: UpNextCardProps) {
	const queryClient = useQueryClient();
	const flow = useCurrentlyReadingFlow(book.id);
	const [confirmTBROpen, setConfirmTBROpen] = useState(false);

	const tbrMutation = useMutation({
		mutationFn: async () => {
			const err = await markAsTBR(book.id);
			if (err) throw new Error(err);
		},
		onSuccess: () => {
			setConfirmTBROpen(false);
			queryClient.invalidateQueries({ queryKey: bookKeys.byStatus("tbr") });
			queryClient.invalidateQueries({ queryKey: bookKeys.byStatus("on_deck") });
		},
	});

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
						loading="lazy"
						className="w-full rounded object-cover"
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
							onClick={flow.initiate}
							disabled={flow.isChecking}
							className="text-xs"
						>
							→ Currently Reading
						</ActionButton>
						<ActionButton
							onClick={() => setConfirmTBROpen(true)}
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

			<CurrentlyReadingDialog
				book={book}
				flowState={flow.flowState}
				existingBook={flow.existingBook}
				isSubmitting={flow.isSubmitting}
				error={flow.error}
				onConfirm={flow.confirm}
				onReplace={flow.replace}
				onClose={flow.close}
			/>

			<Dialog
				open={confirmTBROpen}
				onOpenChange={(next) => {
					setConfirmTBROpen(next);
					if (!next) tbrMutation.reset();
				}}
			>
				<DialogContent className="max-w-sm border-(--spooky-border) bg-(--spooky-surface) text-(--spooky-parchment) shadow-2xl shadow-black/70">
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
					{tbrMutation.error && (
						<p className="text-xs text-red-400/80">
							{tbrMutation.error.message}
						</p>
					)}
					<div className="flex flex-col gap-2">
						<Button
							onClick={() => tbrMutation.mutate()}
							disabled={tbrMutation.isPending}
							className="bg-(--spooky-crimson) hover:bg-(--spooky-crimson)/80 text-(--spooky-parchment) border border-(--spooky-crimson)/60 transition-all duration-150 disabled:opacity-50"
						>
							{tbrMutation.isPending ? "Saving…" : "Yup"}
						</Button>
						<Button
							variant="outline"
							onClick={() => {
								setConfirmTBROpen(false);
								tbrMutation.reset();
							}}
							disabled={tbrMutation.isPending}
							className="text-(--spooky-dust) hover:text-(--spooky-parchment) hover:bg-(--spooky-border)/40"
						>
							Cancel
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
