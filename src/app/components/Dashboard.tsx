import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { Shield, Trophy, Users, LogOut, Play } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useAuth } from './AuthContext';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export function Dashboard() {
  const navigate = useNavigate();
  const { user, accessToken, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
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
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center gap-3">
              <Shield className="size-8 text-cyan-400" />
              <h1 className="text-xl font-bold text-white">CyberDefense Challenge</h1>
            </Link>
            <div className="flex gap-3 items-center">
              <Link to="/leaderboard">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <Trophy className="size-4 mr-2" />
                  Leaderboard
                </Button>
              </Link>
              <Link to="/company">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <Users className="size-4 mr-2" />
                  My Team
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10"
                onClick={handleSignOut}
              >
                <LogOut className="size-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome back, {profile?.name}!
          </h2>
          <p className="text-xl text-gray-400">
            {profile?.company}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-cyan-600 to-blue-700 border-0 p-6">
            <div className="text-cyan-100 text-sm mb-2">Total Score</div>
            <div className="text-4xl font-bold text-white mb-1">
              {profile?.totalScore || 0}
            </div>
            <div className="text-cyan-100 text-sm">points earned</div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-pink-700 border-0 p-6">
            <div className="text-purple-100 text-sm mb-2">Games Played</div>
            <div className="text-4xl font-bold text-white mb-1">
              {profile?.gamesPlayed || 0}
            </div>
            <div className="text-purple-100 text-sm">challenges completed</div>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-teal-700 border-0 p-6">
            <div className="text-green-100 text-sm mb-2">Company</div>
            <div className="text-2xl font-bold text-white mb-1">
              {profile?.company}
            </div>
            <div className="text-green-100 text-sm">competing together</div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">Continue Your Training</h3>
          
          <Link to="/games">
            <Card className="bg-slate-800/50 border-slate-700 p-8 hover:bg-slate-800/70 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-2xl font-semibold text-white mb-2">Play Games</h4>
                  <p className="text-gray-400">
                    Test your skills across 4 cybersecurity challenges
                  </p>
                </div>
                <Play className="size-12 text-cyan-400" />
              </div>
            </Card>
          </Link>
        </div>

        {/* Competition Info */}
        <Card className="bg-slate-800/30 border-slate-700 p-8">
          <h3 className="text-2xl font-bold text-white mb-4">About the Challenge</h3>
          <div className="grid md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">Duration</h4>
              <p>The competition runs for 5 days. Play as many times as you want to improve your score!</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Team Score</h4>
              <p>Your individual scores contribute to your company's overall cybersecurity health rating.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Invite Colleagues</h4>
              <p>Share your company name with teammates so they can join and boost your team's ranking.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Track Progress</h4>
              <p>Check the leaderboard to see how your company ranks against others.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}