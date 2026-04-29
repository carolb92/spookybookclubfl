import type { ReactNode } from "react";
import { BookCardSkeleton } from "@/components/common/BookCardSkeleton";

/**
 * "Now & Next" tab — skeleton placeholder for the current pick and
 * the upcoming selection. Will be wired to real data later.
 */
export function NowAndNextPanel() {
	return (
		<div className="flex flex-col gap-8">
			{/* Currently reading */}
			<section>
				<SectionLabel>Now Reading</SectionLabel>
				<BookCardSkeleton tall />
			</section>

			{/* Divider */}
			<div className="h-px bg-linear-to-r from-transparent via-(--spooky-border) to-transparent" />

			{/* Up next */}
			<section>
				<SectionLabel>Up Next</SectionLabel>
				<BookCardSkeleton />
			</section>

			{/* Meeting details skeleton */}
			<section>
				<SectionLabel>Next Meeting</SectionLabel>
				<div className="flex flex-col gap-2 rounded-sm border border-(--spooky-border) bg-(--spooky-card) p-4">
					<div className="h-3 w-2/5 rounded-sm bg-(--spooky-skeleton)" />
					<div className="h-3 w-1/3 rounded-sm bg-(--spooky-skeleton) opacity-60" />
				</div>
			</section>
		</div>
	);
}

function SectionLabel({ children }: { children: ReactNode }) {
	return (
		<p className="mb-3 text-[0.65rem] tracking-[0.2em] uppercase text-(--spooky-crimson) font-sans">
			{children}
		</p>
	);
}
