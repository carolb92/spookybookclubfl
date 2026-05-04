import { BookCardSkeleton } from "@/components/common/BookCardSkeleton";
import { SectionEmptyHint } from "@/components/common/SectionEmptyHint";

/**
 * "Read" tab — skeleton for the club's completed reading history.
 * Will be wired to real data later.
 */
export function ReadPanel() {
	const skeletonCount = 3;

	return (
		<div className="flex flex-col gap-3">
			<SectionEmptyHint>Coming soon!</SectionEmptyHint>

			{Array.from({ length: skeletonCount }).map((_, i) => (
				<BookCardSkeleton key={i} />
			))}
		</div>
	);
}
