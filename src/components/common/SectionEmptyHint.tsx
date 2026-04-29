import type { ReactNode } from "react";

interface SectionEmptyHintProps {
	children: ReactNode;
}

/** Subtle italic placeholder text for empty/skeleton states */
export function SectionEmptyHint({ children }: SectionEmptyHintProps) {
	return (
		<p className="font-display italic text-sm text-(--spooky-dust) opacity-50 text-center py-4 tracking-wide">
			{children}
		</p>
	);
}
