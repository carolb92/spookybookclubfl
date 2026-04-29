import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
// import "@fontsource/cormorant-garamond/400.css";
// import "@fontsource/cormorant-garamond/400-italic.css";
// import "@fontsource/cormorant-garamond/600.css";
import "@fontsource-variable/playfair-display/wght.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
