import "./App.css";
import { Header } from "@/components/layout/Header";
import { MainTabs } from "@/components/layout/MainTabs";

function App() {
	return (
		<div className="app-root min-h-screen">
			{/* Grain texture overlay */}
			<div className="grain-overlay" aria-hidden="true" />

			<div className="relative z-10 flex flex-col min-h-screen">
				<Header />
				<main className="flex-1">
					<MainTabs />
				</main>
			</div>
		</div>
	);
}

export default App;
