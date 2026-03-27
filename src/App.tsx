import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Planner from "./pages/Planner";
import Invest from "./pages/Invest";
import Academy from "./pages/Academy";
import FirePlanner from "./pages/FirePlanner";
import HealthScore from "./pages/HealthScore";
import LifeAdvisor from "./pages/LifeAdvisor";
import TaxWizard from "./pages/TaxWizard";
import CouplesPlanner from "./pages/CouplesPlanner";
import PortfolioXRay from "./pages/PortfolioXRay";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/invest" element={<Invest />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/fire-planner" element={<FirePlanner />} />
          <Route path="/health-score" element={<HealthScore />} />
          <Route path="/life-advisor" element={<LifeAdvisor />} />
          <Route path="/tax-wizard" element={<TaxWizard />} />
          <Route path="/couples-planner" element={<CouplesPlanner />} />
          <Route path="/portfolio-xray" element={<PortfolioXRay />} />
        </Routes>
      </Layout>
    </Router>
  );
}
