import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { ActionButton } from "./ActionButton";
import { DeleteBookDialog } from "./DeleteBookDialog";
import { CurrentlyReadingDialog } from "@/components/common/CurrentlyReadingDialog";
import { useCurrentlyReadingFlow } from "@/hooks/useCurrentlyReadingFlow";
import { markAsOnDeck } from "@/services/bookActions";
import type { Tables } from "@/lib/database.types";

interface TBRBookActionsPanelProps {
	book: Tables<"books">;
	userId: string | null;
	onDelete: (bookId: string) => void;
	onStatusChange: (bookId: string) => void;
}

export function TBRBookActionsPanel({
	book,
	userId,
	onDelete,
	onStatusChange,
}: TBRBookActionsPanelProps) {
	const flow = useCurrentlyReadingFlow(book.id, () => onStatusChange(book.id));
	const [isAddingToUpNext, setIsAddingToUpNext] = useState(false);

	async function handleAddToUpNext() {
		setIsAddingToUpNext(true);
		const err = await markAsOnDeck(book.id);
		setIsAddingToUpNext(false);
		if (err) return;
		flow.close();
		onStatusChange(book.id);
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="grid grid-cols-2 gap-2 md:grid-cols-1">
				{userId ? (
					<>
						<ActionButton
							onClick={flow.initiate}
							disabled={flow.isChecking}
						>
							+ Currently Reading
						</ActionButton>

						<CurrentlyReadingDialog
							book={book}
							flowState={flow.flowState}
							existingBook={flow.existingBook}
							isSubmitting={flow.isSubmitting || isAddingToUpNext}
							error={flow.error}
							onConfirm={flow.confirm}
							onReplace={flow.replace}
							onClose={flow.close}
							onAddToUpNext={handleAddToUpNext}
						/>
					</>
				) : (
					<AuthModal action="mark a book as currently reading">
						<ActionButton>+ Currently Reading</ActionButton>
					</AuthModal>
				)}

				{userId ? (
					<ActionButton
						onClick={handleAddToUpNext}
						disabled={isAddingToUpNext}
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
