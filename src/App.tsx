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
import HighRollerPage from "./pages/HighRollerPage";
import PowerPage from "./pages/PowerPage";
import SAPPHIREPage from "./pages/SAPPHIREPage";

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
        <Route path="/scratch_wild3" element={<Wild3Page />} />
        <Route path="/scratch_wild2" element={<Wild2Page />} />
        <Route path="/scratch_wild1" element={<Wild1Page />} />
        <Route path="/scratch_high_roller" element={<HighRollerPage />} />
        <Route path="/scratch_power" element={<PowerPage />} />
        <Route path="/scratch_sapphire" element={<SAPPHIREPage />} />
      </Routes>
    </HashRouter>
  );
}
