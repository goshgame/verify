import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Index";
import ParityPage from "./pages/ParityPage";
import GreedyPage from "./pages/GreedyPage";
import GreedyNewPage from "./pages/GreedyNewPage";
import DicePage from "./pages/DicePage";
import ColorPage from "./pages/ColorPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Parity" element={<ParityPage />} />
        <Route path="/Greedy" element={<GreedyPage />} />
        <Route path="/Dice" element={<DicePage />} />
        <Route path="/Color" element={<ColorPage />} />
        <Route path="/GreedyNew" element={<GreedyNewPage />} />
      </Routes>
    </HashRouter>
  );
}
