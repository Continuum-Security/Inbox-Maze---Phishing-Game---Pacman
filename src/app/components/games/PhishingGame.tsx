import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { 
  Shield, 
  Mail,
  CheckCircle, 
  XCircle, 
  Trophy,
  ArrowUp,
  Gamepad2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { projectId } from '../../../../utils/supabase/info';
import { toast } from 'sonner';

// Email scenarios - 15 total (9 phishing + 6 legitimate)
interface EmailScenario {
  id: number;
  from: string;
  subject: string;
  body: string;
  isPhishing: boolean;
  correctAnswer: string;
  explanation: string;
}

const ALL_EMAIL_SCENARIOS: EmailScenario[] = [
  // PHISHING EMAILS (9)
  {
    id: 1,
    from: 'ceo@company.co.za',
    subject: 'URGENT: Wire Transfer R250,000 NOW',
    body: 'Need immediate wire transfer for confidential deal. Send to account: 123-456-789. DO NOT discuss with anyone. Time sensitive!',
    isPhishing: true,
    correctAnswer: 'Report as phishing',
    explanation: 'CEO fraud attack - executives never request urgent wire transfers via email without proper channels.'
  },
  {
    id: 2,
    from: 'security@fnb.secure-verify.co.za',
    subject: 'Suspicious Activity Detected',
    body: 'Your FNB account has suspicious activity. Click here immediately to verify your account or it will be suspended within 24 hours.',
    isPhishing: true,
    correctAnswer: 'Report as phishing',
    explanation: 'Fake domain spoofing - real FNB domain is fnb.co.za, not fnb.secure-verify.co.za.'
  },
  {
    id: 3,
    from: 'noreply@sars-gov.verify-refund.com',
    subject: 'Tax Refund: R12,450 Awaiting',
    body: 'You have an unclaimed tax refund. Click here to claim within 48 hours or funds will be forfeited. SARS verification required.',
    isPhishing: true,
    correctAnswer: 'Report as phishing',
    explanation: 'SARS phishing - real domain is sars.gov.za and refunds are processed through eFiling portal only.'
  },
  {
    id: 4,
    from: 'support@capitec-mobile-banking.co.za',
    subject: 'App Update Required',
    body: 'Your Capitec app is outdated. Download the latest version from this link immediately to continue banking services.',
    isPhishing: true,
    correctAnswer: 'Report as phishing',
    explanation: 'Fake domain - real Capitec domain is capitecbank.co.za. Apps update through official stores only.'
  },
  {
    id: 5,
    from: 'colleague@mycompany.co.za',
    subject: 'Can you review this invoice urgently?',
    body: 'Hey, quick favor - can you check this invoice? [Google Drive link]. Need approval before 5pm today. Thanks!',
    isPhishing: true,
    correctAnswer: 'Verify with sender first',
    explanation: 'Compromised account attack - even legitimate domains can be hacked. Always verify urgent requests via phone/SMS.'
  },
  {
    id: 6,
    from: 'orders@takealot-deliveries.co.za',
    subject: 'Package Delivery Failed',
    body: 'Your Takealot package delivery failed. Pay R45 redelivery fee here: [link]. Order #TK-2847392.',
    isPhishing: true,
    correctAnswer: 'Report as phishing',
    explanation: 'Fake Takealot domain - real domain is takealot.com. Delivery fees are never paid via email links.'
  },
  {
    id: 7,
    from: 'hr@recruitment-offers.co.za',
    subject: 'Job Offer - Senior Analyst Position',
    body: 'Congratulations! You\'ve been selected for Senior Analyst role at Discovery. Accept offer by providing ID copy and bank details here.',
    isPhishing: true,
    correctAnswer: 'Report as phishing',
    explanation: 'Job scam - legitimate recruiters use company domains and never request sensitive info via email links.'
  },
  {
    id: 8,
    from: 'billing@vodacom-accounts.co.za',
    subject: 'Overdue Account - Service Suspension',
    body: 'Your Vodacom account is R850 overdue. Pay immediately to avoid disconnection: [payment link]. Reference: VD-98234.',
    isPhishing: true,
    correctAnswer: 'Report as phishing',
    explanation: 'Fake Vodacom domain - real domain is vodacom.co.za. Check bills through official app or website only.'
  },
  {
    id: 9,
    from: 'rewards@discovery-vitality.member-portal.com',
    subject: 'Claim Your Vitality Points: 5000 Points!',
    body: 'You have 5000 unclaimed Vitality points expiring soon! Log in here to redeem for Woolworths vouchers before they expire.',
    isPhishing: true,
    correctAnswer: 'Report as phishing',
    explanation: 'Domain spoofing - real Discovery domain is discovery.co.za. Vitality points accessed via official app only.'
  },
  
  // LEGITIMATE EMAILS (6)
  {
    id: 10,
    from: 'hr@mycompany.co.za',
    subject: 'Monthly Payslip - March 2026',
    body: 'Your March payslip is attached. Please review and confirm receipt. Contact HR if you have questions about deductions.',
    isPhishing: false,
    correctAnswer: 'Safe to proceed',
    explanation: 'Legitimate internal HR email from verified company domain with expected monthly communication.'
  },
  {
    id: 11,
    from: 'noreply@takealot.com',
    subject: 'Order Confirmation #TK8472934',
    body: 'Thanks for your order! Your Samsung Galaxy Buds will be delivered by March 15. Track your order in your Takealot account.',
    isPhishing: false,
    correctAnswer: 'Safe to proceed',
    explanation: 'Legitimate Takealot email from official domain (takealot.com) with valid order confirmation.'
  },
  {
    id: 12,
    from: 'notifications@linkedin.com',
    subject: 'You appeared in 12 searches this week',
    body: 'Your LinkedIn profile appeared in searches by recruiters at Deloitte, PwC, and 10 other companies. View who\'s interested in your profile.',
    isPhishing: false,
    correctAnswer: 'Safe to proceed',
    explanation: 'Legitimate LinkedIn notification from official domain with typical engagement summary.'
  },
  {
    id: 13,
    from: 'calendar@google.com',
    subject: 'Meeting Tomorrow: Q1 Strategy Review',
    body: 'You have a meeting tomorrow at 10:00 AM - Q1 Strategy Review with John Smith and 5 others. Conference Room B.',
    isPhishing: false,
    correctAnswer: 'Safe to proceed',
    explanation: 'Legitimate Google Calendar reminder from official Google domain for scheduled meeting.'
  },
  {
    id: 14,
    from: 'support@woolworths.co.za',
    subject: 'Your WRewards Statement',
    body: 'Your monthly WRewards statement is ready. You earned 450 points this month. View your statement in the Woolworths app.',
    isPhishing: false,
    correctAnswer: 'Safe to proceed',
    explanation: 'Legitimate Woolworths email from official domain (woolworths.co.za) with rewards statement.'
  },
  {
    id: 15,
    from: 'team@mycompany.co.za',
    subject: 'Friday Team Lunch - Nando\'s',
    body: 'Team lunch this Friday at Nando\'s Rosebank, 12:30 PM. Please RSVP by Thursday so we can book the table. Looking forward to it!',
    isPhishing: false,
    correctAnswer: 'Safe to proceed',
    explanation: 'Legitimate internal team email from company domain about social event - normal workplace communication.'
  }
];

// Power-up types
type PowerUpType = 'spam-filter' | 'virus-scan' | 'email-shield' | 'phish-detector';

interface PowerUp {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  active: boolean;
}

// Enemy ghost types
type GhostType = 'phisher' | 'spammer' | 'hacker' | 'scammer';

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
  nextDirection: 'up' | 'down' | 'left' | 'right' | null;
  speed: number;
  moving: boolean;
  invulnerable: boolean;
}

