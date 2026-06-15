const DEVIL = "😈";
const TOTAL = 5;

interface DevilRatingProps {
	rating: number | null;
}

export function DevilRating({ rating }: DevilRatingProps) {
	return (
		<div className="flex flex-col gap-1 items-center">
			<span className="font-section text-[11px] uppercase tracking-widest text-(--spooky-crimson) font-semibold">
				Rating
			</span>
			<div
				className="flex gap-0.5"
				aria-label={
					rating !== null ? `${rating.toFixed(2)} out of 5` : "No rating yet"
				}
			>
				{Array.from({ length: TOTAL }, (_, i) => {
					const fill =
						rating !== null ? Math.min(1, Math.max(0, rating - i)) : 0;
					const clipPct = Math.round(fill * 100);
					return (
						<span
							key={i}
							className="relative inline-block text-lg select-none leading-none"
						>
							<span
								aria-hidden="true"
								style={{ opacity: 0.5, filter: "grayscale(1)" }}
							>
								{DEVIL}
							</span>
							{clipPct > 0 && (
								<span
									aria-hidden="true"
									style={{
										position: "absolute",
										left: 0,
										top: 0,
										clipPath: `inset(0 ${100 - clipPct}% 0 0)`,
									}}
								>
									{DEVIL}
								</span>
							)}
						</span>
					);
				})}
			</div>
			{rating !== null && (
				<span className="text-[12px] text-(--spooky-dust) tabular-nums">
					{rating.toFixed(2)}
				</span>
			)}
		</div>
	);
}
