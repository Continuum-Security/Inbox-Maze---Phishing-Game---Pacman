import { createHashRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./components/Home";
import { SignUp } from "./components/SignUp";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { ChallengeDashboard } from "./components/ChallengeDashboard";
import { GameHub } from "./components/GameHub";
import { PhishingGame } from "./components/games/PhishingGame";
import { TwoFactorGame } from "./components/games/TwoFactorGame";
import { MalwareGame } from "./components/games/MalwareGame";
import { DataProtectionGame } from "./components/games/DataProtectionGame";
import { SecureRunnerGame } from "./components/games/SecureRunnerGame";
import { Leaderboard } from "./components/Leaderboard";
import { CompanyDashboard } from "./components/CompanyDashboard";
import { BackendTest } from "./components/BackendTest";

export const router = createHashRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "signup", Component: SignUp },
      { path: "login", Component: Login },
      { path: "dashboard", Component: Dashboard },
      { path: "challenge-dashboard", Component: ChallengeDashboard },
      { path: "backend-test", Component: BackendTest },
      { path: "games", Component: GameHub },
      { path: "games/phishing", Component: PhishingGame },
      { path: "games/2fa", Component: TwoFactorGame },
      { path: "games/malware", Component: MalwareGame },
      { path: "games/data-protection", Component: DataProtectionGame },
      { path: "games/secure-runner", Component: SecureRunnerGame },
      { path: "leaderboard", Component: Leaderboard },
      { path: "company", Component: CompanyDashboard },
    ],
  },
]);
