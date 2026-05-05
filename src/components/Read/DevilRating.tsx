import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AuthModal } from "@/components/auth/AuthModal";

const DEVIL = "😈";
const TOTAL = 5;

interface DevilRatingProps {
	bookId: string;
	userId: string | null;
	userRating: number | null;
	avgRating: number | null;
	historicalAvgRating: number | null;
	onRatingChange: (newRating: number | null, newAvg: number | null) => void;
}

export function DevilRating({
	bookId,
	userId,
	userRating,
	avgRating,
	historicalAvgRating,
	onRatingChange,
}: DevilRatingProps) {
	const displayAvg = avgRating ?? historicalAvgRating;
	const [localRating, setLocalRating] = useState<number | null>(userRating);
	const [hovered, setHovered] = useState<number | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		setLocalRating(userRating);
	}, [userRating]);

	const displayValue = hovered ?? localRating ?? 0;
	const canRate = !!userId && !isSaving;

	async function handleRate(rating: number) {
		if (!canRate) return;
		const previousRating = localRating;
		const shouldToggleOff = rating === localRating;
		setLocalRating(shouldToggleOff ? null : rating);
		setIsSaving(true);

		try {
			const { data: existing } = await supabase
				.from("book_ratings")
				.select("id")
				.eq("book_id", bookId)
				.eq("user_id", userId!)
				.maybeSingle();

			if (shouldToggleOff) {
				if (existing) {
					await supabase.from("book_ratings").delete().eq("id", existing.id);
				}
			} else if (existing) {
				await supabase
					.from("book_ratings")
					.update({ rating })
					.eq("id", existing.id);
			} else {
				await supabase
					.from("book_ratings")
					.insert({ book_id: bookId, user_id: userId!, rating });
			}

			const { data: newAvg } = await supabase.rpc("get_average_rating", {
				book_id: bookId,
			});
			onRatingChange(shouldToggleOff ? null : rating, newAvg ?? null);
		} catch {
			setLocalRating(previousRating);
		} finally {
			setIsSaving(false);
		}
	}

	const dimDevils = (
		<>
			{Array.from({ length: TOTAL }, (_, i) => (
				<span
					key={i}
					className="text-lg select-none"
					style={{ opacity: 0.2, filter: "grayscale(1)" }}
				>
					{DEVIL}
				</span>
			))}
		</>
	);

	if (!userId) {
		return (
			<div className="flex flex-col gap-1 items-center">
				<span className="font-section text-[10px] uppercase tracking-widest text-(--spooky-crimson) font-semibold">
					Rating
				</span>
				<AuthModal action="rate this book">
					<button
						type="button"
						className="flex flex-col gap-1 items-center cursor-pointer"
						aria-label="Log in to rate"
					>
						<div className="flex gap-0.5">{dimDevils}</div>
						<span className="text-[11px] text-(--spooky-dust)">
							Log in to rate
						</span>
					</button>
				</AuthModal>
				{displayAvg !== null && (
					<span className="text-[11px] text-(--spooky-dust) tabular-nums">
						Club avg: {displayAvg.toFixed(2)}
					</span>
				)}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-1 items-center">
			<span className="font-section text-[10px] uppercase tracking-widest text-(--spooky-crimson) font-semibold">
				Rating
			</span>
			<div
				role="group"
				aria-label="Rate this book"
				className="flex gap-0.5"
				onMouseLeave={() => setHovered(null)}
			>
				{Array.from({ length: TOTAL }, (_, i) => {
					const value = i + 1;
					const isLit = value <= displayValue;
					const glowActive =
						hovered === null && localRating !== null && value <= localRating;

					return (
						<button
							key={value}
							type="button"
							disabled={isSaving}
							onClick={() => handleRate(value)}
							onMouseEnter={() => setHovered(value)}
							aria-label={`Rate ${value} out of ${TOTAL}`}
							className="text-base leading-none transition-all duration-100 disabled:cursor-default select-none"
							style={{
								opacity: isLit ? 1 : 0.2,
								filter: isLit ? "none" : "grayscale(1)",
								textShadow: glowActive
									? "0 0 10px var(--spooky-crimson-glow)"
									: "none",
							}}
						>
							<span className="text-lg">{DEVIL}</span>
						</button>
					);
				})}
			</div>
			<div className="flex gap-2.5 text-[11px] text-(--spooky-dust) tabular-nums">
				<span>Your vote: {localRating ?? "none"}</span>
				{displayAvg !== null && <span>Coven avg: {displayAvg.toFixed(2)}</span>}
			</div>
		</div>
	);
}
