import "./App.css";
import { Header } from "@/components/layout/Header";
import { MainTabs } from "@/components/layout/MainTabs";
import { AuthProvider } from "@/contexts/AuthProvider";

function App() {
	return (
		<AuthProvider>
			<div className="app-root min-h-screen">
				{/* Grain texture overlay */}
				<div className="grain-overlay" aria-hidden="true" />

				<div className="relative z-10 flex flex-col min-h-screen">
					<Header />
					<main className="flex flex-1 justify-center">
						<MainTabs />
					</main>
				</div>
			</div>
		</AuthProvider>
	);
}

export default App;
