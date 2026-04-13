import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { 
  Shield, 
  Star, 
  Database,
  Lock, 
  Zap, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Trophy,
  Clock
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useAuth } from '../AuthContext';
import { projectId } from '../../../../utils/supabase/info';
import { toast } from 'sonner';

// Data protection scenarios for inspection
interface DataProtectionScenario {
  id: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  scenario: string;
  question: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  correctOptionIndex: number;
  explanation: string;
  concept: string;
}

const dataProtectionScenarios: DataProtectionScenario[] = [
  // EASY
  {
    id: 1,
    difficulty: 'Easy',
    scenario: 'Sharing customer banking details with colleague at Discovery Health',
    question: 'You need to share customer banking details with a colleague for claim verification. What is the MOST secure way?',
    options: [
      { text: 'WhatsApp it to their work number', isCorrect: false },
      { text: 'Company OneDrive with password protection', isCorrect: true },
      { text: 'Email the file as attachment', isCorrect: false },
      { text: 'Upload to personal Google Drive', isCorrect: false }
    ],
    correctOptionIndex: 1,
    explanation: 'Company-approved encrypted cloud storage (OneDrive/SharePoint) with password protection is the most secure option. WhatsApp and personal accounts violate POPI Act. Regular email is not encrypted.',
    concept: 'Use company-approved encrypted channels'
  },
  {
    id: 2,
    difficulty: 'Easy',
    scenario: 'Working from Vida e Caffè in Sandton on public WiFi',
    question: 'You\'re at a coffee shop accessing customer records on public WiFi. What should you do?',
    options: [
      { text: 'Connect directly to coffee shop WiFi', isCorrect: false },
      { text: 'Connect to company VPN first', isCorrect: true },
      { text: 'Use Vodacom/MTN mobile hotspot instead', isCorrect: false },
      { text: 'Wait until you get home', isCorrect: false }
    ],
    correctOptionIndex: 1,
    explanation: 'ALWAYS use your company VPN on public networks to encrypt your connection. Public WiFi is extremely risky - hackers can intercept data. VPN protects company data from interception.',
    concept: 'Always use VPN on public networks'
  },
  {
    id: 3,
    difficulty: 'Easy',
    scenario: 'Colleague asks to borrow your login for quick task',
    question: 'Your colleague forgot their password and asks to use your login to check one customer record. What do you do?',
    options: [
      { text: 'Let them use it - it\'s just one record', isCorrect: false },
      { text: 'Refuse and direct them to IT for password reset', isCorrect: true },
      { text: 'Log in and show them the screen yourself', isCorrect: false },
      { text: 'Share password but change it later', isCorrect: false }
    ],
    correctOptionIndex: 1,
    explanation: 'NEVER share login credentials under any circumstances. This violates POPI Act security requirements and creates audit trail problems. Direct them to proper IT password reset procedures.',
    concept: 'Never share login credentials'
  },
  // MEDIUM
  {
    id: 4,
    difficulty: 'Medium',
    scenario: 'Customer requests their ID and bank statements via Gmail',
    question: 'A customer from Pretoria emails asking you to send copies of their ID document and bank statements to their Gmail. How do you handle this under POPI Act?',
    options: [
      { text: 'Send immediately - they own their data', isCorrect: false },
      { text: 'Verify identity through authentication, then secure encrypted transfer', isCorrect: true },
      { text: 'Refuse - you can never send via email', isCorrect: false },
      { text: 'Call the number on file to confirm', isCorrect: false }
    ],
    correctOptionIndex: 1,
    explanation: 'Under POPI Act, you MUST verify identity through established authentication procedures (multi-factor) before releasing personal information. Then use secure encrypted channels. Sending to unverified email violates POPI.',
    concept: 'Verify identity before releasing data'
  },
  {
    id: 5,
    difficulty: 'Medium',
    scenario: 'Disposing of old laptop with payroll data',
    question: 'You\'re disposing of an old work laptop that contained employee payroll data and ID numbers. What is the proper POPI-compliant way?',
    options: [
      { text: 'Delete all files and empty recycle bin', isCorrect: false },
      { text: 'Follow IT disposal: certified data wiping or physical destruction', isCorrect: true },
      { text: 'Remove hard drive and throw in bin', isCorrect: false },
      { text: 'Donate to school after factory reset', isCorrect: false }
    ],
    correctOptionIndex: 1,
    explanation: 'POPI Act requires secure disposal. Simply deleting files doesn\'t permanently remove them - they can be recovered. Company procedures include certified data wiping software or physical destruction with certificates.',
    concept: 'Secure disposal with certified destruction'
  },
  {
    id: 6,
    difficulty: 'Medium',
    scenario: 'Storing customer database backup at home',
    question: 'Your manager asks you to take a backup of the customer database home on a USB drive in case office servers fail. Should you?',
    options: [
      { text: 'Yes - it\'s good to have backup', isCorrect: false },
      { text: 'No - company data must stay on company systems only', isCorrect: true },
      { text: 'Yes but encrypt the USB drive', isCorrect: false },
      { text: 'Only take it if manager emails approval', isCorrect: false }
    ],
    correctOptionIndex: 1,
    explanation: 'NEVER store company data on personal devices or at home! This violates POPI Act data security requirements. Company data must remain on company-controlled, audited systems. Backups are IT\'s responsibility.',
    concept: 'Company data stays on company systems'
  },
  // HARD
  {
    id: 7,
    difficulty: 'Hard',
    scenario: 'Accidentally sent 50 customers\' ID numbers to wrong email',
    question: 'You accidentally sent an email with 50 customers\' ID numbers to wrong@recipient.co.za. This is a POPI Act data breach. What do you do IMMEDIATELY?',
    options: [
      { text: 'Hope they don\'t open it and do nothing', isCorrect: false },
      { text: 'Send follow-up asking them to delete it', isCorrect: false },
      { text: 'Report to IT Security and Information Officer immediately', isCorrect: true },
      { text: 'Try to recall the email', isCorrect: false }
    ],
    correctOptionIndex: 2,
    explanation: 'Under POPI Act, data breaches MUST be reported to your Information Officer immediately. They determine if breach requires notification to Information Regulator (within 72 hours) and affected individuals. Ignoring could result in R10 million fines!',
    concept: 'Report data breaches immediately'
  },
  {
    id: 8,
    difficulty: 'Hard',
    scenario: 'Password for payroll system with 500 employees\' salary data',
    question: 'Creating password for company payroll system processing salary data (POPI Act special personal information). Which approach meets POPI security requirements?',
    options: [
      { text: 'Use same strong password across all work systems', isCorrect: false },
      { text: 'Generate unique complex password with password manager + MFA', isCorrect: true },
      { text: 'Write down complex password and lock in desk', isCorrect: false },
      { text: 'Use pattern like "CompanyName2025!"', isCorrect: false }
    ],
    correctOptionIndex: 1,
    explanation: 'POPI Act requires "appropriate technical measures" for special personal information (salary data). This means unique complex passwords (use password manager) PLUS multi-factor authentication. Password reuse and predictable patterns violate POPI.',
    concept: 'Unique passwords + MFA for sensitive systems'
  },
  {
    id: 9,
    difficulty: 'Hard',
    scenario: 'Third-party vendor requests access to customer database',
    question: 'A marketing vendor asks for direct database access to send promotional emails to your customers. What do you do?',
    options: [
      { text: 'Grant access - they need it for marketing', isCorrect: false },
      { text: 'Refuse - POPI requires Data Processing Agreement + minimum access', isCorrect: true },
      { text: 'Give read-only access to be safe', isCorrect: false },
      { text: 'Ask your manager to approve it', isCorrect: false }
    ],
    correctOptionIndex: 1,
    explanation: 'Under POPI Act, third parties need a Data Processing Agreement defining responsibilities and security measures. They should receive ONLY the minimum data necessary (emails only, not full database). Never grant direct database access to vendors!',
    concept: 'Data Processing Agreements for third parties'
  },
  {
    id: 10,
    difficulty: 'Hard',
    scenario: 'Customer exercises right to erasure under POPI Act',
    question: 'A customer requests deletion of all their personal data from your systems (POPI Act right to erasure). Marketing manager says "ignore it - we need the data". What\'s correct?',
    options: [
      { text: 'Ignore request as manager suggested', isCorrect: false },
      { text: 'Delete within reasonable timeframe unless legally required to keep', isCorrect: true },
      { text: 'Ask customer to pay R500 for deletion', isCorrect: false },
      { text: 'Tell them deletion is impossible once collected', isCorrect: false }
    ],
    correctOptionIndex: 1,
    explanation: 'Under POPI Act Section 11, individuals have the "right to erasure". Companies MUST delete personal data within reasonable timeframe (usually 30 days) unless legally required to retain it (e.g., tax records for 5 years). Ignoring or charging fees can result in R10 million fines!',
    concept: 'Honor right to erasure under POPI'
  }
];

