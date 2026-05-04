import { useState } from "react";

interface BookDescriptionProps {
	description: string;
	pageCount?: number | null;
	truncateAtChars?: number;
}

export function BookDescription({
	description,
	pageCount,
	truncateAtChars = 600,
}: BookDescriptionProps) {
	const [expanded, setExpanded] = useState(false);

	const truncated =
		description.length > truncateAtChars
			? description.slice(0, truncateAtChars).trimEnd() + "…"
			: null;

	return (
		<div className="flex flex-col gap-1">
			<p className="text-sm text-(--spooky-dust) leading-relaxed">
				{truncated && !expanded ? truncated : description}
				{truncated && (
					<button
						onClick={() => setExpanded((v) => !v)}
						className="ml-1 text-xs text-(--spooky-crimson)/70 hover:text-(--spooky-crimson) underline underline-offset-2 transition-colors"
					>
						{expanded ? "show less" : "read more"}
					</button>
				)}
			</p>
			{pageCount !== undefined && (
				<span className="text-xs text-(--spooky-dust) tabular-nums max-w-fit">
					{pageCount != null && pageCount > 0
						? `${pageCount} pages`
						: "No page count available"}
				</span>
			)}
		</div>
	);
}
