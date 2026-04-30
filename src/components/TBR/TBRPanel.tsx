import { SectionEmptyHint } from "@/components/common/SectionEmptyHint";
import { Button } from "@/components/ui/button";
import { AddBookModal } from "./AddBookModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/useAuth";
import { cn } from "@/lib/utils";

export function TBRPanel() {
	const { session } = useAuth();

	const addButton = (
		<Button
			className={cn(
				"shrink-0 h-8 gap-1.5 rounded-md px-3 text-xs font-semibold tracking-wide flex justify-center items-center",
				"bg-(--spooky-crimson) hover:bg-(--spooky-crimson)/80 text-(--spooky-parchment)",
				"border border-(--spooky-crimson)/60 hover:border-(--spooky-crimson)",
				"transition-all duration-150",
			)}
		>
			<span className="text-[16px]">+</span>
			<span>Add a book</span>
		</Button>
	);

	return (
		<div className="flex flex-col gap-5">
			<div className="flex flex-col items-center justify-center gap-y-5">
				<SectionEmptyHint>
					The pile of dread grows ever taller.
				</SectionEmptyHint>

				{session ? (
					<AddBookModal>{addButton}</AddBookModal>
				) : (
					<AuthModal>{addButton}</AuthModal>
				)}
			</div>
		</div>
	);
}
