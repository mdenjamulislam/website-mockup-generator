import { Header } from "./components/Header.js";
import { Footer } from "./components/Footer.js";
import { HomePage } from "./pages/HomePage.js";
import "./styles/globals.css";
import "./styles/components.css";

export default function App() {
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
