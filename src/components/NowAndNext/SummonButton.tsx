import { useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { fetchExcitementWeights, markAsOnDeck } from "@/services/bookActions";
import { pickWeighted } from "@/lib/weightedRandom";
import { CoverPlaceholder } from "@/components/TBR/CoverPlaceholder";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import type { Tables } from "@/lib/database.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookKeys } from "@/lib/queryKeys";

type SelectedBook = Pick<
	Tables<"books">,
	"id" | "title" | "author" | "cover_url" | "page_count"
>;

interface SummonButtonProps {
	userId: string | null;
}

async function pickRandomTBRBook(): Promise<SelectedBook> {
	const { data: books, error } = await supabase
		.from("books")
		.select("id, title, author, cover_url, page_count")
		.eq("status", "tbr");

	if (error) {
		throw new Error("Something went wrong. Please try again.");
	}
	if (!books || books.length === 0) {
		throw new Error("No books in the TBR pile.");
	}

	const bookIds = books.map((b) => b.id);
	const weights = await fetchExcitementWeights(bookIds);
	return pickWeighted(books, (b) => weights.get(b.id) ?? 1.0);
}

export function SummonButton({ userId }: SummonButtonProps) {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const pickMutation = useMutation({
		mutationFn: pickRandomTBRBook,
	});

	const confirmMutation = useMutation({
		mutationFn: async (bookId: string) => {
			const err = await markAsOnDeck(bookId);
			if (err) throw new Error(err);
		},
		onSuccess: () => {
			setOpen(false);
			queryClient.invalidateQueries({ queryKey: bookKeys.byStatus("on_deck") });
		},
	});

	if (!userId) return null;

	function handleOpenChange(nextOpen: boolean) {
		setOpen(nextOpen);
		if (nextOpen) {
			pickMutation.mutate();
		} else {
			pickMutation.reset();
			confirmMutation.reset();
		}
	}

	const selectedBook = pickMutation.data;

	return (
		<>
			<div className="flex items-center gap-3 pt-1 mt-6">
				<div className="flex-1 h-px bg-(--spooky-border)" />
				<Eye size={28} className="text-(--spooky-dust) opacity-40" />
				<div className="flex-1 h-px bg-(--spooky-border)" />
			</div>

			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogTrigger asChild>
					<button className="summon-button w-full flex items-center justify-center gap-3 py-4 font-display text-base tracking-wide lg:w-3/4 lg:mx-auto rounded-md mt-4">
						WTF should we read next?
					</button>
				</DialogTrigger>

				<DialogContent className="bg-(--spooky-card) border border-(--spooky-border) text-(--spooky-parchment) max-w-sm [&>button]:text-(--spooky-dust)">
					{pickMutation.isPending ? (
						<div className="flex flex-col items-center justify-center gap-3 py-12">
							<Loader2
								size={24}
								className="animate-spin text-(--spooky-crimson)"
							/>
							<span className="font-section tracking-widest uppercase text-sm text-(--spooky-dust)">
								Chaos Reigns
							</span>
						</div>
					) : pickMutation.error ? (
						<div className="flex items-center justify-center py-12">
							<p className="text-sm text-(--spooky-dust) text-center">
								{pickMutation.error.message}
							</p>
						</div>
					) : selectedBook ? (
						<>
							<DialogHeader>
								<DialogTitle className="font-display text-lg font-normal text-(--spooky-parchment) text-center leading-snug pr-4">
									Next up: {selectedBook.title}!
								</DialogTitle>
							</DialogHeader>

							<div className="flex justify-center py-2">
								{selectedBook.cover_url ? (
									<img
										src={selectedBook.cover_url}
										alt={selectedBook.title}
										className="w-36 h-52 object-cover rounded shadow-lg shadow-black/60"
									/>
								) : (
									<CoverPlaceholder className="w-36 h-52 rounded" />
								)}
							</div>

							<div className="text-center space-y-1">
								<p className="font-display text-base text-(--spooky-parchment)">
									{selectedBook.title}
								</p>
								<p className="text-sm text-(--spooky-dust)">
									{selectedBook.author}
								</p>
								{selectedBook.page_count && selectedBook.page_count > 0 ? (
									<p className="text-xs text-(--spooky-dust)">
										{selectedBook.page_count} pages
									</p>
								) : (
									<p className="text-xs text-(--spooky-dust)">
										No page count available
									</p>
								)}
							</div>

							<div className="-mx-4 -mb-4 p-4 border-t border-(--spooky-border)">
								<button
									className="summon-button w-full flex items-center justify-center py-3 font-display text-sm tracking-wide rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
									onClick={() => confirmMutation.mutate(selectedBook.id)}
									disabled={confirmMutation.isPending}
								>
									{confirmMutation.isPending ? (
										<Loader2 size={14} className="animate-spin" />
									) : (
										"The fates have chosen"
									)}
								</button>
							</div>
						</>
					) : null}
				</DialogContent>
			</Dialog>
		</>
	);
}
