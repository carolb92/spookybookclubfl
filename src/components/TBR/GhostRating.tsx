import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AuthModal } from "@/components/auth/AuthModal";

const GHOST = "👻";
const TOTAL = 5;

interface GhostRatingProps {
	bookId: string;
	userId: string | null;
	userVote: number | null;
	avgExcitement: number | null;
	onVoteChange: (newVote: number | null, newAvg: number | null) => void;
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
		const previousVote = localVote;
		const shouldToggleOff = rating === localVote;
		setLocalVote(shouldToggleOff ? null : rating);
		setIsSaving(true);

		try {
			const { data: existing } = await supabase
				.from("excitement_votes")
				.select("id")
				.eq("book_id", bookId)
				.eq("user_id", userId!)
				.maybeSingle();

			if (shouldToggleOff) {
				if (existing) {
					await supabase
						.from("excitement_votes")
						.delete()
						.eq("id", existing.id);
				}
			} else if (existing) {
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
			onVoteChange(shouldToggleOff ? null : rating, newAvg ?? null);
		} catch {
			setLocalVote(previousVote);
		} finally {
			setIsSaving(false);
		}
	}

	const dimGhosts = (
		<>
			{Array.from({ length: TOTAL }, (_, i) => (
				<span
					key={i}
					className="text-xl select-none"
					style={{ opacity: 0.2, filter: "grayscale(1)" }}
				>
					{GHOST}
				</span>
			))}
		</>
	);

	if (!userId) {
		return (
			<div className="flex flex-col gap-1.5 items-center">
				<span className="font-section text-xs uppercase tracking-widest text-(--spooky-crimson)">
					Hype
				</span>
				<AuthModal action="rate your excitement level">
					<button
						type="button"
						className="flex flex-col gap-1.5 items-center cursor-pointer"
						aria-label="Log in to vote"
					>
						<div className="flex gap-0.5">{dimGhosts}</div>
						<span className="text-[12px] text-(--spooky-dust)">
							Log in to vote
						</span>
					</button>
				</AuthModal>
				{avgExcitement !== null && (
					<span className="text-[12px] text-(--spooky-dust) tabular-nums">
						Club avg: {avgExcitement.toFixed(1)}
					</span>
				)}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-1.5 items-center">
			<span className="font-section text-xs uppercase tracking-widest text-(--spooky-crimson)">
				Hype
			</span>
			<div
				role="group"
				aria-label="Rate your excitement"
				className="flex gap-0.5"
				onMouseLeave={() => setHovered(null)}
			>
				{Array.from({ length: TOTAL }, (_, i) => {
					const value = i + 1;
					const isLit = value <= displayValue;
					const glowActive =
						hovered === null && localVote !== null && value <= localVote;

					return (
						<button
							key={value}
							type="button"
							disabled={isSaving}
							onClick={() => handleVote(value)}
							onMouseEnter={() => setHovered(value)}
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
				<span className="text-[12px]">Your vote: {localVote ?? "none"}</span>
				{avgExcitement !== null && (
					<span className="text-[12px]">
						Club avg: {avgExcitement.toFixed(1)}
					</span>
				)}
			</div>
		</div>
	);
}
