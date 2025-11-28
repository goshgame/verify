import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Index";
import ParityPage from "./pages/ParityPage";
import GreedyPage from "./pages/GreedyPage";
import GreedyProPage from "./pages/GreedyProPage";
import DicePage from "./pages/DicePage";
import ColorPage from "./pages/ColorPage";
import ThreeDigitPage from "./pages/3digitPage";
import QuickRacePage from "./pages/QuickRacePage";
import StateLotteryPage from "./pages/StateLotteryPage";
import TeenPattiPage from "./pages/TeenPattiPage";
import Wild3Page from "./pages/Wild3Page";
import Wild2Page from "./pages/Wild2Page";
import Wild1Page from "./pages/Wild1Page";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Parity" element={<ParityPage />} />
        <Route path="/Greedy" element={<GreedyPage />} />
        <Route path="/Dice" element={<DicePage />} />
        <Route path="/Color" element={<ColorPage />} />
        <Route path="/GreedyPro" element={<GreedyProPage />} />
        <Route path="/3digit" element={<ThreeDigitPage />} />
        <Route path="/QuickRace" element={<QuickRacePage />} />
        <Route path="/StateLottery" element={<StateLotteryPage />} />
        <Route path="/TeenPatti" element={<TeenPattiPage />} />
        <Route path="/Wild3" element={<Wild3Page />} />
        <Route path="/Wild2" element={<Wild2Page />} />
        <Route path="/Wild1" element={<Wild1Page />} />
      </Routes>
    </HashRouter>
  );
}
