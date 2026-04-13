import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn(formData.email, formData.password);

      if (result.success) {
        toast.success('Welcome back!');
        navigate('/challenge-dashboard');
      } else {
        toast.error(result.error || 'Failed to log in');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0A0E1A' }}>
      {/* Animated Grid Background */}
      <div className="fixed inset-0 grid-background" style={{ zIndex: 0 }} />
      
      {/* Glow Effects */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" 
        style={{ background: 'radial-gradient(circle, #00D4FF 0%, transparent 70%)', zIndex: 0 }} />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" 
        style={{ background: 'radial-gradient(circle, #00FF88 0%, transparent 70%)', zIndex: 0 }} />

      <Card className="w-full max-w-md p-8 relative" style={{ 
        backgroundColor: '#111827',
        border: '2px solid rgba(0, 212, 255, 0.4)',
        boxShadow: '0 0 30px rgba(0, 212, 255, 0.2)',
        zIndex: 10
      }}>
        <div className="flex items-center justify-center mb-8">
          <Zap className="size-12" style={{ color: '#00FF88' }} />
        </div>
        
        <h2 className="text-3xl font-bold text-white text-center mb-2">
          Re-Enter the Maze
        </h2>
        <p className="text-gray-400 text-center mb-6">
          Resume your mission
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="text-white"
              style={{ 
                backgroundColor: '#0D1117',
                borderColor: 'rgba(0, 212, 255, 0.3)',
              }}
              placeholder="john@company.com"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="text-white"
              style={{ 
                backgroundColor: '#0D1117',
                borderColor: 'rgba(0, 212, 255, 0.3)',
              }}
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            className="w-full font-bold"
            style={{ 
              backgroundColor: '#00FF88',
              color: '#0A0E1A',
            }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold hover:underline" style={{ color: '#00FF88' }}>
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-gray-400 hover:text-gray-300 text-sm">
            ← Back to Grid
          </Link>
        </div>
      </Card>

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
      `}</style>
    </div>
  );
}