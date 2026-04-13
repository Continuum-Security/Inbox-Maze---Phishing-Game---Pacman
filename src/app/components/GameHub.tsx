import { Link, useNavigate } from 'react-router';
import { Shield, Mail, Lock, Wifi, Database, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useAuth } from './AuthContext';
import { useEffect } from 'react';

export function GameHub() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const games = [
    {
      id: 'phishing',
      title: 'Phishing Detection',
      description: 'Identify malicious emails and protect against social engineering attacks',
      icon: Mail,
      color: 'from-red-600 to-orange-700',
      path: '/games/phishing',
    },
    {
      id: '2fa',
      title: '2-Factor Authentication',
      description: 'Learn the importance of multi-factor authentication in account security',
      icon: Lock,
      color: 'from-green-600 to-teal-700',
      path: '/games/2fa',
    },
    {
      id: 'malware',
      title: 'Malware Defense',
      description: 'Identify and defend against various types of malware threats',
      icon: Wifi,
      color: 'from-yellow-600 to-amber-700',
      path: '/games/malware',
    },
    {
      id: 'data-protection',
      title: 'Data Protection',
      description: 'Master best practices for securing sensitive information',
      icon: Database,
      color: 'from-blue-600 to-indigo-700',
      path: '/games/data-protection',
    },
  ];

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
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-4">
              <ArrowLeft className="size-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <h2 className="text-4xl font-bold text-white mb-2">
            Choose Your Challenge
          </h2>
          <p className="text-xl text-gray-400">
            Select a game to test and improve your cybersecurity skills
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <Link key={game.id} to={game.path}>
                <Card className={`bg-gradient-to-br ${game.color} border-0 p-8 hover:scale-105 transition-transform cursor-pointer`}>
                  <Icon className="size-16 text-white mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {game.title}
                  </h3>
                  <p className="text-white/90 mb-6">
                    {game.description}
                  </p>
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
                    Start Challenge
                  </Button>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card className="bg-slate-800/30 border-slate-700 p-6 mt-8">
          <h3 className="text-xl font-semibold text-white mb-3">How to Play</h3>
          <ul className="text-gray-300 space-y-2">
            <li>• Each game tests a different aspect of cybersecurity awareness</li>
            <li>• Complete challenges to earn points and improve your score</li>
            <li>• Your score contributes to your company's overall cyber health rating</li>
            <li>• Play multiple times to beat your high score and climb the leaderboard</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
