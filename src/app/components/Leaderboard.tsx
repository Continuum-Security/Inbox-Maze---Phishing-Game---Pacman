import { Card } from './ui/card';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface CompanyRanking {
  rank: number;
  name: string;
  totalScore: number;
  memberCount: number;
  avgScore: number;
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<CompanyRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ca4695ac/leaderboard`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Medal className={`size-8`} style={{ color: '#00FF88' }} />;
    }
    return <div className="size-8 flex items-center justify-center font-bold" style={{ color: '#00FF88' }}>{rank}</div>;
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0A0E1A' }}>
      {/* Grid Background */}
      <div className="fixed inset-0 grid-background" style={{ zIndex: 0 }} />
      <div className="scan-lines" />

      {/* Navigation */}
      <nav className="border-b backdrop-blur-md relative z-10" style={{ borderColor: 'rgba(0, 255, 136, 0.2)', backgroundColor: 'rgba(10, 14, 26, 0.9)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3">
              <Zap className="size-8" style={{ color: '#00FF88' }} />
              <h1 className="text-xl font-bold text-white">INBOX MAZE</h1>
            </Link>
            <div className="flex gap-3">
              <Link to="/challenge-dashboard">
                <Button variant="ghost" className="text-white transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.color = '#00FF88'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="size-12" style={{ color: '#00FF88' }} />
            <h2 className="text-4xl font-bold text-white">
              Company Leaderboard
            </h2>
          </div>
          <p className="text-xl text-gray-400">
            See how companies rank based on their cybersecurity awareness
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 p-6 text-center backdrop-blur-sm" style={{ 
            backgroundColor: '#0D1117', 
            borderColor: 'rgba(0, 255, 136, 0.4)',
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)'
          }}>
            <Trophy className="size-10 mx-auto mb-2" style={{ color: '#00FF88' }} />
            <div className="text-sm mb-1" style={{ color: '#00FF88' }}>Total Companies</div>
            <div className="text-3xl font-bold text-white">{leaderboard.length}</div>
          </Card>

          <Card className="border-2 p-6 text-center backdrop-blur-sm" style={{ 
            backgroundColor: '#0D1117', 
            borderColor: 'rgba(0, 212, 255, 0.4)',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)'
          }}>
            <Users className="size-10 mx-auto mb-2" style={{ color: '#00D4FF' }} />
            <div className="text-sm mb-1" style={{ color: '#00D4FF' }}>Total Participants</div>
            <div className="text-3xl font-bold text-white">
              {leaderboard.reduce((sum, company) => sum + company.memberCount, 0)}
            </div>
          </Card>

          <Card className="border-2 p-6 text-center backdrop-blur-sm" style={{ 
            backgroundColor: '#0D1117', 
            borderColor: 'rgba(179, 102, 255, 0.4)',
            boxShadow: '0 0 20px rgba(179, 102, 255, 0.2)'
          }}>
            <TrendingUp className="size-10 mx-auto mb-2" style={{ color: '#B366FF' }} />
            <div className="text-sm mb-1" style={{ color: '#B366FF' }}>Highest Score</div>
            <div className="text-3xl font-bold text-white">
              {leaderboard[0]?.totalScore || 0}
            </div>
          </Card>
        </div>

        {/* Leaderboard Table */}
        {loading ? (
          <Card className="border-2 p-12 text-center" style={{ 
            backgroundColor: '#0D1117', 
            borderColor: 'rgba(0, 212, 255, 0.3)'
          }}>
            <p className="text-white text-xl">Loading leaderboard...</p>
          </Card>
        ) : leaderboard.length === 0 ? (
          <Card className="border-2 p-12 text-center" style={{ 
            backgroundColor: '#0D1117', 
            borderColor: 'rgba(0, 212, 255, 0.3)'
          }}>
            <Trophy className="size-16 text-gray-600 mx-auto mb-4" />
            <p className="text-white text-xl mb-2">No companies yet</p>
            <p className="text-gray-400">Be the first to join the challenge!</p>
          </Card>
        ) : (
          <Card className="border-2 overflow-hidden" style={{ 
            backgroundColor: '#0D1117', 
            borderColor: 'rgba(0, 212, 255, 0.3)'
          }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: '#0A0E1A' }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Company</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Members</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Total Score</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Avg Score</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Cyber Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  {leaderboard.map((company, index) => {
                    const healthPercentage = Math.min(100, Math.round((company.avgScore / 400) * 100));

                    return (
                      <tr 
                        key={company.name} 
                        className="hover:bg-white/5 transition-colors"
                        style={{ backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.2)' : 'transparent' }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getRankIcon(company.rank)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white font-semibold text-lg">
                            {company.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-300">
                            <Users className="size-4" />
                            <span>{company.memberCount}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="font-bold text-lg" style={{ color: '#00D4FF' }}>
                            {company.totalScore.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-white font-semibold">
                            {company.avgScore}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="font-bold text-lg" style={{ color: '#00FF88' }}>
                            {healthPercentage}%
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Info Card */}
        <Card className="border-2 p-6 mt-8" style={{ 
          backgroundColor: '#0D1117', 
          borderColor: 'rgba(0, 212, 255, 0.3)'
        }}>
          <h3 className="text-xl font-semibold text-white mb-3">About Cyber Health Score</h3>
          <p className="text-gray-300 mb-3">
            The Cyber Health percentage represents your company's overall security awareness based on 
            average employee scores across all four security challenges.
          </p>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-green-900/30 rounded">
              <div className="text-green-400 font-bold mb-1">80-100%</div>
              <div className="text-gray-300">Excellent</div>
            </div>
            <div className="text-center p-3 bg-yellow-900/30 rounded">
              <div className="text-yellow-400 font-bold mb-1">60-79%</div>
              <div className="text-gray-300">Good</div>
            </div>
            <div className="text-center p-3 bg-orange-900/30 rounded">
              <div className="text-orange-400 font-bold mb-1">40-59%</div>
              <div className="text-gray-300">Fair</div>
            </div>
            <div className="text-center p-3 bg-red-900/30 rounded">
              <div className="text-red-400 font-bold mb-1">0-39%</div>
              <div className="text-gray-300">Needs Improvement</div>
            </div>
          </div>
        </Card>
      </div>

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