interface GameState {
  cyberIQ: number;
  lives: number;
  emailsAnswered: number;
  totalEmails: number;
  emailsCorrect: number;
  invulnerable: boolean;
  invulnerableTimer: number;
}

type GameScreen = 'intro' | 'playing' | 'email-review' | 'results' | 'game-over';

export function PhishingGame() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
  // Animation frame refs
  const animationFrameRef = useRef<number | null>(null);
  const gameLoopIntervalRef = useRef<number | null>(null);
  
  // Game screen ref for stable game loop (prevents loop restarts on screen changes)
  const gameScreenRef = useRef<GameScreen>('intro');
  
  // Refs for game loop (to avoid re-rendering the game loop)
  const playerRef = useRef<Player>({ x: 1, y: 1, direction: 'right', nextDirection: null, speed: 0.213, moving: false, invulnerable: false });
  const ghostsRef = useRef<Ghost[]>([]);
  const gameStateRef = useRef<GameState>({ cyberIQ: 0, lives: 3, emailsAnswered: 0, totalEmails: 5, emailsCorrect: 0, invulnerable: false, invulnerableTimer: 0 });
  const pelletsRef = useRef<{x: number, y: number, collected: boolean}[]>([]);
  const emailCheckpointsRef = useRef<{x: number, y: number, collected: boolean, scenarioId: number}[]>([]);
  const shieldPowerUpsRef = useRef<{x: number, y: number, collected: boolean}[]>([]);
  const selectedEmailsRef = useRef<EmailScenario[]>([]);
  
  // Event queue for screen transitions (prevents setState inside game loop)
  const eventQueueRef = useRef<{type: 'email-collected' | 'game-over' | 'game-complete' | 'life-lost', data?: any}[]>([]);
  const lastToastTimeRef = useRef<number>(0);
  
  // Red flash ref for visual feedback (prevents DOM manipulation)
  const redFlashRef = useRef<number>(0);
  
  // Floating score texts for visual feedback (+10 points)
  const floatingTextsRef = useRef<{x: number, y: number, text: string, opacity: number, timer: number}[]>([]);
  
  // Position preservation refs for popups
  const savedPlayerPosRef = useRef<{x: number, y: number} | null>(null);
  const savedFeedbackPlayerPosRef = useRef<{x: number, y: number} | null>(null);
  
  // Consolidated UI state - SINGLE setState reduces re-renders
  const [uiState, setUiState] = useState<{
    screen: GameScreen;
    gameState: GameState;
    currentEmail: EmailScenario | null;
    feedback: {show: boolean, correct: boolean, message: string} | null;
  }>({
    screen: 'intro',
    gameState: {
      cyberIQ: 0,
      lives: 3,
      emailsAnswered: 0,
      totalEmails: 5,
      emailsCorrect: 0,
      invulnerable: false,
      invulnerableTimer: 0
    },
    currentEmail: null,
    feedback: null
  });
  
  // Destructure for convenience
  const gameScreen = uiState.screen;
  const gameState = uiState.gameState;
  const currentEmail = uiState.currentEmail;
  const reviewFeedback = uiState.feedback;
  
  // Player
  const [player, setPlayer] = useState<Player>({
    x: 1,
    y: 1,
    direction: 'right',
    nextDirection: null,
    speed: 0.213,
    moving: false,
    invulnerable: false
  });
  
  // Enemies
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  
  // Collectibles
  const [pellets, setPellets] = useState<{x: number, y: number, collected: boolean}[]>([]);
  const [emailCheckpoints, setEmailCheckpoints] = useState<{x: number, y: number, collected: boolean, scenarioId: number}[]>([]);
  
  // Shield power-ups
  const [shieldPowerUps, setShieldPowerUps] = useState<{x: number, y: number, collected: boolean}[]>([]);
  
  // Shield overlay (BUG 4 fix)
  const [shieldOverlay, setShieldOverlay] = useState<{show: boolean, message: string} | null>(null);
  const shieldOverlayRef = useRef<{show: boolean, message: string} | null>(null);
  const gamePausedRef = useRef(false);
  
  // Selected emails for this round
  const [selectedEmails, setSelectedEmails] = useState<EmailScenario[]>([]);
  
  // Red flash visual feedback state
  const [redFlash, setRedFlash] = useState(false);
  
  // Sync gameScreenRef with gameScreen state
  useEffect(() => {
    gameScreenRef.current = gameScreen;
    
    // BUG 3 fix: Focus game container when entering playing state
    if (gameScreen === 'playing' && gameContainerRef.current) {
      gameContainerRef.current.focus();
    }
  }, [gameScreen]);
  
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

  // Select random emails (3 phishing + 2 legitimate)
  const selectRandomEmails = useCallback(() => {
    const phishingEmails = ALL_EMAIL_SCENARIOS.filter(e => e.isPhishing);
    const legitimateEmails = ALL_EMAIL_SCENARIOS.filter(e => !e.isPhishing);
    
    // Shuffle and select 3 phishing
    const shuffledPhishing = [...phishingEmails].sort(() => Math.random() - 0.5);
    const selectedPhishing = shuffledPhishing.slice(0, 3);
    
    // Shuffle and select 2 legitimate
    const shuffledLegitimate = [...legitimateEmails].sort(() => Math.random() - 0.5);
    const selectedLegitimate = shuffledLegitimate.slice(0, 2);
    
    // Combine and shuffle the final 5
    const combined = [...selectedPhishing, ...selectedLegitimate].sort(() => Math.random() - 0.5);
    return combined;
  }, []);

  // Initialize collectibles and enemies
  const initializeLevel = useCallback(() => {
    // Select random 5 emails for this round
    const emails = selectRandomEmails();
    setSelectedEmails(emails);
    selectedEmailsRef.current = emails;
    
    // Place pellets on all open paths
    const newPellets: {x: number, y: number, collected: boolean}[] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (maze[y][x] === 0 && !(x === 1 && y === 1)) {
          newPellets.push({ x, y, collected: false });
        }
      }
    }
    setPellets(newPellets);
    pelletsRef.current = newPellets;

    // Place 5 email checkpoints at strategic locations
    const emailPositions = [
      { x: 7, y: 3, scenarioId: 0 },
      { x: 3, y: 7, scenarioId: 1 },
      { x: 11, y: 7, scenarioId: 2 },
      { x: 7, y: 11, scenarioId: 3 },
      { x: 13, y: 1, scenarioId: 4 }
    ];
    setEmailCheckpoints(emailPositions.map(pos => ({ ...pos, collected: false })));
    emailCheckpointsRef.current = emailPositions.map(pos => ({ ...pos, collected: false }));

    // Place 4 shield power-ups at strategic locations
    const shieldPositions = [
      { x: 1, y: 7 },
      { x: 13, y: 7 },
      { x: 5, y: 3 },
      { x: 9, y: 11 }
    ];
    setShieldPowerUps(shieldPositions.map(pos => ({ ...pos, collected: false })));
    shieldPowerUpsRef.current = shieldPositions.map(pos => ({ ...pos, collected: false }));

    // Initialize ghosts
    const ghostTypes: GhostType[] = ['phisher', 'spammer', 'hacker', 'scammer'];
    const newGhosts: Ghost[] = ghostTypes.map((type, i) => ({
      id: `ghost-${i}`,
      type,
      x: 7,
      y: 7,
      direction: ['up', 'down', 'left', 'right'][i] as any,
      speed: 0.107,
      scared: false
    }));
    setGhosts(newGhosts);
    ghostsRef.current = newGhosts;
  }, [selectRandomEmails]);

  // Reset game completely
  const resetGame = useCallback(() => {
    eventQueueRef.current = [];
    gameScreenRef.current = 'playing';
    gamePausedRef.current = false;
    const initialGameState = {
      cyberIQ: 0,
      lives: 3,
      emailsAnswered: 0,
      totalEmails: 5,
      emailsCorrect: 0,
      invulnerable: false,
      invulnerableTimer: 0
    };
    
    gameStateRef.current = initialGameState;
    
    setUiState(prev => ({
      ...prev,
      gameState: initialGameState,
      currentEmail: null,
      feedback: null
    }));
    setPlayer({
      x: 1,
      y: 1,
      direction: 'right',
      nextDirection: null,
      speed: 0.213,
      moving: false,
      invulnerable: false
    });
    redFlashRef.current = 0;
    initializeLevel();
  }, [initializeLevel]);

  // Start game
  const startGame = () => {
    setUiState(prev => ({ ...prev, screen: 'playing' }));
    resetGame();
  };

  // Check if player can move in direction
  const canMove = (x: number, y: number, direction: 'up' | 'down' | 'left' | 'right'): boolean => {
    let checkX: number;
    let checkY: number;

    if (direction === 'right') { checkX = Math.floor(x) + 1; checkY = Math.round(y); }
    else if (direction === 'left') { checkX = Math.ceil(x) - 1; checkY = Math.round(y); }
    else if (direction === 'down') { checkY = Math.floor(y) + 1; checkX = Math.round(x); }
    else { checkY = Math.ceil(y) - 1; checkX = Math.round(x); }

    if (checkX < 0 || checkX >= GRID_SIZE || checkY < 0 || checkY >= GRID_SIZE) return false;
    return maze[checkY][checkX] === 0;
  };

  // Check if at intersection (can change direction)
  const isAtIntersection = (x: number, y: number): boolean => {
    const gridX = Math.round(x);
    const gridY = Math.round(y);
    const closeEnough = Math.abs(x - gridX) < 0.3 && Math.abs(y - gridY) < 0.3;
    return closeEnough;
  };

  // Keyboard controls - document and window-level listeners (BUG 3 fix)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameScreenRef.current !== 'playing' || gamePausedRef.current || shieldOverlayRef.current?.show) return;
      
      const key = e.key;
      if (['w','W','ArrowUp','s','S','ArrowDown','a','A','ArrowLeft','d','D','ArrowRight'].includes(key)) {
        e.preventDefault();
      }
      if (['w','W','ArrowUp'].includes(key)) {
        playerRef.current = { ...playerRef.current, nextDirection: 'up' };
      } else if (['s','S','ArrowDown'].includes(key)) {
        playerRef.current = { ...playerRef.current, nextDirection: 'down' };
      } else if (['a','A','ArrowLeft'].includes(key)) {
        playerRef.current = { ...playerRef.current, nextDirection: 'left' };
      } else if (['d','D','ArrowRight'].includes(key)) {
        playerRef.current = { ...playerRef.current, nextDirection: 'right' };
      }
    };

    // Add both document and window listeners for better coverage
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Game loop - REF-BASED with requestAnimationFrame (no setState during loop)
  useEffect(() => {

    const gameLoop = () => {
      // Immediate bail if paused (belt-and-suspenders guard)
      if (gamePausedRef.current || shieldOverlayRef.current?.show || gameScreenRef.current !== 'playing') return;

      const currentPlayer = playerRef.current;
      const currentGhosts = ghostsRef.current;
      const currentGameState = gameStateRef.current;
      const currentPellets = pelletsRef.current;
      const currentEmailCheckpoints = emailCheckpointsRef.current;
      const currentShieldPowerUps = shieldPowerUpsRef.current;
      const currentSelectedEmails = selectedEmailsRef.current;

      // Move player with grid-locking
      let newX = currentPlayer.x;
      let newY = currentPlayer.y;
      let newDirection = currentPlayer.direction;
      let newNextDirection = currentPlayer.nextDirection;

      // Try to apply pending direction at intersections
      if (currentPlayer.nextDirection && isAtIntersection(currentPlayer.x, currentPlayer.y)) {
        if (canMove(currentPlayer.x, currentPlayer.y, currentPlayer.nextDirection)) {
          newDirection = currentPlayer.nextDirection;
          newNextDirection = null; // Clear the pending direction
          newX = Math.round(currentPlayer.x);
          newY = Math.round(currentPlayer.y);
        }
      }

      // Move in the current direction
      if (canMove(newX, newY, newDirection)) {
        if (newDirection === 'up') newY -= currentPlayer.speed;
        else if (newDirection === 'down') newY += currentPlayer.speed;
        else if (newDirection === 'left') newX -= currentPlayer.speed;
        else if (newDirection === 'right') newX += currentPlayer.speed;
      }

      const updatedPlayer = { ...currentPlayer, x: newX, y: newY, direction: newDirection, nextDirection: newNextDirection };
      if (isNaN(updatedPlayer.x) || isNaN(updatedPlayer.y)) {
        updatedPlayer.x = 1;
        updatedPlayer.y = 1;
      }
      playerRef.current = updatedPlayer;

      // Move ghosts (simple AI with grid-locking)
      const updatedGhosts = currentGhosts.map((ghost, i) => {
        let ghostNewX = ghost.x;
        let ghostNewY = ghost.y;
        let ghostNewDirection = ghost.direction;

        const canMoveGhost = (x: number, y: number, dir: typeof ghost.direction): boolean => {
          let testX = x, testY = y;
          if (dir === 'up') testY -= 0.5;
          else if (dir === 'down') testY += 0.5;
          else if (dir === 'left') testX -= 0.5;
          else if (dir === 'right') testX += 0.5;

          const gx = Math.round(testX);
          const gy = Math.round(testY);
          if (gx < 0 || gx >= GRID_SIZE || gy < 0 || gy >= GRID_SIZE) return false;
          return maze[gy][gx] === 0;
        };

        if (canMoveGhost(ghostNewX, ghostNewY, ghost.direction)) {
          if (ghost.direction === 'up') ghostNewY -= ghost.speed;
          else if (ghost.direction === 'down') ghostNewY += ghost.speed;
          else if (ghost.direction === 'left') ghostNewX -= ghost.speed;
          else if (ghost.direction === 'right') ghostNewX += ghost.speed;
        } else {
          if (isAtIntersection(ghost.x, ghost.y)) {
            const directions: typeof ghost.direction[] = ['up', 'down', 'left', 'right'];
            const validDirs = directions.filter(d => canMoveGhost(ghost.x, ghost.y, d));
            if (validDirs.length > 0) {
              // First ghost (index 0) is a chaser - 60% smart, 40% random
              if (i === 0 && Math.random() < 0.6) {
                // Calculate Manhattan distance to player for each direction
                const distances = validDirs.map(dir => {
                  let testX = ghost.x;
                  let testY = ghost.y;
                  if (dir === 'up') testY -= 1;
                  else if (dir === 'down') testY += 1;
                  else if (dir === 'left') testX -= 1;
                  else if (dir === 'right') testX += 1;
                  return {
                    dir,
                    distance: Math.abs(testX - currentPlayer.x) + Math.abs(testY - currentPlayer.y)
                  };
                });
                // Pick direction with minimum distance
                const bestDir = distances.reduce((min, curr) => curr.distance < min.distance ? curr : min);
                ghostNewDirection = bestDir.dir;
              } else {
                // All other ghosts and 40% of first ghost - random
                ghostNewDirection = validDirs[Math.floor(Math.random() * validDirs.length)];
              }
              ghostNewX = Math.round(ghost.x);
              ghostNewY = Math.round(ghost.y);
            }
          }
        }

        return { ...ghost, x: ghostNewX, y: ghostNewY, direction: ghostNewDirection };
      });
      ghostsRef.current = updatedGhosts;

      // Check pellet collection
      const playerGridX = Math.round(updatedPlayer.x);
      const playerGridY = Math.round(updatedPlayer.y);

      currentPellets.forEach(pellet => {
        if (!pellet.collected && pellet.x === playerGridX && pellet.y === playerGridY) {
          pellet.collected = true;
        }
      });

      // Check email checkpoint collection (queue event instead of setState)
      currentEmailCheckpoints.forEach(checkpoint => {
        if (!checkpoint.collected && Math.abs(checkpoint.x - playerGridX) < 0.5 && Math.abs(checkpoint.y - playerGridY) < 0.5) {
          checkpoint.collected = true;
          const email = currentSelectedEmails[checkpoint.scenarioId];
          if (!eventQueueRef.current.some(e => e.type === 'email-collected')) {
            eventQueueRef.current.push({ type: 'email-collected', data: email });
            gamePausedRef.current = true;
          }
        }
      });

      // Check shield power-up collection (debounced toast)
      currentShieldPowerUps.forEach(shield => {
        if (!shield.collected && Math.abs(shield.x - playerGridX) < 0.5 && Math.abs(shield.y - playerGridY) < 0.5) {
          shield.collected = true;
          gameStateRef.current = { ...gameStateRef.current, invulnerable: true, invulnerableTimer: 160 };
          
          // BUG 4 fix: Show shield overlay with tip
          const cyberTips = [
            'Always check domain names carefully before clicking links!',
            'Verify sender addresses - look for misspellings or unusual domains!',
            'Look for spelling errors and grammar mistakes in suspicious emails!',
            'Never click unknown links - hover to preview the URL first!',
            'Report suspicious emails to your IT security team immediately!',
            'Use multi-factor authentication to protect your accounts!',
            'Never share passwords or sensitive data via email!',
            'Be wary of urgent language designed to create panic!',
          ];
          const randomTip = cyberTips[Math.floor(Math.random() * cyberTips.length)];
          const overlayData = { show: true, message: randomTip };
          savedPlayerPosRef.current = { x: playerRef.current.x, y: playerRef.current.y };
          playerRef.current = { ...playerRef.current, nextDirection: null };
          shieldOverlayRef.current = overlayData;
          gamePausedRef.current = true;
          setShieldOverlay(overlayData);

          // Auto-hide after 2.6 seconds
          setTimeout(() => {
            shieldOverlayRef.current = null;
            setShieldOverlay(null);
            if (savedPlayerPosRef.current) {
              playerRef.current = { ...playerRef.current, x: savedPlayerPosRef.current.x, y: savedPlayerPosRef.current.y, nextDirection: null };
              savedPlayerPosRef.current = null;
            }
            gamePausedRef.current = false;
          }, 2600);
        }
      });

      // Check ghost collision
      if (!updatedPlayer.invulnerable && !currentGameState.invulnerable) {
        updatedGhosts.forEach(ghost => {
          if (Math.abs(ghost.x - updatedPlayer.x) < 0.6 && Math.abs(ghost.y - updatedPlayer.y) < 0.6) {
            loseLife();
          }
        });
      }

      // Update invulnerability timer
      if (currentGameState.invulnerableTimer > 0) {
        const newTimer = currentGameState.invulnerableTimer - 1;
        if (newTimer === 0) {
          gameStateRef.current = { ...gameStateRef.current, invulnerableTimer: 0, invulnerable: false };
        } else {
          gameStateRef.current = { ...gameStateRef.current, invulnerableTimer: newTimer };
        }
      }
    };

    // Use requestAnimationFrame for smoother performance
    let lastTime = Date.now();
    let accumulator = 0;
    const fixedTimeStep = 50; // 50ms = 20 updates per second
    
    const frameLoop = () => {
      // Only run game loop if on playing screen (pause during email review and shield overlay)
      if (gameScreenRef.current !== 'playing' || shieldOverlayRef.current?.show || gamePausedRef.current) {
        // CRITICAL: Reset lastTime so no time accumulates during pause.
        // Without this, unpausing after 2.6s would cause ~52 gameLoop() calls in one frame.
        lastTime = Date.now();
        accumulator = 0;
        gameLoopIntervalRef.current = requestAnimationFrame(frameLoop);
        return;
      }

      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Cap deltaTime to prevent burst updates (max 3 steps per frame)
      accumulator += Math.min(deltaTime, fixedTimeStep * 3);

      // Fixed time step updates
      while (accumulator >= fixedTimeStep) {
        if (shieldOverlayRef.current?.show || gameScreenRef.current !== 'playing' || gamePausedRef.current) break;
        gameLoop();
        accumulator -= fixedTimeStep;
      }

      gameLoopIntervalRef.current = requestAnimationFrame(frameLoop);
    };
    
    gameLoopIntervalRef.current = requestAnimationFrame(frameLoop);
    return () => {
      if (gameLoopIntervalRef.current) {
        cancelAnimationFrame(gameLoopIntervalRef.current);
      }
    };
  }, []);

  // Event queue processor - handles screen transitions OUTSIDE game loop
  useEffect(() => {
    const processEvents = () => {
      if (gameScreenRef.current !== 'playing') return;
      
      const event = eventQueueRef.current.shift();
      if (event) {
        if (event.type === 'email-collected') {
          // ONE setState instead of TWO
          setUiState(prev => ({ ...prev, screen: 'email-review', currentEmail: event.data }));
        } else if (event.type === 'game-over') {
          // ONE setState instead of TWO
          setUiState(prev => ({ ...prev, screen: 'game-over', gameState: { ...gameStateRef.current } }));
        } else if (event.type === 'life-lost') {
          // Visual feedback via red flash ref (no DOM manipulation)
          redFlashRef.current = 1.0;
          setRedFlash(true);
          setTimeout(() => setRedFlash(false), 300);
        }
        // NOTE: Do NOT clear gamePausedRef here. It gets cleared by:
        // - handleEmailAnswer (for email-collected events)
        // - shield dismiss setTimeout (for shield overlays)
        // - resetGame (for game-over ‚Üí retry)
        // Clearing it here would race with async React state updates.
      }
    };

    const eventInterval = setInterval(processEvents, 100);
    return () => clearInterval(eventInterval);
  }, []);
  
  // HUD sync - update state for display at low frequency (reduced from 250ms to 500ms)
  useEffect(() => {
    if (gameScreen !== 'playing') return;
    const syncHud = () => {
      setUiState(prev => ({ ...prev, gameState: { ...gameStateRef.current } }));
    };
    const hudInterval = setInterval(syncHud, 500);
    return () => clearInterval(hudInterval);
  }, [gameScreen]);

  // Lose a life (non-blocking version)
  const loseLife = () => {
    const gs = gameStateRef.current;
    const newLives = gs.lives - 1;
    
    if (newLives <= 0) {
      gameStateRef.current = { ...gs, lives: 0 };
      eventQueueRef.current.push({ type: 'game-over' });
      gamePausedRef.current = true;
    } else {
      // Queue life lost event
      eventQueueRef.current.push({ type: 'life-lost' });
      // Reset position with invulnerability
      playerRef.current = { x: 1, y: 1, direction: 'right', nextDirection: null, speed: 0.213, moving: false, invulnerable: true };
      gameStateRef.current = { ...gs, lives: newLives, invulnerable: true, invulnerableTimer: 80 };
      
      // Set 1.5 second invulnerability cooldown
      setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.invulnerable = false;
        }
      }, 1500);
    }
  };
  
  // Render maze - reads from refs, single rAF loop
  useEffect(() => {
    if (gameScreen !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size ONCE with DPI scaling (prevents flicker and blur on high-DPI displays)
    const logicalWidth = GRID_SIZE * CELL_SIZE;
    const logicalHeight = GRID_SIZE * CELL_SIZE;
    const dpr = window.devicePixelRatio || 1;
    
    if (canvas.width !== logicalWidth * dpr || canvas.height !== logicalHeight * dpr) {
      canvas.width = logicalWidth * dpr;
      canvas.height = logicalHeight * dpr;
      canvas.style.width = logicalWidth + 'px';
      canvas.style.height = logicalHeight + 'px';
      ctx.scale(dpr, dpr);
    }

    let animId: number;
    const render = () => {
      // Read from refs into local variables
      const currentPlayer = playerRef.current;
      const currentGhosts = ghostsRef.current;
      const currentPellets = pelletsRef.current;
      const currentEmailCheckpoints = emailCheckpointsRef.current;
      const currentShieldPowerUps = shieldPowerUpsRef.current;
      const currentGameState = gameStateRef.current;
      const currentRedFlash = redFlashRef.current;

      // Clear canvas (use logical dimensions since ctx.scale handles DPI)
      ctx.fillStyle = '#0A0E1A';
      ctx.fillRect(0, 0, logicalWidth, logicalHeight);

      // Draw maze
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          if (maze[y][x] === 1) {
            ctx.fillStyle = '#0D1117';
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            ctx.strokeStyle = '#00FF88';
            ctx.lineWidth = 2;
            ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }
        }
      }

      // Draw pellets (small green dots)
      currentPellets.forEach(pellet => {
        if (!pellet.collected) {
          ctx.fillStyle = '#00FF88';
          ctx.beginPath();
          ctx.arc(
            pellet.x * CELL_SIZE + CELL_SIZE / 2,
            pellet.y * CELL_SIZE + CELL_SIZE / 2,
            3,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      });

      // Draw email checkpoints (green envelope icons)
      currentEmailCheckpoints.forEach(checkpoint => {
        if (!checkpoint.collected) {
          ctx.save();
          ctx.shadowColor = '#00FF88';
          ctx.shadowBlur = 18;
          const fontSize = Math.round(CELL_SIZE * 0.85);
          ctx.font = `${fontSize}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const centerX = checkpoint.x * CELL_SIZE + CELL_SIZE / 2;
          const centerY = checkpoint.y * CELL_SIZE + CELL_SIZE / 2;
          ctx.fillText('\u{1F4E7}', centerX, centerY);
          ctx.restore();
        }
      });

      // Draw shield power-ups (blue shield crest with checkmark)
      currentShieldPowerUps.forEach(powerUp => {
        if (!powerUp.collected) {
          const centerX = powerUp.x * CELL_SIZE + CELL_SIZE / 2;
          const centerY = powerUp.y * CELL_SIZE + CELL_SIZE / 2;
          const size = 12;

          ctx.fillStyle = '#00D4FF';
          ctx.shadowColor = '#00D4FF';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - size);
          ctx.quadraticCurveTo(centerX + size, centerY - size/2, centerX + size, centerY + size/3);
          ctx.lineTo(centerX, centerY + size);
          ctx.lineTo(centerX - size, centerY + size/3);
          ctx.quadraticCurveTo(centerX - size, centerY - size/2, centerX, centerY - size);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = 'white';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.moveTo(centerX - size/2, centerY);
          ctx.lineTo(centerX - size/4, centerY + size/3);
          ctx.lineTo(centerX + size/2, centerY - size/3);
          ctx.stroke();

          ctx.shadowBlur = 0;
        }
      });

      // Draw ghosts (classic arcade ghost shape)
      currentGhosts.forEach(ghost => {
        const ghostColors = {
          'phisher': '#FF0000',
          'spammer': '#FF8C00',
          'hacker': '#FFD700',
          'scammer': '#FF00FF'
        };

        const centerX = ghost.x * CELL_SIZE + CELL_SIZE / 2;
        const centerY = ghost.y * CELL_SIZE + CELL_SIZE / 2;
        const radius = CELL_SIZE / 3;

        ctx.fillStyle = ghostColors[ghost.type];
        ctx.shadowColor = ghostColors[ghost.type];
        ctx.shadowBlur = 20;

        ctx.beginPath();
        ctx.arc(centerX, centerY - radius/3, radius, Math.PI, 0, false);

        const tentacleWidth = radius * 2 / 3;
        ctx.quadraticCurveTo(
          centerX - radius + tentacleWidth/2,
          centerY + radius - 3,
          centerX - radius + tentacleWidth,
          centerY + radius/3
        );
        ctx.quadraticCurveTo(
          centerX - tentacleWidth/2,
          centerY + radius - 3,
          centerX,
          centerY + radius/3
        );
        ctx.quadraticCurveTo(
          centerX + tentacleWidth/2,
          centerY + radius - 3,
          centerX + radius,
          centerY + radius/3
        );

        ctx.closePath();
        ctx.fill();

        // Draw eyes
        ctx.shadowBlur = 0;
        const eyeRadius = radius / 5;
        const eyeOffsetX = radius / 3;
        const eyeOffsetY = -radius / 3;

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(centerX - eyeOffsetX, centerY + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(centerX + eyeOffsetX, centerY + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        const pupilRadius = eyeRadius / 2;
        ctx.beginPath();
        ctx.arc(centerX - eyeOffsetX, centerY + eyeOffsetY, pupilRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + eyeOffsetX, centerY + eyeOffsetY, pupilRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw player (yellow Pac-Man with animated mouth) - blink when invulnerable
      if (!currentPlayer.invulnerable || Math.floor(Date.now() / 100) % 2 === 0) {
        const centerX = currentPlayer.x * CELL_SIZE + CELL_SIZE / 2;
        const centerY = currentPlayer.y * CELL_SIZE + CELL_SIZE / 2;
        const radius = CELL_SIZE / 2.5;

        const mouthOpen = Math.abs(Math.sin(Date.now() / 100)) * 0.4;

        let startAngle = 0;
        let endAngle = Math.PI * 2;

        if (currentPlayer.direction === 'right') {
          startAngle = mouthOpen;
          endAngle = Math.PI * 2 - mouthOpen;
        } else if (currentPlayer.direction === 'left') {
          startAngle = Math.PI + mouthOpen;
          endAngle = Math.PI - mouthOpen;
        } else if (currentPlayer.direction === 'up') {
          startAngle = -Math.PI / 2 + mouthOpen;
          endAngle = -Math.PI / 2 - mouthOpen + Math.PI * 2;
        } else if (currentPlayer.direction === 'down') {
          startAngle = Math.PI / 2 + mouthOpen;
          endAngle = Math.PI / 2 - mouthOpen + Math.PI * 2;
        }

        ctx.fillStyle = '#FFD700';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = currentGameState.invulnerable ? 30 : 25;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.lineTo(centerX, centerY);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw floating score texts
      floatingTextsRef.current.forEach((floatText, index) => {
        const posX = floatText.x * CELL_SIZE + CELL_SIZE / 2;
        const posY = floatText.y * CELL_SIZE + CELL_SIZE / 2 - floatText.timer * 0.5;
        
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = `rgba(0, 255, 136, ${floatText.opacity})`;
        ctx.textAlign = 'center';
        ctx.fillText(floatText.text, posX, posY);
        
        // Update animation
        floatText.timer += 1;
        floatText.opacity -= 0.03;
      });
      
      // Remove finished floating texts
      floatingTextsRef.current = floatingTextsRef.current.filter(ft => ft.opacity > 0);

      // Red flash overlay for life loss (replaces toast) - use logical dimensions
      if (redFlashRef.current > 0) {
        ctx.fillStyle = `rgba(255, 51, 102, ${redFlashRef.current * 0.35})`;
        ctx.fillRect(0, 0, logicalWidth, logicalHeight);
        redFlashRef.current -= 0.04;
        if (redFlashRef.current < 0) redFlashRef.current = 0;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    animationFrameRef.current = animId;
    
    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [gameScreen]);

  // Handle email answer
  const handleEmailAnswer = (answer: string) => {
    if (!currentEmail) return;

    const correct = (answer === 'phishing') === currentEmail.isPhishing;

    const updatedState = {
      ...gameStateRef.current,
      emailsAnswered: gameStateRef.current.emailsAnswered + 1,
      emailsCorrect: correct ? gameStateRef.current.emailsCorrect + 1 : gameStateRef.current.emailsCorrect,
      cyberIQ: correct ? gameStateRef.current.cyberIQ + 100 : gameStateRef.current.cyberIQ
    };

    if (correct) {
      // ONE setState instead of TWO
      savedFeedbackPlayerPosRef.current = { x: playerRef.current.x, y: playerRef.current.y };
      setUiState(prev => ({
        ...prev,
        feedback: {
          show: true,
          correct: true,
          message: currentEmail.explanation
        },
        gameState: {
          ...updatedState,
          invulnerable: true,
          invulnerableTimer: 160
        }
      }));
      updatedState.invulnerable = true;
      updatedState.invulnerableTimer = 160;
    } else {
      // ONE setState instead of TWO + red flash ref instead of toast
      savedFeedbackPlayerPosRef.current = { x: playerRef.current.x, y: playerRef.current.y };
      setUiState(prev => ({
        ...prev,
        feedback: {
          show: true,
          correct: false,
          message: currentEmail.explanation
        },
        gameState: {
          ...updatedState,
          lives: updatedState.lives - 1
        }
      }));
      updatedState.lives = updatedState.lives - 1;
      if (updatedState.lives <= 0) {
        setTimeout(() => setUiState(prev => ({ ...prev, screen: 'game-over' })), 2730);
      }
      redFlashRef.current = 1.0;
    }

    gameStateRef.current = updatedState;

    setTimeout(() => {
      if (updatedState.emailsAnswered >= updatedState.totalEmails) {
        submitScore();
        // Queue completion event - ONE setState instead of FOUR
        setTimeout(() => setUiState(prev => ({ ...prev, screen: 'results', currentEmail: null, feedback: null })), 100);
      } else {
        // Clear event queue before returning to playing - ONE setState instead of FOUR
        eventQueueRef.current = [];
        gamePausedRef.current = false;
        setUiState(prev => ({ ...prev, screen: 'playing', currentEmail: null, feedback: null }));
        if (savedFeedbackPlayerPosRef.current) {
          playerRef.current = { ...playerRef.current, x: savedFeedbackPlayerPosRef.current.x, y: savedFeedbackPlayerPosRef.current.y, nextDirection: null };
          savedFeedbackPlayerPosRef.current = null;
        }
      }
    }, 2730);
  };
  // Submit score
  const submitScore = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ca4695ac/submit-score`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gameType: 'phishing',
            score: gameState.cyberIQ,
            timeTaken: 0,
          }),
        }
      );

      if (response.ok) {
        toast.success(`Game completed! Cyber IQ: ${gameState.cyberIQ}`);
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };

  // INTRO SCREEN - SIMPLIFIED
  if (gameScreen === 'intro') {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0A0E1A' }}>
        <div className="fixed inset-0 grid-background" style={{ zIndex: 0 }} />

        <div className="relative z-10">
          <nav className="border-b backdrop-blur-md" style={{ borderColor: 'rgba(0, 255, 136, 0.2)', backgroundColor: 'rgba(10, 14, 26, 0.9)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link to="/challenge-dashboard" className="flex items-center gap-3 text-white transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.color = '#00FF88'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>
                  <Shield className="size-8" style={{ color: '#00FF88' }} />
                  <h1 className="text-xl font-bold">INBOX MAZE</h1>
                </Link>
              </div>
            </div>
          </nav>

          <div className="max-w-4xl mx-auto px-4 py-16">
            {/* ZONE 1 Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-4 py-2 rounded" style={{ 
                backgroundColor: 'rgba(0, 255, 136, 0.15)',
                border: '2px solid #00FF88',
                color: '#00FF88'
              }}>
                <span className="font-bold text-sm" style={{ letterSpacing: '0.1em' }}>ZONE 1</span>
              </div>
            </div>

            <Card className="card-slide-in border-2 p-12" style={{ 
              backgroundColor: '#0D1117', 
              borderColor: 'rgba(0, 255, 136, 0.4)',
              boxShadow: '0 0 30px rgba(0, 255, 136, 0.2)'
            }}>
              <div className="text-center mb-8">
                <h2 className="text-5xl font-bold text-white mb-4">
                  INBOX MAZE: Phish Patrol
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  Navigate the maze, review <strong style={{ color: '#00FF88' }}>5 emails</strong>, and decide which are safe or phishing before you lose your <strong style={{ color: '#00FF88' }}>3 lives</strong>.
                </p>
              </div>

              {/* Simple Instructions - 3 Icons */}
              <div className="grid grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
                <div className="text-center p-6 rounded-lg border" style={{ 
                  backgroundColor: 'rgba(0, 255, 136, 0.05)',
                  borderColor: 'rgba(0, 255, 136, 0.2)'
                }}>
                  <Gamepad2 className="size-12 mx-auto mb-3" style={{ color: '#00FF88' }} />
                  <div className="font-bold text-white mb-1">Move</div>
                  <div className="text-sm text-gray-400">WASD or Arrow Keys</div>
                </div>

                <div className="text-center p-6 rounded-lg border" style={{ 
                  backgroundColor: 'rgba(0, 255, 136, 0.05)',
                  borderColor: 'rgba(0, 255, 136, 0.2)'
                }}>
                  <Mail className="size-12 mx-auto mb-3" style={{ color: '#00FF88' }} />
                  <div className="font-bold text-white mb-1">Check Emails</div>
                  <div className="text-sm text-gray-400">Review 5 messages</div>
                </div>

                <div className="text-center p-6 rounded-lg border" style={{ 
                  backgroundColor: 'rgba(0, 255, 136, 0.05)',
                  borderColor: 'rgba(0, 255, 136, 0.2)'
                }}>
                  <Shield className="size-12 mx-auto mb-3" style={{ color: '#00FF88' }} />
                  <div className="font-bold text-white mb-1">Keep Your Lives</div>
                  <div className="text-sm text-gray-400">You have 3 chances</div>
                </div>
              </div>

              <Button 
                onClick={startGame}
                className="w-full h-16 text-xl font-bold hover-glow"
                style={{ backgroundColor: '#00FF88', color: '#0A0E1A' }}
              >
                Start Game
              </Button>
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
            0% { background-position: 0 0; }
            100% { background-position: 50px 50px; }
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
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
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
      <div ref={gameContainerRef} tabIndex={0} className="min-h-screen relative overflow-hidden" style={{ backgroundColor: redFlash ? '#2A0E1A' : '#0A0E1A', outline: 'none' }}>
        {/* Grid background removed during gameplay to reduce GPU compositing overhead */}

        <div className="relative z-10">
          {/* SIMPLIFIED HUD - Only 3 things */}
          <div className="border-b backdrop-blur-md" style={{ borderColor: 'rgba(0, 255, 136, 0.2)', backgroundColor: 'rgba(10, 14, 26, 0.9)' }}>
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex justify-between items-center">
                {/* Cyber IQ (left) */}
                <div className="px-4 py-2 rounded border-2" style={{ 
                  backgroundColor: '#0D1117',
                  borderColor: 'rgba(0, 255, 136, 0.4)',
                  color: '#00FF88'
                }}>
                  <span className="font-bold">CYBER IQ: {gameState.cyberIQ}</span>
                </div>

                {/* Email Progress (center) */}
                <div className="px-4 py-2 rounded border-2" style={{ 
                  backgroundColor: '#0D1117',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'white'
                }}>
                  <span className="font-bold">EMAILS: {gameState.emailsAnswered}/5</span>
                </div>

                {/* Lives (right) - 3 shield icons */}
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <Shield 
                      key={i} 
                      className="size-7" 
                      style={{ color: i < gameState.lives ? '#00FF88' : '#333' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Maze */}
          <div className="flex justify-center items-center py-8">
            <canvas 
              ref={canvasRef}
              className="border-4 rounded"
              style={{ borderColor: '#00FF88', boxShadow: '0 0 30px rgba(0, 255, 136, 0.3)' }}
            />
          </div>

          {/* Controls hint */}
          <div className="text-center text-gray-400 text-sm">
            Use Arrow Keys or WASD to move ÔøΩ Collect green email envelopes ÔøΩ Avoid ghosts
          </div>
        </div>

        {/* BUG 4: Shield Overlay */}
        {shieldOverlay?.show && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
            <div className="max-w-2xl mx-4 p-12 text-center animate-bounce-in" style={{
              backgroundColor: '#0D1117',
              border: '3px solid #00FF88',
              borderRadius: '12px',
              boxShadow: '0 0 60px rgba(0, 255, 136, 0.6)'
            }}>
              <Shield className="size-24 mx-auto mb-6" style={{ color: '#00FF88' }} />
              <h2 className="text-5xl font-bold mb-6" style={{ color: '#00FF88' }}>
                SHIELD ACTIVATED!
              </h2>
              <p className="text-2xl text-white font-semibold mb-4">
                8 Seconds of Protection
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                ? {shieldOverlay.message}
              </p>
            </div>
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
            0% { background-position: 0 0; }
            100% { background-position: 50px 50px; }
          }

          .animate-bounce-in {
            animation: bounceIn 0.5s ease-out;
          }

          @keyframes bounceIn {
            0% {
              transform: scale(0.5);
              opacity: 0;
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  // EMAIL REVIEW OVERLAY - NO RED FLAGS SHOWN
  if (gameScreen === 'email-review' && currentEmail) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'rgba(10, 14, 26, 0.95)' }}>
        <div className="max-w-3xl w-full mx-4">
          {!reviewFeedback || !reviewFeedback.show ? (
            <Card className="card-slide-in border-2 p-8" style={{ 
              backgroundColor: '#0D1117', 
              borderColor: 'rgba(0, 255, 136, 0.6)',
              boxShadow: '0 0 40px rgba(0, 255, 136, 0.3)'
            }}>
              <div className="flex items-center gap-3 mb-6">
                <Mail className="size-8" style={{ color: '#00FF88' }} />
                <h2 className="text-2xl font-bold text-white">Email Review</h2>
              </div>

              {/* Email Content */}
              <div className="space-y-4 mb-6">
                <div className="p-4 rounded border" style={{ backgroundColor: '#0A0E1A', borderColor: 'rgba(0, 255, 136, 0.2)' }}>
                  <div className="text-sm text-gray-400 mb-1">From:</div>
                  <div className="font-mono text-white">{currentEmail.from}</div>
                </div>

                <div className="p-4 rounded border" style={{ backgroundColor: '#0A0E1A', borderColor: 'rgba(0, 255, 136, 0.2)' }}>
                  <div className="text-sm text-gray-400 mb-1">Subject:</div>
                  <div className="font-semibold text-white">{currentEmail.subject}</div>
                </div>

                <div className="p-4 rounded border" style={{ backgroundColor: '#0A0E1A', borderColor: 'rgba(0, 255, 136, 0.2)' }}>
                  <div className="text-sm text-gray-400 mb-2">Message:</div>
                  <div className="text-gray-300 leading-relaxed">{currentEmail.body}</div>
                </div>
              </div>

              {/* Question - ONE CONSISTENT QUESTION */}
              <div className="text-lg font-semibold text-white mb-4 text-center">
                Is this email safe or a phishing attempt?
              </div>

              {/* 2 Answer Options */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleEmailAnswer('phishing')}
                  className="h-auto py-4 px-4 text-center hover-glow"
                  style={{ 
                    backgroundColor: '#0D1117',
                    color: 'white',
                    border: '2px solid rgba(0, 255, 136, 0.3)'
                  }}
                >
                  🎣 It's Phishing!
                </Button>
                <Button
                  onClick={() => handleEmailAnswer('safe')}
                  className="h-auto py-4 px-4 text-center hover-glow"
                  style={{ 
                    backgroundColor: '#0D1117',
                    color: 'white',
                    border: '2px solid rgba(0, 255, 136, 0.3)'
                  }}
                >
                  ✅ It's Safe
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="card-slide-in border-2 p-8 text-center" style={{ 
              backgroundColor: '#0D1117', 
              borderColor: reviewFeedback?.correct ? 'rgba(0, 255, 136, 0.6)' : 'rgba(255, 51, 102, 0.6)',
              boxShadow: reviewFeedback?.correct ? '0 0 40px rgba(0, 255, 136, 0.5)' : '0 0 40px rgba(255, 51, 102, 0.5)'
            }}>
              {reviewFeedback?.correct ? (
                <>
                  <CheckCircle className="size-20 mx-auto mb-4" style={{ color: '#00FF88' }} />
                  <h3 className="text-3xl font-bold text-white mb-4">Correct! +100 Cyber IQ</h3>
                </>
              ) : (
                <>
                  <XCircle className="size-20 mx-auto mb-4" style={{ color: '#FF3366' }} />
                  <h3 className="text-3xl font-bold text-white mb-4">Wrong! -1 Life</h3>
                </>
              )}
              <p className="text-lg text-gray-300 leading-relaxed">
                {reviewFeedback?.message}
              </p>
              {reviewFeedback?.correct && (
                <div className="mt-4 text-sm" style={{ color: '#00FF88' }}>
                  ? 8 seconds of shield protection activated
                </div>
              )}
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
            border-color: rgba(0, 255, 136, 0.8) !important;
            background-color: rgba(0, 255, 136, 0.05) !important;
            transform: translateY(-2px);
            transition: all 0.2s ease;
          }
        `}</style>
      </div>
    );
  }

  // RESULTS SCREEN - WIN
  if (gameScreen === 'results') {
    const isPerfect = gameState.emailsCorrect === 5;
    const isGood = gameState.emailsCorrect >= 3;
    
    // Tiered messages
    let TierIcon;
    let tierMessage;
    let tierColor;
    
    if (isPerfect) {
      TierIcon = Trophy;
      tierMessage = 'Perfect Cyber IQ Run!';
      tierColor = '#00FF88';
    } else if (isGood) {
      TierIcon = Shield;
      tierMessage = 'Mission Complete';
      tierColor = '#00FF88';
    } else {
      TierIcon = ArrowUp;
      tierMessage = 'Room to Improve';
      tierColor = '#FF3366';
    }

    return (
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0A0E1A' }}>
        <div className="fixed inset-0 grid-background" style={{ zIndex: 0 }} />

        <div className="relative z-10">
          <nav className="border-b backdrop-blur-md" style={{ borderColor: 'rgba(0, 255, 136, 0.2)', backgroundColor: 'rgba(10, 14, 26, 0.9)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link to="/challenge-dashboard" className="flex items-center gap-3 text-white transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.color = '#00FF88'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>
                  <Shield className="size-8" style={{ color: '#00FF88' }} />
                  <h1 className="text-xl font-bold">INBOX MAZE</h1>
                </Link>
              </div>
            </div>
          </nav>

          <div className="max-w-4xl mx-auto px-4 py-12">
            <Card className="card-slide-in border-2 p-12" style={{ 
              backgroundColor: '#0D1117', 
              borderColor: 'rgba(0, 255, 136, 0.4)',
              boxShadow: '0 0 40px rgba(0, 255, 136, 0.3)'
            }}>
              <div className="text-center mb-8">
                <TierIcon className="size-24 mx-auto mb-6" style={{ color: tierColor }} />
                <h2 className="text-5xl font-bold text-white mb-4">{tierMessage}</h2>
                
                <div className="mb-6">
                  <div className="inline-flex items-center px-6 py-3 rounded-lg" style={{ 
                    backgroundColor: `rgba(${tierColor === '#00FF88' ? '0, 255, 136' : '255, 51, 102'}, 0.2)`,
                    border: `2px solid ${tierColor}`,
                    color: tierColor
                  }}>
                    <TierIcon className="size-6 mr-2" />
                    <span className="font-bold text-lg">{tierMessage.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="rounded-lg p-8 mb-8 border-2" style={{ 
                backgroundColor: '#0A0E1A',
                borderColor: 'rgba(0, 255, 136, 0.4)'
              }}>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Final Cyber IQ</div>
                    <div className="text-5xl font-bold" style={{ color: '#00FF88' }}>
                      {gameState.cyberIQ}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Emails Correct</div>
                    <div className="text-5xl font-bold text-white">
                      {gameState.emailsCorrect}/5
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Lives Remaining</div>
                    <div className="flex justify-center gap-2 mt-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Shield
                          key={i}
                          className="size-8"
                          style={{
                            color: i < gameState.lives ? '#00FF88' : '#374151',
                            fill: i < gameState.lives ? '#00FF88' : 'none'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    resetGame();
                    setUiState(prev => ({ ...prev, screen: 'playing' }));
                  }}
                  className="flex-1 h-14 text-lg hover-glow"
                  style={{ backgroundColor: '#00FF88', color: '#0A0E1A' }}
                >
                  Play Again
                </Button>
                <Link to="/challenge-dashboard" className="flex-1">
                  <Button
                    className="w-full h-14 text-lg hover-glow"
                    style={{ backgroundColor: '#0D1117', color: '#00FF88', border: '2px solid #00FF88' }}
                  >
                    Back to Hub
                  </Button>
                </Link>
              </div>
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
            0% { background-position: 0 0; }
            100% { background-position: 50px 50px; }
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
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
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
        <div className="fixed inset-0 grid-background" style={{ zIndex: 0, pointerEvents: 'none' }} />
        
        <Card className="max-w-2xl mx-4 border-2 p-12 text-center relative" style={{ 
          backgroundColor: '#0D1117', 
          borderColor: 'rgba(255, 51, 102, 0.6)',
          boxShadow: '0 0 40px rgba(255, 51, 102, 0.3)',
          zIndex: 10
        }}>
          <XCircle className="size-28 mx-auto mb-6" style={{ color: '#FF3366' }} />
          <h2 className="text-6xl font-bold text-white mb-6">GAME OVER</h2>
          
          <div className="mb-8 p-6 rounded-lg border" style={{ 
            backgroundColor: '#0A0E1A',
            borderColor: 'rgba(255, 51, 102, 0.3)'
          }}>
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <div className="text-sm text-gray-400 mb-2">Cyber IQ Achieved</div>
                <div className="text-4xl font-bold" style={{ color: '#00FF88' }}>
                  {gameState.cyberIQ}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Emails Answered</div>
                <div className="text-4xl font-bold text-white">
                  {gameState.emailsAnswered}/5
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4" style={{ position: 'relative', zIndex: 20 }}>
            <Button
              onClick={() => {
                setUiState(prev => ({ ...prev, screen: 'playing' }));
                resetGame();
              }}
              className="flex-1 h-14 text-lg hover-glow"
              style={{ backgroundColor: '#00FF88', color: '#0A0E1A', pointerEvents: 'auto', cursor: 'pointer' }}
            >
              Try Again
            </Button>
            <Link to="/challenge-dashboard" className="flex-1" style={{ pointerEvents: 'auto' }}>
              <Button
                className="w-full h-14 text-lg hover-glow"
                style={{ backgroundColor: '#0D1117', color: '#FF3366', border: '2px solid #FF3366', pointerEvents: 'auto', cursor: 'pointer' }}
              >
                Back to Hub
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