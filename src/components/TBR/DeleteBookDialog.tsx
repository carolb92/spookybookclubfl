import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

interface DeleteBookDialogProps {
	bookId: string;
	bookTitle: string;
	onDelete: (bookId: string) => void;
}

export function DeleteBookDialog({
	bookId,
	bookTitle,
	onDelete,
}: DeleteBookDialogProps) {
	const [open, setOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleDelete() {
		setIsDeleting(true);
		setError(null);
		const { error: deleteError } = await supabase
			.from("books")
			.delete()
			.eq("id", bookId);
		setIsDeleting(false);
		if (deleteError) {
			setError("Failed to delete. Please try again.");
			return;
		}
		setOpen(false);
		onDelete(bookId);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) setError(null);
			}}
		>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					className="h-8 px-3 text-xs uppercase tracking-widest border border-(--spooky-crimson)/25 text-(--spooky-dust)/50 bg-transparent hover:bg-(--spooky-crimson)/8 hover:border-(--spooky-crimson)/60 hover:text-(--spooky-crimson)/70 transition-colors duration-200 w-full"
				>
					Remove book
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-sm border-(--spooky-border) bg-(--spooky-surface) text-(--spooky-parchment) shadow-2xl shadow-black/70">
				<DialogHeader>
					<DialogTitle className="font-display text-base tracking-wide text-(--spooky-parchment)">
						Remove book
					</DialogTitle>
					<DialogDescription className="text-(--spooky-dust) text-sm">
						Remove{" "}
						<span className="text-(--spooky-parchment) font-semibold">
							{bookTitle}
						</span>{" "}
						from the TBR list? This cannot be undone.
					</DialogDescription>
				</DialogHeader>
				{error && <p className="text-xs text-red-400/80">{error}</p>}
				<div className="flex flex-col gap-2">
					<Button
						onClick={handleDelete}
						disabled={isDeleting}
						className="bg-(--spooky-crimson) hover:bg-(--spooky-crimson)/80 text-(--spooky-parchment) border border-(--spooky-crimson)/60 hover:border-(--spooky-crimson) transition-all duration-150 disabled:opacity-50"
					>
						{isDeleting ? "Removing…" : "Yeah fuck that book"}
					</Button>
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isDeleting}
						className="text-(--spooky-dust) hover:text-(--spooky-parchment) hover:bg-(--spooky-border)/40"
					>
						Nah, just kidding!
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
