import { cn } from "@/lib/utils";
import { type GoogleBook } from "@/services/searchBooks";
import { CoverPlaceholder } from "./CoverPlaceholder";

export function SearchResultItem({
	book,
	onClick,
}: {
	book: GoogleBook;
	onClick: () => void;
}) {
	const { title, authors, imageLinks } = book.volumeInfo;
	const thumb = imageLinks?.smallThumbnail ?? imageLinks?.thumbnail;

	return (
		<button
			onClick={onClick}
			className={cn(
				"group flex items-center gap-3 rounded-md px-3 py-2.5 text-left w-full overflow-hidden",
				"transition-colors duration-150",
				"hover:bg-white/4 focus-visible:outline-none focus-visible:bg-white/4",
				"border border-transparent hover:border-(--spooky-border)",
			)}
		>
			<div className="relative shrink-0">
				{thumb ? (
					<img
						src={thumb}
						alt={`${title} cover thumbnail`}
						aria-hidden="true"
						loading="lazy"
						className="h-14 w-10 rounded-sm object-cover shadow-md"
					/>
				) : (
					<CoverPlaceholder className="h-14 w-10 rounded-sm" />
				)}
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium text-(--spooky-parchment) leading-snug">
					{title}
				</p>
				{authors && authors.length > 0 && (
					<p className="mt-0.5 truncate text-xs text-(--spooky-dust)">
						{authors.join(", ")}
					</p>
				)}
			</div>
			<svg
				viewBox="0 0 16 16"
				fill="none"
				className="size-4 shrink-0 text-(--spooky-dust) opacity-0 group-hover:opacity-100 transition-opacity"
				aria-hidden="true"
			>
				<path
					d="M6 4l4 4-4 4"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</button>
	);
}
