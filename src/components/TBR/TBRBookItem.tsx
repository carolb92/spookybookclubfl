import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { CoverPlaceholder } from "./CoverPlaceholder";
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
}

export function TBRBookItem({
	book,
	avgExcitement,
	userVote,
	userId,
	onVoteChange,
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

			<AccordionContent className="overflow-y-scroll md:max-h-70">
				{/* md:h-1/3 */}
				<div className="flex flex-col gap-3 pb-4 pt-1 sm:gap-4">
					<div className="flex flex-col gap-x-3 items-center md:flex-row md:max-w-fit md:shrink">
						{book.cover_url ? (
							<img
								src={book.cover_url}
								alt={book.title}
								className="rounded object-contain w-[40%] md:w-auto md:self-start"
								style={{
									boxShadow: "0 4px 16px -4px var(--spooky-crimson)",
								}}
							/>
						) : (
							<CoverPlaceholder className="w-20 h-28 rounded" />
						)}
						<div className="flex flex-col">
							{book.description && (
								<p className="text-xs text-(--spooky-dust) leading-relaxed ">
									{/* my-3 */}
									{book.description}
								</p>
							)}
							{book.page_count != null && book.page_count > 0 ? (
								<span className="text-xs text-(--spooky-dust) tabular-nums">
									{book.page_count} pages
								</span>
							) : (
								<span className="text-xs text-(--spooky-dust) tabular-nums">
									No page count available
								</span>
							)}
						</div>
					</div>

					<div className="flex flex-col gap-3 md:min-w-1/4 items-center justify-center">
						<GhostRating
							bookId={book.id}
							userId={userId}
							userVote={userVote}
							avgExcitement={avgExcitement}
							onVoteChange={(newVote, newAvg) =>
								onVoteChange(book.id, newVote, newAvg)
							}
						/>
					</div>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}
