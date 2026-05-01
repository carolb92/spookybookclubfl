import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CoverPlaceholder } from "./CoverPlaceholder";
import { DeleteBookDialog } from "./DeleteBookDialog";
import { GhostRating } from "./GhostRating";
import type { Tables } from "@/lib/database.types";

interface TBRBookItemProps {
	book: Tables<"books">;
	avgExcitement: number | null;
	userVote: number | null;
	userId: string | null;
	onVoteChange: (
		bookId: string,
		newVote: number | null,
		newAvg: number | null,
	) => void;
	onDelete: (bookId: string) => void;
}

export function TBRBookItem({
	book,
	avgExcitement,
	userVote,
	userId,
	onVoteChange,
	onDelete,
}: TBRBookItemProps) {
	return (
		<AccordionItem
			value={book.id}
			className="border-b border-(--spooky-border)"
		>
			<AccordionTrigger className="hover:no-underline py-3 px-0 items-center">
				<div className="flex flex-1 items-center gap-2 min-w-0 pr-2">
					<div className="flex flex-col">
						<span className="font-display font-semibold text-sm text-(--spooky-parchment) leading-snug truncate">
							{book.title}
						</span>
						<span className="text-xs text-(--spooky-dust) truncate sm:inline shrink-0 max-w-35">
							{book.author}
						</span>
					</div>
					<span className="ml-auto flex items-center gap-3 shrink-0">
						<span className="text-xs text-(--spooky-dust) tabular-nums">
							{avgExcitement !== null ? avgExcitement.toFixed(1) : "—"} 👻
						</span>
					</span>
				</div>
			</AccordionTrigger>

			<AccordionContent className="overflow-y-scroll md:max-h-74">
				{/* md:h-1/3 */}
				<div className="flex flex-col md:flex-row md:gap-4 pb-4 pt-1">
					{/* Left: cover + description */}
					<div className="flex flex-col gap-x-3 items-center md:flex-row md:flex-1 md:items-start">
						<div className="flex justify-center shrink-0">
							{book.cover_url ? (
								<img
									src={book.cover_url}
									alt={book.title}
									className="rounded object-contain md:w-auto"
									style={{
										boxShadow: "0 4px 16px -4px var(--spooky-crimson)",
									}}
								/>
							) : (
								<CoverPlaceholder className="w-20 h-28 rounded" />
							)}
						</div>
						<div className="flex flex-col mt-2 md:mt-0">
							{book.description && (
								<p className="text-xs text-(--spooky-dust) leading-relaxed">
									{book.description}
								</p>
							)}
							{book.page_count != null && book.page_count > 0 ? (
								<span className="text-xs text-(--spooky-dust) tabular-nums mt-1">
									{book.page_count} pages
								</span>
							) : (
								<span className="text-xs text-(--spooky-dust) tabular-nums mt-1">
									No page count available
								</span>
							)}
						</div>
					</div>

					{/* Right: actions panel */}
					<div className="flex flex-col gap-3 border-t border-(--spooky-border) pt-3 mt-3 md:border-t-0 md:border-l md:pl-4 md:pt-0 md:mt-0 md:w-48 md:shrink-0 md:justify-evenly">
						<GhostRating
							bookId={book.id}
							userId={userId}
							userVote={userVote}
							avgExcitement={avgExcitement}
							onVoteChange={(newVote, newAvg) =>
								onVoteChange(book.id, newVote, newAvg)
							}
						/>
						<div className="flex flex-col gap-2">
							<div className="grid grid-cols-2 gap-2 md:grid-cols-1">
								<Button
									variant="ghost"
									className="h-8 px-3 text-xs uppercase tracking-widest border-2 border-(--spooky-crimson)/50 text-(--spooky-dust) bg-(--spooky-crimson)/15 hover:bg-(--spooky-crimson)/8 hover:border-(--spooky-crimson)/60 hover:text-(--spooky-crimson)/70 transition-colors duration-200"
								>
									+ Currently Reading
								</Button>
								<Button
									variant="ghost"
									className="h-8 px-3 text-xs uppercase tracking-widest border-2 border-(--spooky-crimson)/50 text-(--spooky-dust) bg-(--spooky-crimson)/15 hover:bg-(--spooky-crimson)/8 hover:border-(--spooky-crimson)/60 hover:text-(--spooky-crimson)/70 transition-colors duration-200"
								>
									+ Up Next
								</Button>
							</div>
							<div className="flex">
								<DeleteBookDialog
									bookId={book.id}
									bookTitle={book.title}
									onDelete={onDelete}
								/>
							</div>
						</div>
					</div>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}
