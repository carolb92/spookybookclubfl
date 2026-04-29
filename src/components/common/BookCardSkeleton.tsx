import { cn } from "@/lib/utils";

interface BookCardSkeletonProps {
	className?: string;
	/** Vary the card height slightly for visual rhythm */
	tall?: boolean;
}

export function BookCardSkeleton({
	className,
	tall = false,
}: BookCardSkeletonProps) {
	return (
		<div
			className={cn(
				"relative flex gap-4 rounded-sm border border-(--spooky-border) bg-(--spooky-card) p-4 overflow-hidden",
				className,
			)}
		>
			{/* Shimmer sweep */}
			<div className="skeleton-shimmer absolute inset-0 pointer-events-none" />

			{/* Book cover placeholder */}
			<div
				className={cn(
					"shrink-0 rounded-sm bg-(--spooky-skeleton)",
					tall ? "h-36 w-24" : "h-28 w-18",
				)}
			/>

			{/* Text lines */}
			<div className="flex flex-1 flex-col justify-center gap-2.5">
				{/* Title */}
				<div className="h-4 w-3/4 rounded-sm bg-(--spooky-skeleton)" />
				{/* Author */}
				<div className="h-3 w-2/5 rounded-sm bg-(--spooky-skeleton) opacity-70" />
				{/* Meta row */}
				<div className="mt-1 flex gap-2">
					<div className="h-2.5 w-16 rounded-sm bg-(--spooky-skeleton) opacity-50" />
					<div className="h-2.5 w-10 rounded-sm bg-(--spooky-skeleton) opacity-50" />
				</div>
			</div>
		</div>
	);
}
