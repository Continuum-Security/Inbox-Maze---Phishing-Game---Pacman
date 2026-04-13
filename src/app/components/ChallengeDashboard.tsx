import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import {
  Trophy,
  Play,
  Lock,
  CheckCircle,
  LogOut,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useAuth } from "./AuthContext";
import {
  projectId,
  publicAnonKey,
} from "../../../utils/supabase/info";

interface Challenge {
  day: number;
  title: string;
  description: string;
  gameRoute: string;
  icon: string;
  status: "active" | "locked" | "completed";
  color: string;
}

export function ChallengeDashboard() {
  const navigate = useNavigate();
  const { user, accessToken, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(1);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const challenges: Challenge[] = [
    {
      day: 1,
      title: "Phish Patrol",
      description:
        "Detect and defend against sophisticated phishing attacks",
      gameRoute: "/games/phishing",
      icon: "🎣",
      status: currentDay >= 1 ? "active" : "locked",
      color: "from-cyan-600 to-blue-700",
    },
    {
      day: 2,
      title: "2FA Time Vault",
      description:
        "Master two-factor authentication under time pressure",
      gameRoute: "/games/2fa",
      icon: "🔐",
      status: currentDay >= 2 ? "active" : "locked",
      color: "from-purple-600 to-pink-700",
    },
    {
      day: 3,
      title: "Malware Blaster",
      description:
        "Identify and eliminate dangerous malware threats",
      gameRoute: "/games/malware",
      icon: "🛡️",
      status: "active",
      color: "from-orange-600 to-red-700",
    },
    {
      day: 4,
      title: "Data Shield Dash",
      description:
        "Protect sensitive data from unauthorized access",
      gameRoute: "/games/data-protection",
      icon: "💾",
      status: currentDay >= 4 ? "active" : "locked",
      color: "from-green-600 to-teal-700",
    },
    {
      day: 5,
      title: "Secure Runner",
      description:
        "Complete a full security audit in record time",
      gameRoute: "/games/secure-runner",
      icon: "🏃",
      status: currentDay >= 5 ? "active" : "locked",
      color: "from-indigo-600 to-purple-700",
    },
  ];

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ca4695ac/profile`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        // TODO: Calculate current day based on competition start date
        // For now, unlocking day by day for demo
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
            <Play className="size-3" />
            Active
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <CheckCircle className="size-3" />
            Completed
          </span>
        );
      case "locked":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-400 border border-slate-600">
            <Lock className="size-3" />
            Locked
          </span>
        );
    }
  };

  const getCyberHealthScore = () => {
    const maxScore = 500; // Assuming max possible score per game * 4 games
    const percentage = profile?.totalScore
      ? Math.min((profile.totalScore / maxScore) * 100, 100)
      : 0;
    return Math.round(percentage);
  };

  const getCyberHealthColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0A0E1A" }}
      >
        <div className="text-white text-xl">
          Loading your challenges...
        </div>
      </div>
    );
  }

  const cyberHealthScore = getCyberHealthScore();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: "#0A0E1A" }}
    >
      {/* Grid Background */}
      <div
        className="fixed inset-0 grid-background"
        style={{ zIndex: 0 }}
      />
      <div className="scan-lines" />

      {/* Navigation */}
      <nav
        className="border-b backdrop-blur-md sticky top-0 z-50"
        style={{
          borderColor: "rgba(0, 255, 136, 0.2)",
          backgroundColor: "rgba(10, 14, 26, 0.9)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              to="/challenge-dashboard"
              className="flex items-center gap-3"
            >
              <Zap
                className="size-8"
                style={{ color: "#00FF88" }}
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">
                  INBOX MAZE
                </h1>
                <p
                  className="text-xs"
                  style={{ color: "#00D4FF" }}
                >
                  5-Day Security Competition
                </p>
              </div>
            </Link>
            <div className="flex gap-2 sm:gap-3 items-center">
              <Link
                to="/leaderboard"
                className="hidden sm:block"
              >
                <Button
                  variant="ghost"
                  className="text-white transition-colors"
                  style={{ "--hover-color": "#00FF88" } as any}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#00FF88")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "white")
                  }
                >
                  <Trophy className="size-4 mr-2" />
                  Leaderboard
                </Button>
              </Link>
              <Link to="/company" className="hidden sm:block">
                <Button
                  variant="ghost"
                  className="text-white transition-colors"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#00FF88")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "white")
                  }
                >
                  <Users className="size-4 mr-2" />
                  My Team
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="text-white transition-colors"
                onClick={handleSignOut}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "#00FF88")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "white")
                }
              >
                <LogOut className="size-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  Sign Out
                </span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 relative z-10">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Welcome back, {profile?.name}! 👋
          </h2>
          <p className="text-lg sm:text-xl text-gray-400">
            {profile?.company} • Day {currentDay} of 5
          </p>
        </div>

        {/* Top Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Total Score */}
          <Card
            className="border-2 p-6 backdrop-blur-sm"
            style={{
              backgroundColor: "#0D1117",
              borderColor: "rgba(0, 255, 136, 0.4)",
              boxShadow: "0 0 20px rgba(0, 255, 136, 0.2)",
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div
                className="text-sm"
                style={{ color: "#00FF88" }}
              >
                Total Score
              </div>
              <Trophy
                className="size-5"
                style={{ color: "#00FF88" }}
              />
            </div>
            <div className="text-4xl font-bold text-white mb-1">
              {profile?.totalScore || 0}
            </div>
            <div className="text-gray-400 text-sm">
              points earned
            </div>
          </Card>

          {/* Games Played */}
          <Card
            className="border-2 p-6 backdrop-blur-sm"
            style={{
              backgroundColor: "#0D1117",
              borderColor: "rgba(0, 212, 255, 0.4)",
              boxShadow: "0 0 20px rgba(0, 212, 255, 0.2)",
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div
                className="text-sm"
                style={{ color: "#00D4FF" }}
              >
                Games Played
              </div>
              <Play
                className="size-5"
                style={{ color: "#00D4FF" }}
              />
            </div>
            <div className="text-4xl font-bold text-white mb-1">
              {profile?.gamesPlayed || 0}
            </div>
            <div className="text-gray-400 text-sm">
              challenges completed
            </div>
          </Card>

          {/* Company */}
          <Card
            className="border-2 p-6 backdrop-blur-sm"
            style={{
              backgroundColor: "#0D1117",
              borderColor: "rgba(179, 102, 255, 0.4)",
              boxShadow: "0 0 20px rgba(179, 102, 255, 0.2)",
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div
                className="text-sm"
                style={{ color: "#B366FF" }}
              >
                Company
              </div>
              <Users
                className="size-5"
                style={{ color: "#B366FF" }}
              />
            </div>
            <div className="text-xl font-bold text-white mb-1">
              {profile?.company || "N/A"}
            </div>
            <div className="text-gray-400 text-sm">
              your team
            </div>
          </Card>
        </div>

        {/* Continue Your Training */}
        <div className="mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            Continue Your Training
          </h3>

          {/* Play Games Card */}
          <Card
            className="border-2 p-6 sm:p-8 backdrop-blur-sm"
            style={{
              backgroundColor: "#0D1117",
              borderColor: "rgba(0, 255, 136, 0.4)",
              boxShadow: "0 0 20px rgba(0, 255, 136, 0.2)",
            }}
          >
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
              Play Games
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 text-gray-300 text-sm sm:text-base">
              <div>
                <h4 className="font-semibold text-white mb-2">
                  📅 Daily Unlocks
                </h4>
                <p>
                  A new challenge unlocks each day. Complete
                  them to boost your score!
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">
                  🏆 Team Competition
                </h4>
                <p>
                  Your scores contribute to your company's
                  overall cyber health rating.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">
                  👥 Invite & Compete
                </h4>
                <p>
                  Invite colleagues to strengthen your team's
                  position on the leaderboard.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">
                  🎯 Replay Anytime
                </h4>
                <p>
                  Play challenges multiple times to improve your
                  score before time runs out!
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* 5-Day Challenge Grid */}
        <div className="mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            5-Day Security Challenge
          </h3>

          {/* Desktop Grid */}
          <div className="hidden lg:grid lg:grid-cols-5 gap-4">
            {challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.day}
                challenge={challenge}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>

          {/* Tablet Grid */}
          <div className="hidden sm:grid lg:hidden sm:grid-cols-2 gap-4">
            {challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.day}
                challenge={challenge}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>

          {/* Mobile Grid */}
          <div className="grid sm:hidden grid-cols-1 gap-4">
            {challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.day}
                challenge={challenge}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowInviteModal(false)}
        >
          <Card
            className="bg-slate-800 border-slate-700 p-6 sm:p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Invite Your Team
                </h3>
                <p className="text-gray-400 text-sm">
                  Share your company name with colleagues
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-4">
              <div className="text-xs text-gray-400 mb-1">
                Your Company Name
              </div>
              <div className="text-xl font-bold text-white mb-3">
                {profile?.company}
              </div>
              <div className="text-sm text-gray-300">
                Tell your colleagues to sign up using this exact
                company name to join your team.
              </div>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mb-6">
              <div className="text-sm text-cyan-100">
                💡 <strong>Tip:</strong> The more teammates you
                have, the better your company's overall cyber
                health score!
              </div>
            </div>

            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => {
                navigator.clipboard.writeText(
                  profile?.company || "",
                );
                alert("Company name copied to clipboard!");
              }}
            >
              Copy Company Name
            </Button>
          </Card>
        </div>
      )}

      <style>{`
        .grid-background {
          background-image: 
            linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: grid-move 20s linear infinite;
        }

        @keyframes grid-move {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 50px 50px;
          }
        }

        .scan-lines {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            transparent 50%,
            rgba(0, 212, 255, 0.03) 50%
          );
          background-size: 100% 4px;
          pointer-events: none;
          animation: scan 8s linear infinite;
          z-index: 1;
        }

        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
      `}</style>
    </div>
  );
}

// Challenge Card Component
interface ChallengeCardProps {
  challenge: Challenge;
  getStatusBadge: (status: string) => JSX.Element;
}

function ChallengeCard({
  challenge,
  getStatusBadge,
}: ChallengeCardProps) {
  const isLocked = challenge.status === "locked";
  const isActive = challenge.status === "active";

  return (
    <Card
      className={`
        relative overflow-hidden
        ${isLocked ? "bg-slate-800/30 border-slate-700" : `bg-gradient-to-br ${challenge.color} border-0`}
        ${isActive ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900" : ""}
        transition-all hover:scale-105 cursor-pointer
        ${isLocked ? "opacity-60" : ""}
      `}
    >
      <div className="p-6">
        {/* Day Badge */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={`text-xs font-bold px-2 py-1 rounded ${isLocked ? "bg-slate-700 text-slate-400" : "bg-white/20 text-white"}`}
          >
            DAY {challenge.day}
          </div>
          {getStatusBadge(challenge.status)}
        </div>

        {/* Icon */}
        <div className="text-5xl mb-4 grayscale-0 filter">
          {challenge.icon}
        </div>

        {/* Title */}
        <h4
          className={`text-xl font-bold mb-2 ${isLocked ? "text-slate-400" : "text-white"}`}
        >
          {challenge.title}
        </h4>

        {/* Description */}
        <p
          className={`text-sm mb-6 ${isLocked ? "text-slate-500" : "text-white/80"}`}
        >
          {challenge.description}
        </p>

        {/* Action Button */}
        {isLocked ? (
          <Button
            disabled
            className="w-full bg-slate-700 text-slate-400 cursor-not-allowed"
          >
            <Lock className="size-4 mr-2" />
            Locked
          </Button>
        ) : (
          <Link to={challenge.gameRoute}>
            <Button className="w-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
              <Play className="size-4 mr-2" />
              Play Now
            </Button>
          </Link>
        )}
      </div>

      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px]">
          <Lock className="size-12 text-slate-600" />
        </div>
      )}
    </Card>
  );
}