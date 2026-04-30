import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const GHOST = "👻";
const TOTAL = 5;

interface GhostRatingProps {
	bookId: string;
	userId: string | null;
	userVote: number | null;
	avgExcitement: number | null;
	onVoteChange: (newVote: number, newAvg: number | null) => void;
}

export function GhostRating({
	bookId,
	userId,
	userVote,
	avgExcitement,
	onVoteChange,
}: GhostRatingProps) {
	const [localVote, setLocalVote] = useState<number | null>(userVote);
	const [hovered, setHovered] = useState<number | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		setLocalVote(userVote);
	}, [userVote]);

	const displayValue = hovered ?? localVote ?? 0;
	const canVote = !!userId && !isSaving;

	async function handleVote(rating: number) {
		if (!canVote) return;
		setLocalVote(rating);
		setIsSaving(true);

		try {
			const { data: existing } = await supabase
				.from("excitement_votes")
				.select("id")
				.eq("book_id", bookId)
				.eq("user_id", userId!)
				.maybeSingle();

			if (existing) {
				await supabase
					.from("excitement_votes")
					.update({ rating })
					.eq("id", existing.id);
			} else {
				await supabase
					.from("excitement_votes")
					.insert({ book_id: bookId, user_id: userId!, rating });
			}

			const { data: newAvg } = await supabase.rpc("get_average_excitement", {
				book_id: bookId,
			});
			onVoteChange(rating, newAvg ?? null);
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<div className="flex flex-col gap-1.5 items-center">
			<div className="flex gap-0.5" onMouseLeave={() => setHovered(null)}>
				{Array.from({ length: TOTAL }, (_, i) => {
					const value = i + 1;
					const isLit = value <= displayValue;
					const glowActive =
						hovered === null && localVote !== null && value <= localVote;

					return (
						//TODO: if rating is one, clicking the ghost does not toggle it off. can adjust vote correctly if rating is > 1
						<button
							key={value}
							type="button"
							disabled={!canVote}
							onClick={() => handleVote(value)}
							onMouseEnter={() => canVote && setHovered(value)}
							aria-label={`Rate ${value} out of ${TOTAL}`}
							className="text-lg leading-none transition-all duration-100 disabled:cursor-default select-none"
							style={{
								opacity: isLit ? 1 : 0.2,
								filter: isLit ? "none" : "grayscale(1)",
								textShadow: glowActive
									? "0 0 10px var(--spooky-crimson-glow)"
									: "none",
							}}
						>
							<span className="text-xl">{GHOST}</span>
						</button>
					);
				})}
			</div>
			<div className="flex gap-3 text-[10px] text-(--spooky-dust) tabular-nums">
				{/* //TODO: log in to vote should trigger auth modal */}
				{userId ? (
					<span className="text-[12px]">Your vote: {localVote ?? "none"}</span>
				) : (
					<span>Log in to vote</span>
				)}
				{avgExcitement !== null && (
					<span>Club avg: {avgExcitement.toFixed(1)}</span>
				)}
			</div>
		</div>
	);
}
