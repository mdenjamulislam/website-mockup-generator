import { Header } from "./components/Header.js";
import { Footer } from "./components/Footer.js";
import { HomePage } from "./pages/HomePage.js";
import { ExportPage } from "./pages/ExportPage.js";
import "./styles/globals.css";
import "./styles/components.css";

/**
 * Root application component.
 *
 * The /export path is a minimal headless-only page used by the server-side
 * Playwright renderer to capture the mockup canvas as PNG/WebP.
 * It renders no UI chrome — just the canvas.
 *
 * All other paths render the full editor application.
 */
export default function App() {
  if (window.location.pathname === "/export") {
    return <ExportPage />;
  }

  return (
    <div className="app">
      <a href="#main-content" className="visually-hidden">
        Skip to main content
      </a>
      <Header />
      <HomePage />
      <Footer />
    </div>
  );
}
