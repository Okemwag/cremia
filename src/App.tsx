import { Navigate, Route, Routes } from "react-router-dom";
import PlatformShell from "./features/platform/layouts/PlatformShell";
import {
  ActivityPage,
  ConnectPage,
  FundingPage,
  LearnPage,
  MarketToolsPage,
  MarketsPage,
  NotificationsPage,
  OnboardingPage,
  OverviewPage,
  PortfolioPage,
  PositionDetailPage,
  SupportPage,
  TradePage,
} from "./pages/dashboard";
import LandingPage from "./pages/LandingPage";
import AuthCallbackPage from "./pages/auth/AuthCallbackPage";
import LoginPage from "./pages/auth/LoginPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/app" element={<PlatformShell />}>
        <Route index element={<OverviewPage />} />
        <Route path="markets" element={<MarketsPage />} />
        <Route path="watchlist" element={<MarketToolsPage />} />
        <Route path="trade" element={<TradePage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="portfolio/:contractID" element={<PositionDetailPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="funding" element={<FundingPage />} />
        <Route path="connect" element={<ConnectPage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="learn" element={<LearnPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="support" element={<SupportPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