// Power-up types
type PowerUpType = 'encryption-shield' | 'access-control' | 'audit-logger' | 'data-mask';

interface PowerUp {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  active: boolean;
}

// Enemy ghost types
type GhostType = 'data-harvester' | 'privacy-breacher' | 'identity-thief' | 'compliance-violator';

interface Ghost {
  id: string;
  type: GhostType;
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  speed: number;
  scared: boolean;
}

interface Player {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  speed: number;
}

interface GameState {
  level: number;
  score: number;
  lives: number;
  tokens: number;
  dataProtected: number;
  threatMeter: number;
  combo: number;
  activePowerUp: PowerUpType | null;
  powerUpTimer: number;
}

type GameScreen = 'intro' | 'playing' | 'data-challenge' | 'results' | 'game-over';

export function DataProtectionGame() {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  
  // Game screens
  const [gameScreen, setGameScreen] = useState<GameScreen>('intro');
  
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    score: 0,
    lives: 3,
    tokens: 0,
    dataProtected: 0,
    threatMeter: 0,
    combo: 0,
    activePowerUp: null,
    powerUpTimer: 0
  });
  
  // Player
  const [player, setPlayer] = useState<Player>({
    x: 1,
    y: 1,
    direction: 'right',
    speed: 0.1
  });
  
  // Enemies
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  
  // Collectibles
  const [tokens, setTokens] = useState<{x: number, y: number, collected: boolean}[]>([]);
  const [dataChallenges, setDataChallenges] = useState<{x: number, y: number, collected: boolean, scenarioId: number}[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  
  // Current challenge inspection
  const [currentChallenge, setCurrentChallenge] = useState<DataProtectionScenario | null>(null);
  const [inspectionFeedback, setInspectionFeedback] = useState<{show: boolean, correct: boolean, message: string}>({
    show: false,
    correct: false,
    message: ''
  });
  
  // Game stats
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [conceptsLearned, setConceptsLearned] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState<{scenario: string, explanation: string}[]>([]);
  
  // Timer
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [startTime] = useState(Date.now());
  
  // Maze grid (15x15)
  const GRID_SIZE = 15;
  const CELL_SIZE = 40;
  
  // Maze layout (0 = path, 1 = wall)
  const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,0,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,0,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];

  // Initialize game
  useEffect(() => {
  }, [user, navigate]);

  // Initialize collectibles and enemies
  const initializeLevel = useCallback(() => {
    // Place tokens on all open paths
    const newTokens: {x: number, y: number, collected: boolean}[] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (maze[y][x] === 0 && !(x === 1 && y === 1)) {
          newTokens.push({ x, y, collected: false });
        }
      }
    }
    setTokens(newTokens);

    // Place data challenges at strategic locations
    const challengePositions = [
      { x: 7, y: 3, scenarioId: 0 },
      { x: 3, y: 7, scenarioId: 1 },
      { x: 11, y: 7, scenarioId: 2 },
      { x: 7, y: 11, scenarioId: 3 },
      { x: 13, y: 1, scenarioId: 4 }
    ];
    setDataChallenges(challengePositions.map(pos => ({ ...pos, collected: false })));

    // Initialize ghosts
    const ghostTypes: GhostType[] = ['data-harvester', 'privacy-breacher', 'identity-thief', 'compliance-violator'];
    const newGhosts: Ghost[] = ghostTypes.map((type, i) => ({
      id: `ghost-${i}`,
      type,
      x: 7,
      y: 7,
      direction: ['up', 'down', 'left', 'right'][i] as any,
      speed: 0.05,
      scared: false
    }));
    setGhosts(newGhosts);

    // Place power-ups
    const powerUpPositions: {type: PowerUpType, x: number, y: number}[] = [
      { type: 'encryption-shield', x: 1, y: 13 },
      { type: 'access-control', x: 13, y: 13 },
      { type: 'audit-logger', x: 1, y: 7 },
      { type: 'data-mask', x: 13, y: 7 }
    ];
    setPowerUps(powerUpPositions.map((pos, i) => ({ ...pos, id: `power-${i}`, active: true })));
  }, []);

  // Start game
  const startGame = () => {
    setGameScreen('playing');
    initializeLevel();
    setPlayer({ x: 1, y: 1, direction: 'right', speed: 0.1 });
    setGameState({
      level: 1,
      score: 0,
      lives: 3,
      tokens: 0,
      dataProtected: 0,
      threatMeter: 0,
      combo: 0,
      activePowerUp: null,
      powerUpTimer: 0
    });
  };

  // Keyboard controls
  useEffect(() => {
    if (gameScreen !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'arrowup'].includes(key)) {
        setPlayer(p => ({ ...p, direction: 'up' }));
      } else if (['s', 'arrowdown'].includes(key)) {
        setPlayer(p => ({ ...p, direction: 'down' }));
      } else if (['a', 'arrowleft'].includes(key)) {
        setPlayer(p => ({ ...p, direction: 'left' }));
      } else if (['d', 'arrowright'].includes(key)) {
        setPlayer(p => ({ ...p, direction: 'right' }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameScreen]);

  // Game loop
  useEffect(() => {
    if (gameScreen !== 'playing') return;

    const gameLoop = () => {
      // Move player
      setPlayer(p => {
        let newX = p.x;
        let newY = p.y;

        if (p.direction === 'up') newY -= p.speed;
        else if (p.direction === 'down') newY += p.speed;
        else if (p.direction === 'left') newX -= p.speed;
        else if (p.direction === 'right') newX += p.speed;

        // Check wall collision
        const gridX = Math.round(newX);
        const gridY = Math.round(newY);
        if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
          if (maze[gridY][gridX] === 1) {
            return p; // Hit wall, don't move
          }
        }

        return { ...p, x: newX, y: newY };
      });

      // Move ghosts (simple AI)
      setGhosts(prevGhosts => prevGhosts.map(ghost => {
        let newX = ghost.x;
        let newY = ghost.y;
        let newDirection = ghost.direction;

        // Move in current direction
        if (ghost.direction === 'up') newY -= ghost.speed;
        else if (ghost.direction === 'down') newY += ghost.speed;
        else if (ghost.direction === 'left') newX -= ghost.speed;
        else if (ghost.direction === 'right') newX += ghost.speed;

        // Check if hit wall, change direction randomly
        const gridX = Math.round(newX);
        const gridY = Math.round(newY);
        if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
          if (maze[gridY][gridX] === 1) {
            const directions: typeof ghost.direction[] = ['up', 'down', 'left', 'right'];
            newDirection = directions[Math.floor(Math.random() * directions.length)];
            newX = ghost.x;
            newY = ghost.y;
          }
        }

        return { ...ghost, x: newX, y: newY, direction: newDirection };
      }));

      // Check token collection
      setTokens(prevTokens => {
        const playerGridX = Math.round(player.x);
        const playerGridY = Math.round(player.y);
        
        return prevTokens.map(token => {
          if (!token.collected && token.x === playerGridX && token.y === playerGridY) {
            setGameState(gs => ({ ...gs, tokens: gs.tokens + 1, score: gs.score + 10, combo: gs.combo + 1 }));
            return { ...token, collected: true };
          }
          return token;
        });
      });

      // Check data challenge collection
      setDataChallenges(prevChallenges => {
        const playerGridX = Math.round(player.x);
        const playerGridY = Math.round(player.y);
        
        return prevChallenges.map(challenge => {
          if (!challenge.collected && Math.abs(challenge.x - playerGridX) < 0.5 && Math.abs(challenge.y - playerGridY) < 0.5) {
            // Trigger data challenge inspection
            const scenario = dataProtectionScenarios[challenge.scenarioId % dataProtectionScenarios.length];
            setCurrentChallenge(scenario);
            setGameScreen('data-challenge');
            return { ...challenge, collected: true };
          }
          return challenge;
        });
      });

      // Check power-up collection
      setPowerUps(prevPowerUps => {
        const playerGridX = Math.round(player.x);
        const playerGridY = Math.round(player.y);
        
        return prevPowerUps.map(powerUp => {
          if (powerUp.active && Math.abs(powerUp.x - playerGridX) < 0.5 && Math.abs(powerUp.y - playerGridY) < 0.5) {
            setGameState(gs => ({ ...gs, activePowerUp: powerUp.type, powerUpTimer: 300 })); // 5 seconds
            toast.success(`Power-up activated: ${powerUp.type.replace('-', ' ').toUpperCase()}`);
            return { ...powerUp, active: false };
          }
          return powerUp;
        });
      });

      // Check ghost collision
      ghosts.forEach(ghost => {
        if (Math.abs(ghost.x - player.x) < 0.5 && Math.abs(ghost.y - player.y) < 0.5) {
          if (gameState.activePowerUp === 'encryption-shield') {
            // Protected by shield
            toast.info('Encryption Shield protected you!');
          } else {
            // Lose a life
            setGameState(gs => {
              const newLives = gs.lives - 1;
              if (newLives <= 0) {
                setGameScreen('game-over');
              } else {
                toast.error('Data breach! Life lost.');
                // Reset player position
                setPlayer({ x: 1, y: 1, direction: 'right', speed: 0.1 });
              }
              return { ...gs, lives: newLives, combo: 0 };
            });
          }
        }
      });

      // Update power-up timer
      setGameState(gs => {
        if (gs.powerUpTimer > 0) {
          const newTimer = gs.powerUpTimer - 1;
          if (newTimer === 0) {
            return { ...gs, powerUpTimer: 0, activePowerUp: null };
          }
          return { ...gs, powerUpTimer: newTimer };
        }
        return gs;
      });

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameScreen, player, ghosts, gameState.activePowerUp]);

  // Render maze
  useEffect(() => {
    if (gameScreen !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = GRID_SIZE * CELL_SIZE;
    canvas.height = GRID_SIZE * CELL_SIZE;

    const render = () => {
      // Clear canvas
      ctx.fillStyle = '#0A0E1A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw maze
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          if (maze[y][x] === 1) {
            // Wall
            ctx.fillStyle = '#0D1117';
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            ctx.strokeStyle = '#B366FF'; // PURPLE for ZONE 4
            ctx.lineWidth = 2;
            ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }
        }
      }

      // Draw tokens (small purple dots)
      tokens.forEach(token => {
        if (!token.collected) {
          ctx.fillStyle = '#B366FF'; // PURPLE
          ctx.beginPath();
          ctx.arc(
            token.x * CELL_SIZE + CELL_SIZE / 2,
            token.y * CELL_SIZE + CELL_SIZE / 2,
            3,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      });

      // Draw data challenges (purple diamonds)
      dataChallenges.forEach(challenge => {
        if (!challenge.collected) {
          ctx.fillStyle = '#B366FF';
          ctx.shadowColor = '#B366FF';
          ctx.shadowBlur = 15;
          
          const centerX = challenge.x * CELL_SIZE + CELL_SIZE / 2;
          const centerY = challenge.y * CELL_SIZE + CELL_SIZE / 2;
          const size = 10;
          
          // Draw diamond shape
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - size);
          ctx.lineTo(centerX + size, centerY);
          ctx.lineTo(centerX, centerY + size);
          ctx.lineTo(centerX - size, centerY);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw power-ups
      powerUps.forEach(powerUp => {
        if (powerUp.active) {
          ctx.fillStyle = '#B366FF';
          ctx.shadowColor = '#B366FF';
          ctx.shadowBlur = 15;
          ctx.fillRect(
            powerUp.x * CELL_SIZE + CELL_SIZE / 4,
            powerUp.y * CELL_SIZE + CELL_SIZE / 4,
            CELL_SIZE / 2,
            CELL_SIZE / 2
          );
          ctx.shadowBlur = 0;
        }
      });

      // Draw ghosts
      ghosts.forEach(ghost => {
        const ghostColors = {
          'data-harvester': '#FF0000',      // Red
          'privacy-breacher': '#FF8C00',    // Orange
          'identity-thief': '#FFD700',      // Yellow
          'compliance-violator': '#FF00FF'  // Magenta
        };
        ctx.fillStyle = ghostColors[ghost.type];
        ctx.shadowColor = ghostColors[ghost.type];
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(
          ghost.x * CELL_SIZE + CELL_SIZE / 2,
          ghost.y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE / 3,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw player (purple glowing orb)
      ctx.fillStyle = '#B366FF'; // PURPLE for player
      ctx.shadowColor = '#B366FF';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(
        player.x * CELL_SIZE + CELL_SIZE / 2,
        player.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw player direction indicator
      ctx.fillStyle = '#D9A3FF';
      const indicatorDist = CELL_SIZE / 2.5 + 5;
      let indicatorX = player.x * CELL_SIZE + CELL_SIZE / 2;
      let indicatorY = player.y * CELL_SIZE + CELL_SIZE / 2;
      
      if (player.direction === 'up') indicatorY -= indicatorDist;
      else if (player.direction === 'down') indicatorY += indicatorDist;
      else if (player.direction === 'left') indicatorX -= indicatorDist;
      else if (player.direction === 'right') indicatorX += indicatorDist;

      ctx.beginPath();
      ctx.arc(indicatorX, indicatorY, 3, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(render);
    };

    render();
  }, [gameScreen, player, ghosts, tokens, dataChallenges, powerUps]);

  // Handle data challenge answer
  const handleChallengeAnswer = (optionIndex: number) => {
    if (!currentChallenge) return;

    const correct = optionIndex === currentChallenge.correctOptionIndex;
    setTotalAnswers(prev => prev + 1);

    if (correct) {
      setCorrectAnswers(prev => prev + 1);
      const points = currentChallenge.difficulty === 'Easy' ? 100 : currentChallenge.difficulty === 'Medium' ? 200 : 300;
      const comboBonus = gameState.combo * 50;
      setGameState(gs => ({ 
        ...gs, 
        score: gs.score + points + comboBonus,
        dataProtected: gs.dataProtected + 1,
        combo: gs.combo + 1
      }));
      
      setInspectionFeedback({
        show: true,
        correct: true,
        message: `Correct! ${currentChallenge.explanation}`
      });

      // Add learned concept
      if (!conceptsLearned.includes(currentChallenge.concept)) {
        setConceptsLearned(prev => [...prev, currentChallenge.concept]);
      }
    } else {
      setGameState(gs => ({ ...gs, combo: 0 }));
      setInspectionFeedback({
        show: true,
        correct: false,
        message: `Wrong! ${currentChallenge.explanation}`
      });

      setMistakes(prev => [...prev, {
        scenario: currentChallenge.scenario,
        explanation: currentChallenge.explanation
      }]);
    }

    setTimeout(() => {
      setInspectionFeedback({ show: false, correct: false, message: '' });
      setCurrentChallenge(null);
      
      // Check if level complete
      const allChallengesCollected = dataChallenges.filter(c => c.collected).length === dataChallenges.length;
      if (allChallengesCollected) {
        setGameScreen('results');
      } else {
        setGameScreen('playing');
      }
    }, 3000);
  };

  // Submit score
  const submitScore = async () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ca4695ac/submit-score`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            gameType: 'dataprotection',
            score: gameState.score,
            timeTaken,
          }),
        }
      );

      if (response.ok) {
        toast.success(`Game completed! Score: ${gameState.score}`);
      } else {
        toast.error('Failed to submit score');
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      toast.error('Failed to submit score');
    }
  };

  // Timer
  useEffect(() => {
    if (gameScreen !== 'playing') return;

    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameScreen, startTime]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // INTRO SCREEN
  if (gameScreen === 'intro') {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0A0E1A' }}>
        <div className="fixed inset-0 grid-background" style={{ zIndex: 0 }} />
        <div className="scan-lines" />

        <div className="relative z-10">
          <nav className="border-b backdrop-blur-md" style={{ borderColor: 'rgba(179, 102, 255, 0.2)', backgroundColor: 'rgba(10, 14, 26, 0.9)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link to="/challenge-dashboard" className="flex items-center gap-3 text-white transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.color = '#B366FF'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>
                  <Shield className="size-8" style={{ color: '#B366FF' }} />
                  <h1 className="text-xl font-bold">INBOX MAZE</h1>
                </Link>
              </div>
            </div>
          </nav>

          <div className="max-w-6xl mx-auto px-4 py-12">
            {/* ZONE 4 Badge */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center px-4 py-2 rounded" style={{ 
                backgroundColor: 'rgba(179, 102, 255, 0.15)',
                border: '2px solid #B366FF',
                color: '#B366FF'
              }}>
                <span className="font-bold text-sm" style={{ letterSpacing: '0.1em' }}>ZONE 4</span>
              </div>
            </div>

            <Card className="card-slide-in border-2 p-8 mb-6" style={{ 
              backgroundColor: '#0D1117', 
              borderColor: 'rgba(179, 102, 255, 0.4)',
              boxShadow: '0 0 30px rgba(179, 102, 255, 0.2)'
            }}>
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🔒</div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  INBOX MAZE: Data Vault
                </h2>
                <p className="text-xl mb-4" style={{ color: '#B366FF' }}>
                  Navigate the cyber maze. Guard sensitive data. Master privacy compliance.
                </p>
              </div>

              {/* Game Preview */}
              <div className="mb-8 p-6 rounded-lg border-2" style={{ 
                backgroundColor: '#0A0E1A',
                borderColor: 'rgba(179, 102, 255, 0.3)'
              }}>
                <h3 className="text-lg font-bold text-white mb-4 text-center">Arcade Maze Gameplay</h3>
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-300">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔒</div>
                    <div className="font-semibold" style={{ color: '#B366FF' }}>Data Guardian</div>
                    <div>Your purple orb avatar</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">👻</div>
                    <div className="font-semibold" style={{ color: '#FF0000' }}>Threat Ghosts</div>
                    <div>Avoid privacy breaches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">💎</div>
                    <div className="font-semibold" style={{ color: '#B366FF' }}>Data Challenges</div>
                    <div>POPI Act compliance</div>
                  </div>
                </div>
              </div>

              {/* How to Play */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="border-2 rounded-lg p-4" style={{ backgroundColor: '#0D1117', borderColor: 'rgba(179, 102, 255, 0.3)' }}>
                  <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#B366FF' }}>
                    <Zap className="size-5" />
                    How to Play
                  </h3>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Use arrow keys or WASD to navigate maze</li>
                    <li>• Collect data tokens (purple dots)</li>
                    <li>• Reach privacy challenges (purple diamonds)</li>
                    <li>• Answer POPI Act compliance questions</li>
                    <li>• Avoid data harvesters and identity thieves</li>
                    <li>• Collect power-ups for data protection</li>
                  </ul>
                </div>

                <div className="border-2 rounded-lg p-4" style={{ backgroundColor: '#0D1117', borderColor: 'rgba(179, 102, 255, 0.3)' }}>
                  <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#B366FF' }}>
                    <Lock className="size-5" />
                    Enemy Types
                  </h3>
                  <div className="text-gray-300 text-sm space-y-2">
                    <div><span style={{ color: '#FF0000' }}>●</span> Data Harvester - Collects private data</div>
                    <div><span style={{ color: '#FF8C00' }}>●</span> Privacy Breacher - Violates POPI</div>
                    <div><span style={{ color: '#FFD700' }}>●</span> Identity Thief - Steals credentials</div>
                    <div><span style={{ color: '#FF00FF' }}>●</span> Compliance Violator - Ignores regulations</div>
                  </div>
                </div>

                <div className="border-2 rounded-lg p-4" style={{ backgroundColor: '#0D1117', borderColor: 'rgba(179, 102, 255, 0.3)' }}>
                  <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#B366FF' }}>
                    <Eye className="size-5" />
                    Power-Ups
                  </h3>
                  <div className="text-gray-300 text-sm space-y-2">
                    <div><span style={{ color: '#B366FF' }}>■</span> Encryption Shield - Protect data</div>
                    <div><span style={{ color: '#B366FF' }}>■</span> Access Control - Restrict permissions</div>
                    <div><span style={{ color: '#B366FF' }}>■</span> Audit Logger - Track activity</div>
                    <div><span style={{ color: '#B366FF' }}>■</span> Data Mask - Hide sensitive info</div>
                  </div>
                </div>

                <div className="border-2 rounded-lg p-4" style={{ backgroundColor: '#0D1117', borderColor: 'rgba(179, 102, 255, 0.3)' }}>
                  <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#B366FF' }}>
                    <Trophy className="size-5" />
                    Scoring
                  </h3>
                  <div className="text-gray-300 text-sm space-y-1">
                    <div>• Data tokens: +10 pts</div>
                    <div>• Easy challenges: +100 pts</div>
                    <div>• Medium challenges: +200 pts</div>
                    <div>• Hard challenges: +300 pts</div>
                    <div>• Combo multiplier: +50 pts/level</div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-4 mb-6 border" style={{ 
                backgroundColor: 'rgba(179, 102, 255, 0.1)',
                borderColor: 'rgba(179, 102, 255, 0.3)'
              }}>
                <p className="text-gray-300 text-sm">
                  <strong style={{ color: '#B366FF' }}>Protect every byte of data!</strong> Navigate the purple maze, master POPI Act compliance, and learn to safeguard sensitive information while avoiding privacy threats. 3 lives. Complete all challenges to win.
                </p>
              </div>

              <Button 
                onClick={startGame}
                className="w-full h-14 text-lg font-bold hover-glow"
                style={{ backgroundColor: '#B366FF', color: 'white' }}
              >
                Start Game
              </Button>
            </Card>
          </div>
        </div>

        <style>{`
          .grid-background {
            background-image: 
              linear-gradient(rgba(179, 102, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(179, 102, 255, 0.03) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: grid-move 20s linear infinite;
          }

          @keyframes grid-move {
            0% { background-position: 0 0; }
            100% { background-position: 50px 50px; }
          }

          .scan-lines {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              transparent 50%,
              rgba(179, 102, 255, 0.03) 50%
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
            box-shadow: 0 0 20px rgba(179, 102, 255, 0.5);
            transform: translateY(-2px);
            transition: all 0.3s ease;
          }
        `}</style>
      </div>
    );
  }

  // PLAYING SCREEN
  if (gameScreen === 'playing') {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0A0E1A' }}>
        <div className="fixed inset-0 grid-background" style={{ zIndex: 0 }} />

        <div className="relative z-10">
          {/* HUD */}
          <div className="border-b backdrop-blur-md" style={{ borderColor: 'rgba(179, 102, 255, 0.2)', backgroundColor: 'rgba(10, 14, 26, 0.9)' }}>
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <div className="px-4 py-2 rounded border-2" style={{ 
                    backgroundColor: '#0D1117',
                    borderColor: 'rgba(179, 102, 255, 0.4)',
                    color: '#B366FF'
                  }}>
                    <span className="font-bold">SCORE: {gameState.score}</span>
                  </div>
                  <div className="px-4 py-2 rounded border-2" style={{ 
                    backgroundColor: '#0D1117',
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    color: 'white'
                  }}>
                    <span className="font-bold">LEVEL {gameState.level}</span>
                  </div>
                  <div className="px-4 py-2 rounded border-2" style={{ 
                    backgroundColor: '#0D1117',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white'
                  }}>
                    <span className="font-bold">{formatTime(timeElapsed)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Lives */}
                  <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                      <Shield 
                        key={i} 
                        className="size-6" 
                        style={{ color: i < gameState.lives ? '#B366FF' : '#333' }}
                      />
                    ))}
                  </div>

                  {/* Combo */}
                  {gameState.combo > 0 && (
                    <div className="px-3 py-1 rounded" style={{ 
                      backgroundColor: 'rgba(179, 102, 255, 0.2)',
                      border: '1px solid #B366FF',
                      color: '#B366FF'
                    }}>
                      <span className="font-bold text-sm">COMBO x{gameState.combo}</span>
                    </div>
                  )}

                  {/* Active Power-Up */}
                  {gameState.activePowerUp && (
                    <div className="px-3 py-1 rounded" style={{ 
                      backgroundColor: 'rgba(179, 102, 255, 0.2)',
                      border: '1px solid #B366FF',
                      color: '#B366FF'
                    }}>
                      <span className="font-bold text-sm">{gameState.activePowerUp.replace('-', ' ').toUpperCase()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Maze */}
          <div className="flex justify-center items-center py-8">
            <canvas 
              ref={canvasRef}
              className="border-4 rounded"
              style={{ borderColor: '#B366FF', boxShadow: '0 0 30px rgba(179, 102, 255, 0.3)' }}
            />
          </div>

          {/* Controls hint */}
          <div className="text-center text-gray-400 text-sm">
            Use Arrow Keys or WASD to move • Avoid privacy threats • Collect purple data challenges
          </div>
        </div>

        <style>{`
          .grid-background {
            background-image: 
              linear-gradient(rgba(179, 102, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(179, 102, 255, 0.03) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: grid-move 20s linear infinite;
          }

          @keyframes grid-move {
            0% { background-position: 0 0; }
            100% { background-position: 50px 50px; }
          }
        `}</style>
      </div>
    );
  }

  // DATA CHALLENGE OVERLAY
  if (gameScreen === 'data-challenge' && currentChallenge) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'rgba(10, 14, 26, 0.95)' }}>
        <div className="max-w-3xl w-full mx-4">
          {!inspectionFeedback.show ? (
            <Card className="card-slide-in border-2 p-8" style={{ 
              backgroundColor: '#0D1117', 
              borderColor: 'rgba(179, 102, 255, 0.6)',
              boxShadow: '0 0 40px rgba(179, 102, 255, 0.3)'
            }}>
              <div className="flex items-center gap-3 mb-6">
                <Database className="size-8" style={{ color: '#B366FF' }} />
                <h2 className="text-2xl font-bold text-white">Data Protection Challenge</h2>
                <div className="ml-auto px-3 py-1 rounded text-sm font-bold" style={{
                  backgroundColor: currentChallenge.difficulty === 'Easy' ? 'rgba(0, 255, 136, 0.2)' : currentChallenge.difficulty === 'Medium' ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 51, 102, 0.2)',
                  color: currentChallenge.difficulty === 'Easy' ? '#00FF88' : currentChallenge.difficulty === 'Medium' ? '#FFC107' : '#FF3366'
                }}>
                  {currentChallenge.difficulty}
                </div>
              </div>

              {/* Challenge Content */}
              <div className="space-y-4 mb-6">
                <div className="p-4 rounded border" style={{ backgroundColor: '#0A0E1A', borderColor: 'rgba(179, 102, 255, 0.2)' }}>
                  <div className="text-sm text-gray-400 mb-1">Scenario:</div>
                  <div className="font-semibold text-white">{currentChallenge.scenario}</div>
                </div>

                <div className="p-4 rounded border" style={{ backgroundColor: '#0A0E1A', borderColor: 'rgba(179, 102, 255, 0.2)' }}>
                  <div className="text-gray-300">{currentChallenge.question}</div>
                </div>
              </div>

              {/* Options */}
              <div className="text-sm text-gray-400 mb-3 text-center">Choose the POPI Act compliant answer:</div>
              <div className="grid gap-3">
                {currentChallenge.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleChallengeAnswer(index)}
                    className="h-auto py-4 px-4 text-left hover-glow"
                    style={{ 
                      backgroundColor: '#0D1117',
                      color: 'white',
                      border: '2px solid rgba(179, 102, 255, 0.3)',
                      whiteSpace: 'normal',
                      lineHeight: '1.4'
                    }}
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="card-slide-in border-2 p-8 text-center" style={{ 
              backgroundColor: '#0D1117', 
              borderColor: inspectionFeedback.correct ? 'rgba(179, 102, 255, 0.6)' : 'rgba(255, 51, 102, 0.6)',
              boxShadow: inspectionFeedback.correct ? '0 0 40px rgba(179, 102, 255, 0.3)' : '0 0 40px rgba(255, 51, 102, 0.3)'
            }}>
              {inspectionFeedback.correct ? (
                <CheckCircle className="size-20 mx-auto mb-4" style={{ color: '#B366FF' }} />
              ) : (
                <XCircle className="size-20 mx-auto mb-4" style={{ color: '#FF3366' }} />
              )}
              <h3 className="text-3xl font-bold text-white mb-4">
                {inspectionFeedback.correct ? 'Correct!' : 'Wrong!'}
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                {inspectionFeedback.message}
              </p>
            </Card>
          )}
        </div>

        <style>{`
          .card-slide-in {
            animation: slideIn 0.3s ease-out;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .hover-glow:hover {
            border-color: rgba(179, 102, 255, 0.6) !important;
            transform: translateY(-2px);
            transition: all 0.2s ease;
          }
        `}</style>
      </div>
    );
  }

  // RESULTS SCREEN
  if (gameScreen === 'results') {
    const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;

    // Submit score when reaching results
    useEffect(() => {
      submitScore();
    }, []);

    return (
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0A0E1A' }}>
        <div className="fixed inset-0 grid-background" style={{ zIndex: 0 }} />
        <div className="scan-lines" />

        <div className="relative z-10">
          <nav className="border-b backdrop-blur-md" style={{ borderColor: 'rgba(179, 102, 255, 0.2)', backgroundColor: 'rgba(10, 14, 26, 0.9)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link to="/challenge-dashboard" className="flex items-center gap-3 text-white transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.color = '#B366FF'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>
                  <Shield className="size-8" style={{ color: '#B366FF' }} />
                  <h1 className="text-xl font-bold">INBOX MAZE</h1>
                </Link>
              </div>
            </div>
          </nav>

          <div className="max-w-4xl mx-auto px-4 py-12">
            <Card className="card-slide-in border-2 p-8" style={{ 
              backgroundColor: '#0D1117', 
              borderColor: accuracy >= 70 ? 'rgba(179, 102, 255, 0.4)' : 'rgba(255, 51, 102, 0.4)',
              boxShadow: accuracy >= 70 ? '0 0 30px rgba(179, 102, 255, 0.2)' : '0 0 30px rgba(255, 51, 102, 0.2)'
            }}>
              <div className="text-center mb-8">
                <Trophy className="size-20 mx-auto mb-4" style={{ color: accuracy >= 70 ? '#B366FF' : '#888' }} />
                <h2 className="text-4xl font-bold text-white mb-4">Level Complete!</h2>
                
                {/* Stars */}
                <div className="flex justify-center gap-2 mb-4">
                  {[...Array(3)].map((_, i) => (
                    <Star 
                      key={i}
                      className="size-12"
                      style={{ 
                        color: i < stars ? '#FFD700' : '#333',
                        fill: i < stars ? '#FFD700' : 'transparent'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Score Summary */}
              <div className="rounded-lg p-6 mb-6 border-2" style={{ 
                backgroundColor: '#0A0E1A',
                borderColor: 'rgba(179, 102, 255, 0.4)'
              }}>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Final Score</div>
                    <div className="text-4xl font-bold" style={{ color: '#B366FF' }}>
                      {gameState.score}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Accuracy</div>
                    <div className="text-4xl font-bold text-white">{accuracy}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Time</div>
                    <div className="text-4xl font-bold text-white">{formatTime(timeElapsed)}</div>
                  </div>
                </div>
              </div>

              {/* Concepts Learned */}
              {conceptsLearned.length > 0 && (
                <div className="rounded-lg p-4 mb-6 border" style={{ 
                  backgroundColor: 'rgba(179, 102, 255, 0.1)',
                  borderColor: 'rgba(179, 102, 255, 0.3)'
                }}>
                  <h3 className="font-bold text-white mb-3">🎓 Data Protection Concepts Mastered</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                    {conceptsLearned.map((concept, i) => (
                      <div key={i}>✓ {concept}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mistakes */}
              {mistakes.length > 0 && (
                <div className="rounded-lg p-4 mb-6 border" style={{ 
                  backgroundColor: 'rgba(255, 51, 102, 0.1)',
                  borderColor: 'rgba(255, 51, 102, 0.3)'
                }}>
                  <h3 className="font-bold mb-3" style={{ color: '#FF3366' }}>💡 Review These Scenarios</h3>
                  <div className="space-y-3 text-sm">
                    {mistakes.map((mistake, i) => (
                      <div key={i} className="text-gray-300">
                        <div className="font-semibold text-white mb-1">{mistake.scenario}</div>
                        <div>{mistake.explanation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1 h-12 hover-glow"
                  style={{ backgroundColor: '#B366FF', color: 'white' }}
                >
                  Play Again
                </Button>
                <Link to="/challenge-dashboard" className="flex-1">
                  <Button
                    className="w-full h-12 hover-glow"
                    style={{ backgroundColor: '#0D1117', color: '#B366FF', border: '2px solid #B366FF' }}
                  >
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        <style>{`
          .grid-background {
            background-image: 
              linear-gradient(rgba(179, 102, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(179, 102, 255, 0.03) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: grid-move 20s linear infinite;
          }

          @keyframes grid-move {
            0% { background-position: 0 0; }
            100% { background-position: 50px 50px; }
          }

          .scan-lines {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              transparent 50%,
              rgba(179, 102, 255, 0.03) 50%
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
            box-shadow: 0 0 20px rgba(179, 102, 255, 0.5);
            transform: translateY(-2px);
            transition: all 0.3s ease;
          }
        `}</style>
      </div>
    );
  }

  // GAME OVER SCREEN
  if (gameScreen === 'game-over') {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#0A0E1A' }}>
        <div className="fixed inset-0 grid-background" style={{ zIndex: 0 }} />
        
        <Card className="max-w-2xl mx-4 border-2 p-8 text-center" style={{ 
          backgroundColor: '#0D1117', 
          borderColor: 'rgba(255, 51, 102, 0.6)',
          boxShadow: '0 0 40px rgba(255, 51, 102, 0.3)'
        }}>
          <XCircle className="size-24 mx-auto mb-6" style={{ color: '#FF3366' }} />
          <h2 className="text-5xl font-bold text-white mb-4">GAME OVER</h2>
          <p className="text-xl text-gray-300 mb-8">
            Data breach! Final Score: {gameState.score}
          </p>
          
          <div className="flex gap-4">
            <Button
              onClick={() => window.location.reload()}
              className="flex-1 h-12 hover-glow"
              style={{ backgroundColor: '#B366FF', color: 'white' }}
            >
              Try Again
            </Button>
            <Link to="/challenge-dashboard" className="flex-1">
              <Button
                className="w-full h-12 hover-glow"
                style={{ backgroundColor: '#0D1117', color: '#FF3366', border: '2px solid #FF3366' }}
              >
                Exit
              </Button>
            </Link>
          </div>
        </Card>

        <style>{`
          .grid-background {
            background-image: 
              linear-gradient(rgba(255, 51, 102, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 51, 102, 0.03) 1px, transparent 1px);
            background-size: 50px 50px;
          }

          .hover-glow:hover {
            transform: translateY(-2px);
            transition: all 0.2s ease;
          }
        `}</style>
      </div>
    );
  }

  return null;
}
