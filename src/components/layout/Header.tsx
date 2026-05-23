import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";

interface HeaderProps {
	className?: string;
}

export function Header({ className }: HeaderProps) {
	const { session } = useAuth();
	const emailDisplay = session?.user?.email?.split("@")[0];
	return (
		<header
			className={cn("relative w-full px-6 py-5 md:px-10 md:py-6", className)}
		>
			{/* Top ruled line */}
			<div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-(--spooky-crimson)/40 to-transparent" />

			<div
				className={cn(
					"flex gap-2 justify-between",
					emailDisplay
						? "flex-col sm:flex-row sm:items-center"
						: "flex-row items-center",
				)}
			>
				<h1 className="font-display text-xl md:text-3xl tracking-wide text-(--spooky-parchment) leading-none">
					Spooky Book Club FL 👻
				</h1>

				{emailDisplay ? (
					<div className="flex flex-col self-start sm:self-auto sm:items-end">
						<span className="text-xs tracking-widest uppercase text-(--spooky-dust) opacity-60">
							{emailDisplay}
						</span>
						<div className="h-px w-full bg-linear-to-r from-(--spooky-crimson)/60 to-transparent" />
					</div>
				) : (
					<AuthModal action="sign in">
						<button
							className={cn(
								"h-8 px-4 rounded-md text-xs font-semibold tracking-wide",
								"bg-(--spooky-crimson) hover:bg-(--spooky-crimson)/80 text-(--spooky-parchment)",
								"border border-(--spooky-crimson)/60 hover:border-(--spooky-crimson)",
								"transition-all duration-150 cursor-pointer",
							)}
						>
							Sign in
						</button>
					</AuthModal>
				)}
			</div>

			{/* Bottom ruled line */}
			<div className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-(--spooky-border) to-transparent" />
		</header>
	);
}
