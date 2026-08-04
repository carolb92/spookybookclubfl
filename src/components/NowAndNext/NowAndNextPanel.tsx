import { type ReactNode } from "react";
import { useAuth } from "@/contexts/useAuth";
import CurrentlyReadingCard from "./CurrentlyReadingCard";
import UpNextList from "./UpNextList";
import { SummonButton } from "./SummonButton";

export function NowAndNextPanel() {
	const { session } = useAuth();
	const userId = session?.user.id ?? null;

	return (
		<div className="flex flex-col gap-8">
			{/* Currently reading */}
			<section>
				<SectionLabel>Now Reading</SectionLabel>
				<CurrentlyReadingCard userId={userId} />
			</section>

			{/* Divider */}
			<div className="h-px bg-linear-to-r from-transparent via-(--spooky-border) to-transparent" />

			{/* Up next */}
			<section>
				<SectionLabel>Up Next</SectionLabel>
				<UpNextList userId={userId} />
				<SummonButton userId={userId} />
			</section>
		</div>
	);
}

function SectionLabel({ children }: { children: ReactNode }) {
	return (
		<h2 className="mb-6 font-section text-3xl font-semibold tracking-widest uppercase text-(--spooky-crimson) text-center">
			{children}
		</h2>
	);
}
