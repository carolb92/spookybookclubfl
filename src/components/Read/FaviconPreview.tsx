export function FaviconPreview() {
	return (
		<div className="flex items-center justify-center p-16">
			<div
				style={{
					width: 256,
					height: 256,
					backgroundColor: "#000",
					borderRadius: 32,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<span
					style={{
						fontSize: 160,
						lineHeight: 1,
						textShadow:
							"0 0 24px var(--spooky-crimson-glow), 0 0 48px var(--spooky-crimson-glow)",
					}}
				>
					👻
				</span>
			</div>
		</div>
	);
}
