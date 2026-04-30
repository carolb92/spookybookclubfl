import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NowAndNextPanel } from "@/components/NowAndNext/NowAndNextPanel";
import { TBRPanel } from "@/components/TBR/TBRPanel";
import { ReadPanel } from "@/components/Read/ReadPanel";
import { cn } from "@/lib/utils";

const TABS = [
	{ value: "now-and-next", label: "Now & Next" },
	{ value: "tbr", label: "TBR" },
	{ value: "read", label: "Read" },
] as const;

export function MainTabs() {
	return (
		<Tabs defaultValue="now-and-next" className="w-full lg:w-3/4">
			{/* Tab bar */}
			<div className="relative flex justify-center border-b border-(--spooky-border)">
				<TabsList
					variant="line"
					className={cn("justify-center gap-0 rounded-none bg-transparent p-0")}
				>
					{TABS.map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							className={cn(
								// Reset shadcn defaults, apply spooky style
								"relative shrink-0 flex-none rounded-none border-none px-5 py-3",
								"font-display text-base tracking-wide",
								"text-(--spooky-dust) opacity-60",
								// Active state
								"data-[state=active]:opacity-100 data-[state=active]:text-(--spooky-parchment)",
								// Underline accent on active
								"after:absolute after:-bottom-px after:inset-x-2 after:h-px",
								"after:bg-(--spooky-crimson) after:opacity-0",
								"data-[state=active]:after:opacity-100",
								// Hover
								"hover:opacity-80 transition-opacity duration-200",
								// Override shadcn's background resets
								"bg-transparent data-[state=active]:bg-transparent",
								"shadow-none data-[state=active]:shadow-none",
								"dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-transparent",
							)}
						>
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>
			</div>

			{/* Tab panels */}
			<div className="px-6 py-6 md:px-10 md:py-8">
				{/* max-w-2xl mx-auto */}
				<TabsContent value="now-and-next">
					<NowAndNextPanel />
				</TabsContent>
				<TabsContent value="tbr">
					<TBRPanel />
				</TabsContent>
				<TabsContent value="read">
					<ReadPanel />
				</TabsContent>
			</div>
		</Tabs>
	);
}
