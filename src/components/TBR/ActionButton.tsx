import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ActionButton({
	className,
	...props
}: React.ComponentProps<typeof Button>) {
	return (
		<Button
			variant="ghost"
			className={cn(
				"h-8 px-3 text-xs uppercase tracking-widest",
				"border-2 border-(--spooky-crimson)/50",
				"text-(--spooky-dust) bg-(--spooky-crimson)/15",
				"hover:bg-(--spooky-crimson)/8 hover:border-(--spooky-crimson)/60 hover:text-(--spooky-crimson)/70",
				"transition-colors duration-200",
				className,
			)}
			{...props}
		/>
	);
}
