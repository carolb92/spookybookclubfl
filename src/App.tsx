import "./App.css";
import { Header } from "@/components/layout/Header";
import { MainTabs } from "@/components/layout/MainTabs";
import { AuthProvider } from "@/contexts/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<ReactQueryDevtools initialIsOpen={false} position="left" />
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
		</QueryClientProvider>
	);
}

export default App;
