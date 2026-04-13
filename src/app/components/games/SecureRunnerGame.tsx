import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Shield, ArrowLeft, Trophy } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useAuth } from '../AuthContext';

export function SecureRunnerGame() {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const [gameStarted, setGameStarted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle background effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
        ctx.fill();
      });

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.2 * (1 - distance / 100)})`;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);


  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0A0E1A' }}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <div className="scan-lines" />

      {/* Grid Background */}
      <div className="fixed inset-0 grid-background" style={{ zIndex: 0 }} />

      {/* Header */}
      <nav className="border-b backdrop-blur-md relative z-10" style={{ borderColor: 'rgba(0, 212, 255, 0.2)', backgroundColor: '#0A0E1A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/challenge-dashboard" className="flex items-center gap-3 text-white hover:text-[#00D4FF] transition-colors">
              <ArrowLeft className="size-5" />
              <span>Back to Grid</span>
            </Link>
            <div className="flex items-center gap-3">
              <Shield className="size-8" style={{ color: '#00FF88' }} />
              <h1 className="text-xl font-bold text-white">INBOX MAZE</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* FINAL CHALLENGE Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center px-4 py-2 rounded" style={{ 
            backgroundColor: 'rgba(0, 255, 136, 0.15)',
            border: '2px solid #00FF88',
            color: '#00FF88'
          }}>
            <span className="font-bold text-sm" style={{ letterSpacing: '0.1em' }}>FINAL CHALLENGE</span>
          </div>
        </div>

        <Card className="card-slide-in border-2 p-8 sm:p-12 text-center" style={{ 
          backgroundColor: '#111827', 
          borderColor: 'rgba(0, 212, 255, 0.4)',
          boxShadow: '0 0 30px rgba(0, 212, 255, 0.2)'
        }}>
          <div className="text-6xl mb-6">🏃</div>
          <h2 className="text-4xl font-bold text-white mb-4">
            INBOX MAZE: Secure Runner
          </h2>
          <p className="text-xl mb-6" style={{ color: '#00D4FF' }}>
            Complete a full security audit in record time
          </p>
          
          <div className="rounded-lg p-6 mb-8 border-2" style={{ 
            backgroundColor: 'rgba(0, 255, 136, 0.1)', 
            borderColor: 'rgba(0, 255, 136, 0.4)' 
          }}>
            <div className="font-semibold mb-2" style={{ color: '#00FF88' }}>🔒 Coming Soon</div>
            <p className="text-gray-300">
              This challenge will be unlocked on Day 5 of the competition. 
              Complete the previous challenges to prepare for the final test!
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-8 text-left">
            <div className="rounded-lg p-4 border-2" style={{ 
              backgroundColor: '#0D1117', 
              borderColor: 'rgba(0, 212, 255, 0.3)' 
            }}>
              <div className="font-semibold mb-1 text-sm" style={{ color: '#00D4FF' }}>GAME TYPE</div>
              <div className="text-white">Time Trial</div>
            </div>
            <div className="rounded-lg p-4 border-2" style={{ 
              backgroundColor: '#0D1117', 
              borderColor: 'rgba(0, 212, 255, 0.3)' 
            }}>
              <div className="font-semibold mb-1 text-sm" style={{ color: '#00D4FF' }}>DIFFICULTY</div>
              <div className="text-white">Expert</div>
            </div>
            <div className="rounded-lg p-4 border-2" style={{ 
              backgroundColor: '#0D1117', 
              borderColor: 'rgba(0, 212, 255, 0.3)' 
            }}>
              <div className="font-semibold mb-1 text-sm" style={{ color: '#00D4FF' }}>MAX SCORE</div>
              <div className="text-white">500 points</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link to="/challenge-dashboard">
              <Button className="hover-glow" style={{ backgroundColor: '#00D4FF', color: '#0A0E1A' }}>
                Return to Dashboard
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="border-2 hover:bg-white/10"
              style={{ borderColor: 'rgba(255, 255, 255, 0.3)', color: 'rgba(255, 255, 255, 0.5)' }}
              disabled
            >
              Play (Locked)
            </Button>
          </div>
        </Card>

        {/* What to Expect */}
        <Card className="border-2 p-6 sm:p-8 mt-8" style={{ 
          backgroundColor: '#111827', 
          borderColor: 'rgba(0, 212, 255, 0.3)' 
        }}>
          <h3 className="text-2xl font-bold text-white mb-4">What to Expect</h3>
          <div className="space-y-4 text-gray-300">
            <div className="flex gap-3">
              <div className="text-2xl">⚡</div>
              <div>
                <div className="font-semibold text-white mb-1">Fast-Paced Action</div>
                <p>Race against the clock to identify and fix security vulnerabilities</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <div className="font-semibold text-white mb-1">Comprehensive Review</div>
                <p>Test everything you've learned across all 4 previous challenges</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">🏆</div>
              <div>
                <div className="font-semibold text-white mb-1">High Stakes</div>
                <p>The final challenge with the highest potential score boost</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

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

        .card-slide-in {
          animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hover-glow:hover {
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}