import { Link } from 'react-router';
import { Shield, Trophy, Users, Lock, Mail, Database, Wifi, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useAuth } from './AuthContext';

export function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0E1A' }}>
      {/* Navigation */}
      <nav className="border-b backdrop-blur-md" style={{ 
        borderColor: 'rgba(0, 212, 255, 0.1)',
        backgroundColor: 'rgba(10, 14, 26, 0.8)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Zap className="size-7" style={{ color: '#00FF88' }} />
              <h1 className="text-xl font-bold text-white" style={{ letterSpacing: '0.1em' }}>
                INBOX MAZE
              </h1>
            </div>
            <div className="flex gap-3">
              {user ? (
                <Link to="/challenge-dashboard">
                  <Button className="font-bold" style={{ 
                    backgroundColor: '#00FF88',
                    color: '#0A0E1A'
                  }}>
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="text-white hover:bg-white/10">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="font-bold" style={{ 
                      backgroundColor: '#00FF88',
                      color: '#0A0E1A'
                    }}>
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 grid-background" />
        
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" 
          style={{ background: 'radial-gradient(circle, #00FF88 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" 
          style={{ background: 'radial-gradient(circle, #00D4FF 0%, transparent 70%)' }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            {/* Glitch Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border backdrop-blur-sm"
              style={{ 
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                borderColor: '#00FF88'
              }}>
              <Zap className="size-4" style={{ color: '#00FF88' }} />
              <span className="text-sm font-bold" style={{ color: '#00FF88', letterSpacing: '0.05em' }}>
                ARCADE-STYLE SECURITY TRAINING
              </span>
            </div>

            <h2 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Navigate the Threat.<br />
              <span className="arcade-glow" style={{ color: '#00FF88' }}>Master the Inbox.</span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              A 5-day arcade-style phishing awareness challenge.<br />
              Spot threats, collect intel, climb the leaderboard.
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/signup">
                <Button size="lg" className="text-lg px-10 py-6 font-bold neon-button"
                  style={{ 
                    backgroundColor: '#00FF88',
                    color: '#0A0E1A',
                    boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)'
                  }}>
                  Enter the Maze
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-10 py-6 font-bold ghost-button"
                style={{ 
                  borderColor: '#00D4FF',
                  color: '#00D4FF',
                  backgroundColor: 'transparent'
                }}>
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-4xl font-bold text-white text-center mb-3">
          Choose Your Challenge Zone
        </h3>
        <p className="text-center text-gray-400 mb-12 text-lg">
          Master each zone to complete your cybersecurity training
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Zone 1 - Phishing Detection */}
          <Card className="zone-card relative p-6 transition-all duration-300 group" 
            style={{ 
              backgroundColor: '#0D1117',
              borderColor: 'rgba(0, 255, 136, 0.2)'
            }}
            data-accent="#00FF88">
            <div className="zone-glow" style={{ '--accent-color': '#00FF88' } as React.CSSProperties} />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="px-2 py-1 rounded text-xs font-bold" 
                  style={{ 
                    backgroundColor: 'rgba(0, 255, 136, 0.15)',
                    color: '#00FF88',
                    letterSpacing: '0.05em'
                  }}>
                  ZONE 1
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#00FF88' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-700" />
                  <div className="w-2 h-2 rounded-full bg-gray-700" />
                </div>
              </div>

              <div className="mb-4">
                <Mail className="size-12 mb-3" style={{ color: '#00FF88', strokeWidth: 1.5 }} />
              </div>

              <h4 className="text-xl font-semibold text-white mb-2">Phishing Detection</h4>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Learn to identify malicious emails and protect against social engineering attacks.
              </p>

              <Link to="/games/phishing" 
                className="inline-flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all"
                style={{ color: '#00FF88' }}>
                Enter Zone 
                <span>→</span>
              </Link>
            </div>
          </Card>

          {/* Zone 2 - 2-Factor Authentication */}
          <Card className="zone-card relative p-6 transition-all duration-300 group" 
            style={{ 
              backgroundColor: '#0D1117',
              borderColor: 'rgba(0, 212, 255, 0.2)'
            }}
            data-accent="#00D4FF">
            <div className="zone-glow" style={{ '--accent-color': '#00D4FF' } as React.CSSProperties} />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="px-2 py-1 rounded text-xs font-bold" 
                  style={{ 
                    backgroundColor: 'rgba(0, 212, 255, 0.15)',
                    color: '#00D4FF',
                    letterSpacing: '0.05em'
                  }}>
                  ZONE 2
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#00D4FF' }} />
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#00D4FF' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-700" />
                </div>
              </div>

              <div className="mb-4">
                <Lock className="size-12 mb-3" style={{ color: '#00D4FF', strokeWidth: 1.5 }} />
              </div>

              <h4 className="text-xl font-semibold text-white mb-2">2-Factor Authentication</h4>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Master the importance of multi-factor authentication in securing accounts.
              </p>

              <Link to="/games/2fa" 
                className="inline-flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all"
                style={{ color: '#00D4FF' }}>
                Enter Zone 
                <span>→</span>
              </Link>
            </div>
          </Card>

          {/* Zone 3 - Malware Protection */}
          <Card className="zone-card relative p-6 transition-all duration-300 group" 
            style={{ 
              backgroundColor: '#0D1117',
              borderColor: 'rgba(255, 51, 102, 0.2)'
            }}
            data-accent="#FF3366">
            <div className="zone-glow" style={{ '--accent-color': '#FF3366' } as React.CSSProperties} />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="px-2 py-1 rounded text-xs font-bold" 
                  style={{ 
                    backgroundColor: 'rgba(255, 51, 102, 0.15)',
                    color: '#FF3366',
                    letterSpacing: '0.05em'
                  }}>
                  ZONE 3
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FF3366' }} />
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FF3366' }} />
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FF3366' }} />
                </div>
              </div>

              <div className="mb-4">
                <Wifi className="size-12 mb-3" style={{ color: '#FF3366', strokeWidth: 1.5 }} />
              </div>

              <h4 className="text-xl font-semibold text-white mb-2">Malware Protection</h4>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Identify and defend against various types of malware and ransomware threats.
              </p>

              <Link to="/games/malware" 
                className="inline-flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all"
                style={{ color: '#FF3366' }}>
                Enter Zone 
                <span>→</span>
              </Link>
            </div>
          </Card>

          {/* Zone 4 - Data Protection */}
          <Card className="zone-card relative p-6 transition-all duration-300 group" 
            style={{ 
              backgroundColor: '#0D1117',
              borderColor: 'rgba(179, 102, 255, 0.2)'
            }}
            data-accent="#B366FF">
            <div className="zone-glow" style={{ '--accent-color': '#B366FF' } as React.CSSProperties} />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="px-2 py-1 rounded text-xs font-bold" 
                  style={{ 
                    backgroundColor: 'rgba(179, 102, 255, 0.15)',
                    color: '#B366FF',
                    letterSpacing: '0.05em'
                  }}>
                  ZONE 4
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#B366FF' }} />
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#B366FF' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-700" />
                </div>
              </div>

              <div className="mb-4">
                <Database className="size-12 mb-3" style={{ color: '#B366FF', strokeWidth: 1.5 }} />
              </div>

              <h4 className="text-xl font-semibold text-white mb-2">Data Protection</h4>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Understand best practices for securing sensitive data and maintaining privacy.
              </p>

              <Link to="/games/data-protection" 
                className="inline-flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all"
                style={{ color: '#B366FF' }}>
                Enter Zone 
                <span>→</span>
              </Link>
            </div>
          </Card>
        </div>

        {/* How It Works */}
        <div className="rounded-lg p-8 mb-16" style={{ 
          backgroundColor: '#0A0E1A',
          border: '1px solid rgba(0, 212, 255, 0.2)'
        }}>
          <h3 className="text-3xl font-bold text-white text-center mb-2">Your Mission Briefing</h3>
          <p className="text-center text-gray-400 mb-10 text-sm">
            Complete these steps to master cybersecurity
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="hexagon-badge mx-auto mb-4">
                <span className="text-2xl font-bold" style={{ color: '#00FF88' }}>1</span>
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Join the Grid</h4>
              <p className="text-gray-400">
                Create your account and join your company's team. Invite colleagues to compete together.
              </p>
            </div>

            <div className="text-center">
              <div className="hexagon-badge mx-auto mb-4">
                <span className="text-2xl font-bold" style={{ color: '#00FF88' }}>2</span>
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Navigate the Maze</h4>
              <p className="text-gray-400">
                Complete interactive challenges across 4 cybersecurity topics over 5 days.
              </p>
            </div>

            <div className="text-center">
              <div className="hexagon-badge mx-auto mb-4">
                <span className="text-2xl font-bold" style={{ color: '#00FF88' }}>3</span>
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Climb the Ranks</h4>
              <p className="text-gray-400">
                Monitor your company's cyber health score and compete on the leaderboard.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="stat-card relative p-8 text-center transition-all duration-300" 
            style={{ 
              backgroundColor: '#0D1117',
              borderColor: 'rgba(0, 212, 255, 0.3)',
              border: '2px solid'
            }}
            data-stat-accent="#00D4FF">
            <div className="stat-glow" style={{ '--stat-accent': '#00D4FF' } as React.CSSProperties} />
            <div className="relative z-10">
              <Trophy className="size-12 mx-auto mb-3" style={{ color: '#00D4FF', strokeWidth: 1.5 }} />
              <div className="text-4xl font-bold text-white mb-2">5 LEVELS</div>
              <div className="text-sm" style={{ color: '#00D4FF', letterSpacing: '0.05em' }}>
                COMPETITION DURATION
              </div>
            </div>
          </Card>

          <Card className="stat-card relative p-8 text-center transition-all duration-300" 
            style={{ 
              backgroundColor: '#0D1117',
              borderColor: 'rgba(0, 255, 136, 0.3)',
              border: '2px solid'
            }}
            data-stat-accent="#00FF88">
            <div className="stat-glow" style={{ '--stat-accent': '#00FF88' } as React.CSSProperties} />
            <div className="relative z-10">
              <Users className="size-12 mx-auto mb-3" style={{ color: '#00FF88', strokeWidth: 1.5 }} />
              <div className="text-4xl font-bold text-white mb-2">SQUAD MODE</div>
              <div className="text-sm" style={{ color: '#00FF88', letterSpacing: '0.05em' }}>
                COMPANY LEADERBOARDS
              </div>
            </div>
          </Card>

          <Card className="stat-card relative p-8 text-center transition-all duration-300" 
            style={{ 
              backgroundColor: '#0D1117',
              borderColor: 'rgba(179, 102, 255, 0.3)',
              border: '2px solid'
            }}
            data-stat-accent="#B366FF">
            <div className="stat-glow" style={{ '--stat-accent': '#B366FF' } as React.CSSProperties} />
            <div className="relative z-10">
              <Shield className="size-12 mx-auto mb-3" style={{ color: '#B366FF', strokeWidth: 1.5 }} />
              <div className="text-4xl font-bold text-white mb-2">4 ZONES</div>
              <div className="text-sm" style={{ color: '#B366FF', letterSpacing: '0.05em' }}>
                SECURITY TOPICS
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-16" style={{ 
        borderColor: 'rgba(0, 212, 255, 0.1)',
        backgroundColor: '#0A0E1A'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2026 INBOX MAZE. Navigate smarter. Stay secure.</p>
          </div>
        </div>
      </footer>

      {/* Arcade-Inspired Styles */}
      <style>{`
        .grid-background {
          background-image: 
            linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
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

        .arcade-glow {
          animation: glow-pulse 2s ease-in-out infinite;
          text-shadow: 
            0 0 10px rgba(0, 255, 136, 0.5),
            0 0 20px rgba(0, 255, 136, 0.3),
            0 0 30px rgba(0, 255, 136, 0.2);
        }

        @keyframes glow-pulse {
          0%, 100% {
            text-shadow: 
              0 0 10px rgba(0, 255, 136, 0.5),
              0 0 20px rgba(0, 255, 136, 0.3),
              0 0 30px rgba(0, 255, 136, 0.2);
          }
          50% {
            text-shadow: 
              0 0 20px rgba(0, 255, 136, 0.8),
              0 0 30px rgba(0, 255, 136, 0.5),
              0 0 40px rgba(0, 255, 136, 0.3);
          }
        }

        .neon-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .neon-button:hover {
          box-shadow: 0 0 30px rgba(0, 255, 136, 0.6) !important;
          transform: translateY(-2px);
        }

        .neon-button:active {
          transform: translateY(0);
        }

        .ghost-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .ghost-button:hover {
          background-color: rgba(0, 212, 255, 0.1) !important;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
          transform: translateY(-2px);
        }

        .ghost-button:active {
          transform: translateY(0);
        }

        .zone-card {
          border: 2px solid;
          border-radius: 10px;
          position: relative;
          overflow: hidden;
        }

        .zone-card .zone-glow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, var(--accent-color) 0%, transparent 70%);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .zone-card:hover .zone-glow {
          opacity: 0.15;
        }

        .zone-card:hover {
          box-shadow: 0 0 30px var(--accent-color, rgba(0, 255, 136, 0.3));
          transform: translateY(-4px);
        }

        .zone-card[data-accent="#00FF88"]:hover {
          box-shadow: 0 0 30px rgba(0, 255, 136, 0.4);
          border-color: rgba(0, 255, 136, 0.6) !important;
        }

        .zone-card[data-accent="#00D4FF"]:hover {
          box-shadow: 0 0 30px rgba(0, 212, 255, 0.4);
          border-color: rgba(0, 212, 255, 0.6) !important;
        }

        .zone-card[data-accent="#FF3366"]:hover {
          box-shadow: 0 0 30px rgba(255, 51, 102, 0.4);
          border-color: rgba(255, 51, 102, 0.6) !important;
        }

        .zone-card[data-accent="#B366FF"]:hover {
          box-shadow: 0 0 30px rgba(179, 102, 255, 0.4);
          border-color: rgba(179, 102, 255, 0.6) !important;
        }

        .zone-card .relative.z-10 {
          position: relative;
          z-index: 10;
        }

        .hexagon-badge {
          width: 50px;
          height: 58px;
          background: linear-gradient(30deg, #00FF88, #00FF88);
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0A0E1A;
          font-weight: bold;
        }

        .stat-card {
          border: 2px solid;
          border-radius: 10px;
          position: relative;
          overflow: hidden;
        }

        .stat-card .stat-glow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, var(--stat-accent) 0%, transparent 70%);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .stat-card:hover .stat-glow {
          opacity: 0.15;
        }

        .stat-card:hover {
          box-shadow: 0 0 30px var(--stat-accent, rgba(0, 255, 136, 0.3));
          transform: translateY(-4px);
        }

        .stat-card[data-stat-accent="#00FF88"]:hover {
          box-shadow: 0 0 30px rgba(0, 255, 136, 0.4);
          border-color: rgba(0, 255, 136, 0.6) !important;
        }

        .stat-card[data-stat-accent="#00D4FF"]:hover {
          box-shadow: 0 0 30px rgba(0, 212, 255, 0.4);
          border-color: rgba(0, 212, 255, 0.6) !important;
        }

        .stat-card[data-stat-accent="#FF3366"]:hover {
          box-shadow: 0 0 30px rgba(255, 51, 102, 0.4);
          border-color: rgba(255, 51, 102, 0.6) !important;
        }

        .stat-card[data-stat-accent="#B366FF"]:hover {
          box-shadow: 0 0 30px rgba(179, 102, 255, 0.4);
          border-color: rgba(179, 102, 255, 0.6) !important;
        }

        .stat-card .relative.z-10 {
          position: relative;
          z-index: 10;
        }
      `}</style>
    </div>
  );
}