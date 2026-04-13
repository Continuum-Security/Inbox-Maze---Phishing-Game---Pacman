import { useAuth } from '../AuthContext';
import { projectId } from '../../../../utils/supabase/info';
import { toast } from 'sonner';

// 2FA scenarios for inspection
interface TwoFAScenario {
  id: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  situation: string;
  description: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  correctOptionIndex: number;
  explanation: string;
  concept: string;
}

const twoFAScenarios: TwoFAScenario[] = [
  // EASY
  {
    id: 1,
    difficulty: 'Easy',
    situation: 'Setting up Capitec online banking',
    description: 'You\'re setting up online banking with Capitec. Which 2FA method is the MOST secure?',
    options: [
      { text: 'SMS text message codes to your Vodacom number', isCorrect: false },
      { text: 'Authenticator app (Microsoft/Google Authenticator)', isCorrect: true },
      { text: 'Email verification codes', isCorrect: false },
      { text: 'No 2FA - just a strong password', isCorrect: false }
    ],
    correctOptionIndex: 1,
    explanation: 'Authenticator apps generate time-based codes locally on your device and are much more secure than SMS, especially against SIM swapping attacks common in South Africa.',
    concept: 'Authenticator apps are most secure'
  },
  {
    id: 2,
    difficulty: 'Easy',
    situation: 'Phone stolen at taxi rank',
    description: 'Your MTN phone was stolen at the taxi rank. What should you do FIRST to protect your 2FA codes?',
    options: [
      { text: 'Wait to see if someone returns it', isCorrect: false },
      { text: 'Contact MTN to block SIM and remotely wipe device', isCorrect: true },
      { text: 'Change all passwords but keep 2FA as is', isCorrect: false },
      { text: 'Buy a new phone at the nearest mall first', isCorrect: false }
    ],
    correctOptionIndex: 1,
    explanation: 'Immediately contact MTN/Vodacom/Telkom to block your SIM and use Find My Device to remotely wipe your phone to protect your accounts. SIM swap fraud is a major risk in SA.',
    concept: 'Act immediately on device theft'
  },
  {
    id: 3,
    difficulty: 'Easy',
    situation: 'Using public WiFi at airport',
    description: 'You\'re at OR Tambo airport using public WiFi. Should you disable 2FA for convenience?',
    options: [
      { text: 'Yes, public WiFi is safe at airports', isCorrect: false },
      { text: 'No, keep 2FA enabled always - use authenticator app', isCorrect: true },
      { text: 'Only disable temporarily while traveling', isCorrect: false },
      { text: 'It doesn\'t matter on public WiFi', isCorrect: false }
    ],
    correctOptionIndex: 1,
    explanation: 'Never disable 2FA, especially on public WiFi! Public networks are prime targets for attackers. Always keep 2FA enabled and use an authenticator app.',
    concept: 'Never disable 2FA on public networks'
  },
  // MEDIUM
  {
    id: 4,
    difficulty: 'Medium',
    situation: 'Unexpected 2FA code at 2am',
    description: 'You receive an unexpected 2FA SMS code for your FNB banking app at 2am. What should you do?',
    options: [
      { text: 'Ignore it - probably just a glitch', isCorrect: false },
      { text: 'Reply to SMS to cancel the login attempt', isCorrect: false },
      { text: 'Immediately change password and contact FNB security', isCorrect: true },
      { text: 'Enter the code to see what happens', isCorrect: false }
    ],
    correctOptionIndex: 2,
    explanation: 'Unsolicited 2FA codes mean someone has your password and is trying to access your account RIGHT NOW. Change password immediately and contact your bank.',
    concept: 'Unsolicited codes = active attack'
  },
  {
    id: 5,
    difficulty: 'Medium',
    situation: 'Storing 2FA backup codes',
    description: 'What should you do with 2FA backup codes for your TymeBank account?',
    options: [
      { text: 'Store them in a password manager like Bitwarden', isCorrect: true },
      { text: 'Email them to your Gmail account', isCorrect: false },
      { text: 'You don\'t need backup codes', isCorrect: false },
      { text: 'Save them in a WhatsApp message to yourself', isCorrect: false }
    ],
    correctOptionIndex: 0,
    explanation: 'A password manager is secure and encrypted. Also consider printing a physical copy and storing it safely at home. Backup codes are essential if you lose your 2FA device.',
    concept: 'Secure backup code storage is critical'
  },
  {
    id: 6,
    difficulty: 'Medium',
    situation: 'Family member asks for code',
    description: 'Your spouse asks for your 2FA code to check your Discovery Vitality points. Should you share it?',
    options: [
      { text: 'Yes, it\'s family so it\'s safe', isCorrect: false },
      { text: 'No, log in yourself and show them the screen', isCorrect: true },
      { text: 'Share it this time but change password later', isCorrect: false },
      { text: 'Give them your password instead', isCorrect: false }
    ],
    correctOptionIndex: 1,
    explanation: 'NEVER share 2FA codes or passwords, even with family. 2FA codes grant access to your account. Log in yourself and show them what they need to see.',
    concept: 'Never share 2FA codes with anyone'
  },
  // HARD
  {
    id: 7,
    difficulty: 'Hard',
    situation: 'Takealot verification email scam',
    description: 'A Takealot email says your order is on hold and asks you to verify by entering the 2FA code they just sent. What do you do?',
    options: [
      { text: 'Enter the code to verify - don\'t want to lose order', isCorrect: false },
      { text: 'Delete email and check Takealot by typing URL directly', isCorrect: true },
      { text: 'Reply to email asking if it\'s legitimate', isCorrect: false },
      { text: 'Click the link to check order status', isCorrect: false }
    ],
    correctOptionIndex: 1,
    explanation: 'This is a sophisticated phishing attack! Legitimate companies NEVER ask you to share 2FA codes via email. Always access accounts directly through official apps or by typing URLs.',
    concept: 'Companies never ask for 2FA codes'
  },
  {
    id: 8,
    difficulty: 'Hard',
    situation: 'Traveling without data connection',
    description: 'Your company requires 2FA for Office 365. You\'re traveling to Durban for a conference and won\'t have data. What\'s the best approach?',
    options: [
      { text: 'Disable 2FA temporarily while traveling', isCorrect: false },
      { text: 'Use offline authenticator app and save backup codes', isCorrect: true },
      { text: 'Only use SMS codes and buy data bundles', isCorrect: false },
      { text: 'Ask IT to whitelist your device', isCorrect: false }
    ],
    correctOptionIndex: 1,
    explanation: 'Authenticator apps like Microsoft/Google Authenticator work offline! They generate time-based codes without internet. Also save backup codes as fallback.',
    concept: 'Authenticator apps work offline'
  },
  {
    id: 9,
    difficulty: 'Hard',
    situation: 'SIM swap attack detection',
    description: 'Your phone suddenly shows "No Service" and you can\'t make calls. This could be a SIM swap attack. What do you do?',
    options: [
      { text: 'Wait a few hours for service to restore', isCorrect: false },
      { text: 'Immediately contact bank and email provider to freeze accounts', isCorrect: true },
      { text: 'Just restart your phone multiple times', isCorrect: false },
      { text: 'Visit MTN store next week to investigate', isCorrect: false }
    ],
    correctOptionIndex: 1,
    explanation: 'Sudden loss of service could mean someone cloned your SIM! Immediately contact your bank, email provider, and network to freeze accounts and verify SIM status. SIM swap fraud is rampant in SA.',
    concept: 'Sudden service loss = potential SIM swap'
  },
  {
    id: 10,
    difficulty: 'Hard',
    situation: 'Using 2FA on shared computer',
    description: 'You need to access your Nedbank account from your colleague\'s PC at work. How should you handle 2FA?',
    options: [
      { text: 'Enter 2FA code and check "Trust this device"', isCorrect: false },
      { text: 'Use 2FA code but don\'t save/trust device, log out fully', isCorrect: true },
      { text: 'Skip 2FA for this one-time access', isCorrect: false },
      { text: 'Use their phone for 2FA code instead', isCorrect: false }
    ],
    correctOptionIndex: 1,
    explanation: 'NEVER trust/save credentials on shared devices! Use 2FA code for access, complete your task, then log out completely. Clear browser history and never save passwords on shared PCs.',
    concept: 'Never trust shared devices'
  }
];

