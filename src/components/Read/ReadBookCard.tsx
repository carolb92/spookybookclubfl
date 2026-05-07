import type { Tables } from "@/lib/database.types";
import { CoverPlaceholder } from "@/components/TBR/CoverPlaceholder";
import { DevilRating } from "./DevilRating";
import { getHighResCover, parseDateString } from "@/lib/utils";

interface ReadBookCardProps {
	book: Tables<"books">;
	avgRating: number | null;
	userRating: number | null;
	userId: string | null;
	onRatingChange: (
		bookId: string,
		newRating: number | null,
		newAvg: number | null,
	) => void;
}

function formatDevoured(dateStr: string | null): string | null {
	if (!dateStr) return null;
	return parseDateString(dateStr).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

export function ReadBookCard({
	book,
	avgRating,
	userRating,
	userId,
	onRatingChange,
}: ReadBookCardProps) {
	const devoured = formatDevoured(book.date_finished);

	return (
		<article
			className="relative rounded-sm border border-(--spooky-border) bg-(--spooky-card) overflow-hidden group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_-4px_var(--spooky-crimson)] focus-within:shadow-[0_8px_32px_-4px_var(--spooky-crimson)]"
		>
			{/* Cover */}
			<div className="relative aspect-2/3 overflow-hidden">
				{book.cover_url ? (
					<img
						src={getHighResCover(book.cover_url)}
						alt={book.title}
						className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
					/>
				) : (
					<CoverPlaceholder className="w-full h-full" />
				)}

				{/* Gradient fade into card bg */}
				<div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-(--spooky-card) via-(--spooky-card)/70 to-transparent pointer-events-none" />

				{/* Title + author overlaid on gradient */}
				<div className="absolute inset-x-0 bottom-0 px-3 pb-3">
					<h3 className="font-display text-sm font-semibold text-(--spooky-parchment) line-clamp-2 leading-snug">
						{book.title}
					</h3>
					<p className="text-[11px] text-(--spooky-dust) mt-0.5 truncate">
						{book.author}
					</p>
				</div>
			</div>

			{/* Below-cover metadata */}
			<div className="px-3 pt-2 pb-3 flex flex-col gap-2 items-center border-t border-(--spooky-border)/50">
				{devoured && (
					<span className="font-sans text-[10px] uppercase tracking-widest text-(--spooky-dust)/50">
						{devoured}
					</span>
				)}
				<DevilRating
					bookId={book.id}
					userId={userId}
					userRating={userRating}
					avgRating={avgRating}
					historicalAvgRating={book.historical_avg_rating}
					onRatingChange={(newRating, newAvg) =>
						onRatingChange(book.id, newRating, newAvg)
					}
				/>
			</div>
		</article>
	);
}
