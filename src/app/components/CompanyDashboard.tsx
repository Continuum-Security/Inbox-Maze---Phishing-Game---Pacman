import { useAuth } from './AuthContext';
import { projectId } from '../../../utils/supabase/info';

interface TeamMember {
  name: string;
  email: string;
  totalScore: number;
  gamesPlayed: number;
}

interface CompanyData {
  name: string;
  totalScore: number;
  memberCount: number;
  avgScore: number;
  members: TeamMember[];
}

export function CompanyDashboard() {
  const { user, accessToken } = useAuth();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      // Fetch user profile first to get company name
      const profileResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ca4695ac/profile`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        setUserProfile(profile);

        // Fetch company data
        const companyName = profile.company.toLowerCase().replace(/\s+/g, '-');
        const companyResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-ca4695ac/company/${companyName}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (companyResponse.ok) {
          const data = await companyResponse.json();
          setCompanyData(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch company data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0E1A' }}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const healthPercentage = companyData 
    ? Math.min(100, Math.round((companyData.avgScore / 400) * 100))
    : 0;

  const healthLabel = 
    healthPercentage >= 80 ? 'Excellent' :
    healthPercentage >= 60 ? 'Good' :
    healthPercentage >= 40 ? 'Fair' :
    'Needs Improvement';

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0A0E1A' }}>
      {/* Grid Background */}
      <div className="fixed inset-0 grid-background" style={{ zIndex: 0 }} />
      <div className="scan-lines" />

      {/* Navigation */}
      <nav className="border-b backdrop-blur-md relative z-10" style={{ borderColor: 'rgba(0, 255, 136, 0.2)', backgroundColor: 'rgba(10, 14, 26, 0.9)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/challenge-dashboard" className="flex items-center gap-3">
              <Zap className="size-8" style={{ color: '#00FF88' }} />
              <h1 className="text-xl font-bold text-white">INBOX MAZE</h1>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <Link to="/challenge-dashboard">
          <Button variant="ghost" className="text-white mb-6 transition-colors"
            onMouseEnter={(e) => e.currentTarget.style.color = '#00FF88'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>
            <ArrowLeft className="size-4 mr-2" />
            Back to Grid
          </Button>
        </Link>

        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            {companyData?.name} Team
          </h2>
          <p className="text-xl text-gray-400">
            Track your team's cybersecurity performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 p-6 backdrop-blur-sm" style={{ 
            backgroundColor: '#0D1117', 
            borderColor: 'rgba(0, 255, 136, 0.4)',
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)'
          }}>
            <Users className="size-8 mb-2" style={{ color: '#00FF88' }} />
            <div className="text-sm mb-1" style={{ color: '#00FF88' }}>Team Members</div>
            <div className="text-4xl font-bold text-white">{companyData?.memberCount || 0}</div>
          </Card>

          <Card className="border-2 p-6 backdrop-blur-sm" style={{ 
            backgroundColor: '#0D1117', 
            borderColor: 'rgba(0, 212, 255, 0.4)',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)'
          }}>
            <TrendingUp className="size-8 mb-2" style={{ color: '#00D4FF' }} />
            <div className="text-sm mb-1" style={{ color: '#00D4FF' }}>Total Score</div>
            <div className="text-4xl font-bold text-white">
              {companyData?.totalScore.toLocaleString() || 0}
            </div>
          </Card>

          <Card className="border-2 p-6 backdrop-blur-sm" style={{ 
            backgroundColor: '#0D1117', 
            borderColor: 'rgba(179, 102, 255, 0.4)',
            boxShadow: '0 0 20px rgba(179, 102, 255, 0.2)'
          }}>
            <Award className="size-8 mb-2" style={{ color: '#B366FF' }} />
            <div className="text-sm mb-1" style={{ color: '#B366FF' }}>Average Score</div>
            <div className="text-4xl font-bold text-white">{companyData?.avgScore || 0}</div>
          </Card>

          <Card className="border-2 p-6 backdrop-blur-sm" style={{ 
            backgroundColor: '#0D1117', 
            borderColor: 'rgba(255, 51, 102, 0.4)',
            boxShadow: '0 0 20px rgba(255, 51, 102, 0.2)'
          }}>
            <Heart className="size-8 mb-2" style={{ color: '#FF3366' }} />
            <div className="text-sm mb-1" style={{ color: '#FF3366' }}>Cyber Health</div>
            <div className="text-4xl font-bold text-white">{healthPercentage}%</div>
            <div className="text-sm mt-1" style={{ color: '#FF3366' }}>{healthLabel}</div>
          </Card>
        </div>

        {/* Invite Section */}
        <Card className="border-2 p-6 mb-8 backdrop-blur-sm" style={{ 
          backgroundColor: '#0D1117', 
          borderColor: 'rgba(0, 212, 255, 0.4)',
          boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)'
        }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <UserPlus className="size-6" style={{ color: '#00D4FF' }} />
                Invite Your Team
              </h3>
              <p className="text-gray-300 mb-4">
                Increase your company's cyber health score by inviting more colleagues to participate. 
                Share your company name: <strong style={{ color: '#00D4FF' }}>{userProfile?.company}</strong>
              </p>
              <Button 
                onClick={() => setShowInvite(!showInvite)}
                style={{ backgroundColor: '#00FF88', color: '#0A0E1A' }}
                className="hover-glow"
              >
                {showInvite ? 'Hide Instructions' : 'Show Invite Instructions'}
              </Button>
            </div>
          </div>
          
          {showInvite && (
            <div className="mt-6 p-4 rounded" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
              <h4 className="font-semibold text-white mb-2">How to invite team members:</h4>
              <ol className="text-gray-300 space-y-2 list-decimal list-inside">
                <li>Share the challenge URL with your colleagues</li>
                <li>Tell them to use the company name: <span className="font-mono" style={{ color: '#00D4FF' }}>{userProfile?.company}</span></li>
                <li>They'll be automatically added to your team when they sign up</li>
                <li>Their scores will contribute to your company's total and average</li>
              </ol>
            </div>
          )}
        </Card>

        {/* Team Members Table */}
        <Card className="border-2 overflow-hidden" style={{ 
          backgroundColor: '#0D1117', 
          borderColor: 'rgba(0, 212, 255, 0.3)'
        }}>
          <div className="p-6 border-b" style={{ backgroundColor: '#0A0E1A', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="size-6" style={{ color: '#00D4FF' }} />
              Team Members
            </h3>
          </div>
          
          {companyData && companyData.members.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: '#0A0E1A' }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Games Played</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Total Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  {companyData.members.map((member, index) => (
                    <tr 
                      key={member.email}
                      className="hover:bg-white/5 transition-colors"
                      style={{ backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.2)' : 'transparent' }}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold" style={{ color: '#00FF88' }}>
                          #{index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-semibold">
                          {member.name}
                          {member.email === userProfile?.email && (
                            <span className="ml-2 text-xs" style={{ color: '#00D4FF' }}>(You)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-400">{member.email}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-white">{member.gamesPlayed}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="font-bold text-lg" style={{ color: '#00D4FF' }}>
                          {member.totalScore.toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Users className="size-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No team members yet</p>
            </div>
          )}
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card className="border-2 p-6" style={{ 
            backgroundColor: '#0D1117', 
            borderColor: 'rgba(0, 212, 255, 0.3)'
          }}>
            <h3 className="text-xl font-semibold text-white mb-3">Improve Your Score</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• Encourage team members to play all 4 games</li>
              <li>• Replay games to improve individual scores</li>
              <li>• Invite more colleagues to join the challenge</li>
              <li>• Share cybersecurity tips and learnings with the team</li>
            </ul>
          </Card>

          <Card className="border-2 p-6" style={{ 
            backgroundColor: '#0D1117', 
            borderColor: 'rgba(0, 212, 255, 0.3)'
          }}>
            <h3 className="text-xl font-semibold text-white mb-3">Cyber Health Metrics</h3>
            <p className="text-gray-300 mb-3">
              Your company's cyber health is calculated based on:
            </p>
            <ul className="text-gray-300 space-y-2">
              <li>• Average score across all team members</li>
              <li>• Performance in all 4 security categories</li>
              <li>• Overall team participation</li>
            </ul>
          </Card>
        </div>
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

        .hover-glow:hover {
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}