// Power-up types
type PowerUpType = 'code-scanner' | 'sim-shield' | 'backup-vault' | 'auth-boost';

interface PowerUp {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  active: boolean;
}

// Enemy ghost types
type GhostType = 'sim-swapper' | 'code-thief' | 'phisher' | 'social-engineer';

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
  scenariosCompleted: number;
  threatMeter: number;
  combo: number;
  activePowerUp: PowerUpType | null;
  powerUpTimer: number;
}

type GameScreen = 'intro' | 'playing' | 'scenario-inspection' | 'results' | 'game-over';

export function TwoFactorGame() {
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
    scenariosCompleted: 0,
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
  const [scenarios, setScenarios] = useState<{x: number, y: number, collected: boolean, scenarioId: number}[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  
  // Current scenario inspection
  const [currentScenario, setCurrentScenario] = useState<TwoFAScenario | null>(null);
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

    // Place scenarios at strategic locations
    const scenarioPositions = [
      { x: 7, y: 3, scenarioId: 0 },
      { x: 3, y: 7, scenarioId: 1 },
      { x: 11, y: 7, scenarioId: 2 },
      { x: 7, y: 11, scenarioId: 3 },
      { x: 13, y: 1, scenarioId: 4 }
    ];
    setScenarios(scenarioPositions.map(pos => ({ ...pos, collected: false })));

    // Initialize ghosts
    const ghostTypes: GhostType[] = ['sim-swapper', 'code-thief', 'phisher', 'social-engineer'];
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
      { type: 'code-scanner', x: 1, y: 13 },
      { type: 'sim-shield', x: 13, y: 13 },
      { type: 'backup-vault', x: 1, y: 7 },
      { type: 'auth-boost', x: 13, y: 7 }
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
      scenariosCompleted: 0,
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

      // Check scenario collection
      setScenarios(prevScenarios => {
        const playerGridX = Math.round(player.x);
        const playerGridY = Math.round(player.y);
        
        return prevScenarios.map(scenario => {
          if (!scenario.collected && Math.abs(scenario.x - playerGridX) < 0.5 && Math.abs(scenario.y - playerGridY) < 0.5) {
            // Trigger scenario inspection
            const twoFAScenario = twoFAScenarios[scenario.scenarioId % twoFAScenarios.length];
            setCurrentScenario(twoFAScenario);
            setGameScreen('scenario-inspection');
            return { ...scenario, collected: true };
          }
          return scenario;
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
          if (gameState.activePowerUp === 'sim-shield') {
            // Protected by shield
            toast.info('SIM Shield protected you!');
          } else {
            // Lose a life
            setGameState(gs => {
              const newLives = gs.lives - 1;
              if (newLives <= 0) {
                setGameScreen('game-over');
              } else {
                toast.error('Hit by threat! Life lost.');
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
            ctx.strokeStyle = '#00D4FF'; // CYAN for ZONE 2
            ctx.lineWidth = 2;
            ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }
        }
      }

      // Draw tokens
      tokens.forEach(token => {
        if (!token.collected) {
          ctx.fillStyle = '#00D4FF'; // CYAN
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

      // Draw scenarios (2FA symbols)
      scenarios.forEach(scenario => {
        if (!scenario.collected) {
          ctx.fillStyle = '#00FF88'; // Green for scenarios
          ctx.shadowColor = '#00FF88';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(
            scenario.x * CELL_SIZE + CELL_SIZE / 2,
            scenario.y * CELL_SIZE + CELL_SIZE / 2,
            8,
            0,
            Math.PI * 2
          );
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
          'sim-swapper': '#FF3366',
          'code-thief': '#FF6B35',
          'phisher': '#FF1744',
          'social-engineer': '#F50057'
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

      // Draw player
      ctx.fillStyle = '#00D4FF'; // CYAN for player
      ctx.shadowColor = '#00D4FF';
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
      ctx.fillStyle = '#00FFFF';
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
  }, [gameScreen, player, ghosts, tokens, scenarios, powerUps]);

  // Handle scenario answer
  const handleScenarioAnswer = (optionIndex: number) => {
    if (!currentScenario) return;

    const correct = optionIndex === currentScenario.correctOptionIndex;
    setTotalAnswers(prev => prev + 1);

    if (correct) {
      setCorrectAnswers(prev => prev + 1);
      const points = currentScenario.difficulty === 'Easy' ? 100 : currentScenario.difficulty === 'Medium' ? 200 : 300;
      const comboBonus = gameState.combo * 50;
      setGameState(gs => ({ 
        ...gs, 
        score: gs.score + points + comboBonus,
        scenariosCompleted: gs.scenariosCompleted + 1,
        combo: gs.combo + 1
      }));
      
      setInspectionFeedback({
        show: true,
        correct: true,
        message: `Correct! ${currentScenario.explanation}`
      });

      // Add learned concept
      if (!conceptsLearned.includes(currentScenario.concept)) {
        setConceptsLearned(prev => [...prev, currentScenario.concept]);
      }
    } else {
      setGameState(gs => ({ ...gs, combo: 0 }));
      setInspectionFeedback({
        show: true,
        correct: false,
        message: `Not quite! ${currentScenario.explanation}`
      });

      setMistakes(prev => [...prev, {
        scenario: currentScenario.situation,
        explanation: currentScenario.explanation
      }]);
    }

    setTimeout(() => {
      setInspectionFeedback({ show: false, correct: false, message: '' });
      setCurrentScenario(null);
      
      // Check if level complete
      const allScenariosCollected = scenarios.filter(s => s.collected).length === scenarios.length;
      if (allScenariosCollected) {
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
            gameType: '2fa',
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
          <nav className="border-b backdrop-blur-md" style={{ borderColor: 'rgba(0, 212, 255, 0.2)', backgroundColor: 'rgba(10, 14, 26, 0.9)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link to="/challenge-dashboard" className="flex items-center gap-3 text-white transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.color = '#00D4FF'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>
                  <Shield className="size-8" style={{ color: '#00D4FF' }} />
                  <h1 className="text-xl font-bold">INBOX MAZE</h1>
                </Link>
              </div>
            </div>
          </nav>

          <div className="max-w-6xl mx-auto px-4 py-12">
            {/* ZONE 2 Badge */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center px-4 py-2 rounded" style={{ 
                backgroundColor: 'rgba(0, 212, 255, 0.15)',
                border: '2px solid #00D4FF',
                color: '#00D4FF'
              }}>
                <span className="font-bold text-sm" style={{ letterSpacing: '0.1em' }}>ZONE 2</span>
              </div>
            </div>

            <Card className="card-slide-in border-2 p-8 mb-6" style={{ 
              backgroundColor: '#0D1117', 
              borderColor: 'rgba(0, 212, 255, 0.4)',
              boxShadow: '0 0 30px rgba(0, 212, 255, 0.2)'
            }}>
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🔐</div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  INBOX MAZE: 2FA Guardian
                </h2>
                <p className="text-xl mb-4" style={{ color: '#00D4FF' }}>
                  Navigate the security maze. Master authentication. Defend your identity.
                </p>
              </div>

              {/* Game Preview */}
              <div className="mb-8 p-6 rounded-lg border-2" style={{ 
                backgroundColor: '#0A0E1A',
                borderColor: 'rgba(0, 212, 255, 0.3)'
              }}>
                <h3 className="text-lg font-bold text-white mb-4 text-center">Arcade Maze Gameplay</h3>
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-300">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔐</div>
                    <div className="font-semibold" style={{ color: '#00D4FF' }}>2FA Guardian</div>
                    <div>Your security orb avatar</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">👻</div>
                    <div className="font-semibold" style={{ color: '#FF3366' }}>Security Threats</div>
                    <div>Avoid authentication attacks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🛡️</div>
                    <div className="font-semibold" style={{ color: '#00FF88' }}>2FA Scenarios</div>
                    <div>Answer security challenges</div>
                  </div>
                </div>
              </div>

              {/* How to Play */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="border-2 rounded-lg p-4" style={{ backgroundColor: '#0D1117', borderColor: 'rgba(0, 212, 255, 0.3)' }}>
                  <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#00D4FF' }}>
                    <Zap className="size-5" />
                    How to Play
                  </h3>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Use arrow keys or WASD to navigate maze</li>
                    <li>• Collect security tokens (cyan dots)</li>
                    <li>• Reach 2FA scenarios (green shields)</li>
                    <li>• Answer authentication security questions</li>
                    <li>• Avoid SIM swappers and code thieves</li>
                    <li>• Collect power-ups for special abilities</li>
                  </ul>
                </div>

                <div className="border-2 rounded-lg p-4" style={{ backgroundColor: '#0D1117', borderColor: 'rgba(0, 212, 255, 0.3)' }}>
                  <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#00D4FF' }}>
                    <Shield className="size-5" />
                    Enemy Types
                  </h3>
                  <div className="text-gray-300 text-sm space-y-2">
                    <div><span style={{ color: '#FF3366' }}>●</span> SIM Swapper - Clones your phone</div>
                    <div><span style={{ color: '#FF6B35' }}>●</span> Code Thief - Steals 2FA codes</div>
                    <div><span style={{ color: '#FF1744' }}>●</span> Phisher - Fake verification</div>
                    <div><span style={{ color: '#F50057' }}>●</span> Social Engineer - Tricks you</div>
                  </div>
                </div>

                <div className="border-2 rounded-lg p-4" style={{ backgroundColor: '#0D1117', borderColor: 'rgba(0, 212, 255, 0.3)' }}>
                  <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#00D4FF' }}>
                    <Key className="size-5" />
                    Power-Ups
                  </h3>
                  <div className="text-gray-300 text-sm space-y-2">
                    <div><span style={{ color: '#B366FF' }}>■</span> Code Scanner - Reveals fake codes</div>
                    <div><span style={{ color: '#B366FF' }}>■</span> SIM Shield - Protection from swaps</div>
                    <div><span style={{ color: '#B366FF' }}>■</span> Backup Vault - Safe code storage</div>
                    <div><span style={{ color: '#B366FF' }}>■</span> Auth Boost - Extra verification</div>
                  </div>
                </div>

                <div className="border-2 rounded-lg p-4" style={{ backgroundColor: '#0D1117', borderColor: 'rgba(0, 212, 255, 0.3)' }}>
                  <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#00D4FF' }}>
                    <Trophy className="size-5" />
                    Scoring
                  </h3>
                  <div className="text-gray-300 text-sm space-y-1">
                    <div>• Security tokens: +10 pts</div>
                    <div>• Easy scenarios: +100 pts</div>
                    <div>• Medium scenarios: +200 pts</div>
                    <div>• Hard scenarios: +300 pts</div>
                    <div>• Combo multiplier: +50 pts/level</div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-4 mb-6 border" style={{ 
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                borderColor: 'rgba(0, 212, 255, 0.3)'
              }}>
                <p className="text-gray-300 text-sm">
                  <strong style={{ color: '#00D4FF' }}>Master 2FA Security!</strong> Navigate the cyan maze, learn authentication best practices, and defend against SIM swappers while mastering two-factor authentication. 3 lives. Complete all scenarios to win.
                </p>
              </div>

              <Button 
                onClick={startGame}
                className="w-full h-14 text-lg font-bold hover-glow"
                style={{ backgroundColor: '#00D4FF', color: '#0A0E1A' }}
              >
                Start Game
              </Button>
            </Card>
          </div>
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

  // PLAYING SCREEN
  if (gameScreen === 'playing') {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0A0E1A' }}>
        <div className="fixed inset-0 grid-background" style={{ zIndex: 0 }} />

        <div className="relative z-10">
          {/* HUD */}
          <div className="border-b backdrop-blur-md" style={{ borderColor: 'rgba(0, 212, 255, 0.2)', backgroundColor: 'rgba(10, 14, 26, 0.9)' }}>
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <div className="px-4 py-2 rounded border-2" style={{ 
                    backgroundColor: '#0D1117',
                    borderColor: 'rgba(0, 212, 255, 0.4)',
                    color: '#00D4FF'
                  }}>
                    <span className="font-bold">SCORE: {gameState.score}</span>
                  </div>
                  <div className="px-4 py-2 rounded border-2" style={{ 
                    backgroundColor: '#0D1117',
                    borderColor: 'rgba(0, 255, 136, 0.4)',
                    color: '#00FF88'
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
                        style={{ color: i < gameState.lives ? '#00D4FF' : '#333' }}
                      />
                    ))}
                  </div>

                  {/* Combo */}
                  {gameState.combo > 0 && (
                    <div className="px-3 py-1 rounded" style={{ 
                      backgroundColor: 'rgba(0, 212, 255, 0.2)',
                      border: '1px solid #00D4FF',
                      color: '#00D4FF'
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
              style={{ borderColor: '#00D4FF', boxShadow: '0 0 30px rgba(0, 212, 255, 0.3)' }}
            />
          </div>

          {/* Controls hint */}
          <div className="text-center text-gray-400 text-sm">
            Use Arrow Keys or WASD to move • Avoid red threats • Collect green 2FA scenarios
          </div>
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
            0% { background-position: 0 0; }
            100% { background-position: 50px 50px; }
          }
        `}</style>
      </div>
    );
  }

  // SCENARIO INSPECTION OVERLAY
  if (gameScreen === 'scenario-inspection' && currentScenario) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'rgba(10, 14, 26, 0.95)' }}>
        <div className="max-w-3xl w-full mx-4">
          {!inspectionFeedback.show ? (
            <Card className="card-slide-in border-2 p-8" style={{ 
              backgroundColor: '#0D1117', 
              borderColor: 'rgba(0, 212, 255, 0.6)',
              boxShadow: '0 0 40px rgba(0, 212, 255, 0.3)'
            }}>
              <div className="flex items-center gap-3 mb-6">
                <Lock className="size-8" style={{ color: '#00D4FF' }} />
                <h2 className="text-2xl font-bold text-white">2FA Security Challenge</h2>
                <div className="ml-auto px-3 py-1 rounded text-sm font-bold" style={{
                  backgroundColor: currentScenario.difficulty === 'Easy' ? 'rgba(0, 255, 136, 0.2)' : currentScenario.difficulty === 'Medium' ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 51, 102, 0.2)',
                  color: currentScenario.difficulty === 'Easy' ? '#00FF88' : currentScenario.difficulty === 'Medium' ? '#FFC107' : '#FF3366'
                }}>
                  {currentScenario.difficulty}
                </div>
              </div>

              {/* Scenario Content */}
              <div className="space-y-4 mb-6">
                <div className="p-4 rounded border" style={{ backgroundColor: '#0A0E1A', borderColor: 'rgba(0, 212, 255, 0.2)' }}>
                  <div className="text-sm text-gray-400 mb-1">Situation:</div>
                  <div className="font-semibold text-white">{currentScenario.situation}</div>
                </div>

                <div className="p-4 rounded border" style={{ backgroundColor: '#0A0E1A', borderColor: 'rgba(0, 212, 255, 0.2)' }}>
                  <div className="text-gray-300">{currentScenario.description}</div>
                </div>
              </div>

              {/* Options */}
              <div className="text-sm text-gray-400 mb-3 text-center">Choose the BEST security practice:</div>
              <div className="grid gap-3">
                {currentScenario.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleScenarioAnswer(index)}
                    className="h-auto py-4 px-4 text-left hover-glow"
                    style={{ 
                      backgroundColor: '#0D1117',
                      color: 'white',
                      border: '2px solid rgba(0, 212, 255, 0.3)',
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
              borderColor: inspectionFeedback.correct ? 'rgba(0, 212, 255, 0.6)' : 'rgba(255, 51, 102, 0.6)',
              boxShadow: inspectionFeedback.correct ? '0 0 40px rgba(0, 212, 255, 0.3)' : '0 0 40px rgba(255, 51, 102, 0.3)'
            }}>
              {inspectionFeedback.correct ? (
                <CheckCircle className="size-20 mx-auto mb-4" style={{ color: '#00D4FF' }} />
              ) : (
                <XCircle className="size-20 mx-auto mb-4" style={{ color: '#FF3366' }} />
              )}
              <h3 className="text-3xl font-bold text-white mb-4">
                {inspectionFeedback.correct ? 'Correct!' : 'Not Quite!'}
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
            border-color: rgba(0, 212, 255, 0.6) !important;
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
          <nav className="border-b backdrop-blur-md" style={{ borderColor: 'rgba(0, 212, 255, 0.2)', backgroundColor: 'rgba(10, 14, 26, 0.9)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link to="/challenge-dashboard" className="flex items-center gap-3 text-white transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.color = '#00D4FF'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>
                  <Shield className="size-8" style={{ color: '#00D4FF' }} />
                  <h1 className="text-xl font-bold">INBOX MAZE</h1>
                </Link>
              </div>
            </div>
          </nav>

          <div className="max-w-4xl mx-auto px-4 py-12">
            <Card className="card-slide-in border-2 p-8" style={{ 
              backgroundColor: '#0D1117', 
              borderColor: accuracy >= 70 ? 'rgba(0, 212, 255, 0.4)' : 'rgba(255, 51, 102, 0.4)',
              boxShadow: accuracy >= 70 ? '0 0 30px rgba(0, 212, 255, 0.2)' : '0 0 30px rgba(255, 51, 102, 0.2)'
            }}>
              <div className="text-center mb-8">
                <Trophy className="size-20 mx-auto mb-4" style={{ color: accuracy >= 70 ? '#00D4FF' : '#FF3366' }} />
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
                borderColor: accuracy >= 70 ? 'rgba(0, 212, 255, 0.4)' : 'rgba(255, 51, 102, 0.4)'
              }}>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Final Score</div>
                    <div className="text-4xl font-bold" style={{ color: accuracy >= 70 ? '#00D4FF' : '#FF3366' }}>
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
                  backgroundColor: 'rgba(0, 212, 255, 0.1)',
                  borderColor: 'rgba(0, 212, 255, 0.3)'
                }}>
                  <h3 className="font-bold text-white mb-3">🎓 2FA Concepts Mastered</h3>
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
                  style={{ backgroundColor: '#00D4FF', color: '#0A0E1A' }}
                >
                  Play Again
                </Button>
                <Link to="/challenge-dashboard" className="flex-1">
                  <Button
                    className="w-full h-12 hover-glow"
                    style={{ backgroundColor: '#0D1117', color: '#00D4FF', border: '2px solid #00D4FF' }}
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
              linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
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
            All lives lost! Final Score: {gameState.score}
          </p>
          
          <div className="flex gap-4">
            <Button
              onClick={() => window.location.reload()}
              className="flex-1 h-12 hover-glow"
              style={{ backgroundColor: '#00D4FF', color: '#0A0E1A' }}
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