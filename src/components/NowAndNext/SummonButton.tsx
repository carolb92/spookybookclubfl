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

interface SummonButtonProps {
	userId: string | null;
	onConfirm: () => void;
}

export function SummonButton({ userId, onConfirm }: SummonButtonProps) {
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isConfirming, setIsConfirming] = useState(false);
	const [selectedBook, setSelectedBook] = useState<Tables<"books"> | null>(
		null,
	);

	if (!userId) return null;

	async function handleOpenChange(nextOpen: boolean) {
		setOpen(nextOpen);
		if (!nextOpen) return;

		setSelectedBook(null);
		setIsLoading(true);

		const { data: books, error } = await supabase
			.from("books")
			.select("*")
			.eq("status", "tbr");

		if (!error && books && books.length > 0) {
			const bookIds = books.map((b) => b.id);
			const weights = await fetchExcitementWeights(bookIds);
			const selected = pickWeighted(books, (b) => weights.get(b.id) ?? 1.0);
			setSelectedBook(selected);
		}

		setIsLoading(false);
	}

	async function handleConfirm() {
		if (!selectedBook) return;
		setIsConfirming(true);
		await markAsOnDeck(selectedBook.id);
		setIsConfirming(false);
		setOpen(false);
		onConfirm();
	}

	return (
		<>
			<div className="flex items-center gap-3 pt-1 mt-6">
				<div className="flex-1 h-px bg-(--spooky-border)" />
				{/* <Sparkles size={18} className="text-(--spooky-dust) opacity-40" /> */}
				{/* <Sparkles size={18} className="text-(--spooky-dust) opacity-40" /> */}
				<Eye size={28} className="text-(--spooky-dust) opacity-40" />
				<div className="flex-1 h-px bg-(--spooky-border)" />
			</div>

			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogTrigger asChild>
					<button className="summon-button w-full flex items-center justify-center gap-3 py-4 font-display text-base tracking-wide lg:w-3/4 lg:mx-auto rounded-md mt-4">
						{/* <Eye size={15} /> */}
						WTF should we read next?
						{/* <Eye size={15} /> */}
					</button>
				</DialogTrigger>

				<DialogContent className="bg-(--spooky-card) border border-(--spooky-border) text-(--spooky-parchment) max-w-sm [&>button]:text-(--spooky-dust)">
					{isLoading || !selectedBook ? (
						<div className="flex flex-col items-center justify-center gap-3 py-12">
							<Loader2
								size={24}
								className="animate-spin text-(--spooky-crimson)"
							/>
							<span className="font-section tracking-widest uppercase text-sm text-(--spooky-dust)">
								Chaos Reigns
							</span>
						</div>
					) : (
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
									onClick={handleConfirm}
									disabled={isConfirming}
								>
									{isConfirming ? (
										<Loader2 size={14} className="animate-spin" />
									) : (
										"The fates have chosen"
									)}
								</button>
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
