import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { HomePage } from "@/pages/HomePage";
import { CardsPage } from "@/pages/CardsPage";
import { CardDetailsPage } from "@/pages/CardDetailsPage";
import { ComparePage } from "@/pages/ComparePage";
import { AIRecommendPage } from "@/pages/AIRecommendPage";
import { InsightsPage } from "@/pages/InsightsPage";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cards" element={<CardsPage />} />
          <Route path="/cards/:id" element={<CardDetailsPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/ai-recommend" element={<AIRecommendPage />} />
          <Route path="/insights" element={<InsightsPage />} />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;