# 🎮 Quick Fix Guide for Other INBOX MAZE Games

## 🎯 Apply These Fixes To:
- TwoFactorGame.tsx
- MalwareGame.tsx  
- DataProtectionGame.tsx

All three games have the SAME critical issue: calling `setGameScreen()` inside their game loops.

---

## 🔧 STEP-BY-STEP FIX INSTRUCTIONS

### STEP 1: Add Event Queue Refs

**Find:** The useRef declarations at top of component  
**Add after existing refs:**

```typescript
// Event queue for screen transitions (prevents setState inside game loop)
const eventQueueRef = useRef<{type: 'scenario-collected' | 'game-over' | 'game-complete' | 'life-lost', data?: any}[]>([]);
const lastToastTimeRef = useRef<number>(0);
```

> **Note:** Change `'scenario-collected'` to match each game:
> - TwoFactorGame: `'scenario-collected'`
> - MalwareGame: `'malware-collected'`
> - DataProtectionGame: `'challenge-collected'`

---

### STEP 2: Fix Scenario/Malware/Challenge Collection

**TwoFactorGame.tsx - Find (around line 467-471):**
```typescript
// BEFORE (BROKEN):
const twoFAScenario = twoFAScenarios[scenario.scenarioId % twoFAScenarios.length];
setCurrentScenario(twoFAScenario);
setGameScreen('scenario-inspection');
```

**Replace with:**
```typescript
// AFTER (FIXED):
const twoFAScenario = twoFAScenarios[scenario.scenarioId % twoFAScenarios.length];
eventQueueRef.current.push({ type: 'scenario-collected', data: twoFAScenario });
```

**MalwareGame.tsx - Find (around line 505-507):**
```typescript
// BEFORE (BROKEN):
const scenario = malwareScenarios[sample.scenarioId % malwareScenarios.length];
setCurrentMalware(scenario);
setGameScreen('malware-inspection');
```

**Replace with:**
```typescript
// AFTER (FIXED):
const scenario = malwareScenarios[sample.scenarioId % malwareScenarios.length];
eventQueueRef.current.push({ type: 'malware-collected', data: scenario });
```

**DataProtectionGame.tsx - Find (around line 486-488):**
```typescript
// BEFORE (BROKEN):
const scenario = dataProtectionScenarios[challenge.scenarioId % dataProtectionScenarios.length];
setCurrentChallenge(scenario);
setGameScreen('data-challenge');
```

**Replace with:**
```typescript
// AFTER (FIXED):
const scenario = dataProtectionScenarios[challenge.scenarioId % dataProtectionScenarios.length];
eventQueueRef.current.push({ type: 'challenge-collected', data: scenario });
```

---

### STEP 3: Fix Ghost Collision (Game Over)

**All 3 Games - Find (around line 503-504 / 539-540 / 520-521):**
```typescript
// BEFORE (BROKEN):
if (newLives <= 0) {
  setGameScreen('game-over');
}
```

**Replace with:**
```typescript
// AFTER (FIXED):
if (newLives <= 0) {
  eventQueueRef.current.push({ type: 'game-over' });
} else {
  eventQueueRef.current.push({ type: 'life-lost' });
}
```

---

### STEP 4: Debounce Toast in Life Loss

**All 3 Games - Find the "else" block after collision:**
```typescript
// BEFORE (MAY SPAM):
} else {
  toast.error('Hit by threat! Life lost.');
}
```

**Replace with:**
```typescript
// AFTER (DEBOUNCED):
} else {
  const now = Date.now();
  if (now - lastToastTimeRef.current > 1000) {
    lastToastTimeRef.current = now;
    toast.error('Hit by threat! Life lost.');
  }
}
```

---

### STEP 5: Debounce Power-Up Toasts

**All 3 Games - Find power-up collection (around line 485-486):**
```typescript
// BEFORE (MAY SPAM):
toast.success(`Power-up activated: ${powerUp.type}`);
```

**Replace with:**
```typescript
// AFTER (DEBOUNCED):
const now = Date.now();
if (now - lastToastTimeRef.current > 1000) {
  lastToastTimeRef.current = now;
  toast.success(`Power-up activated: ${powerUp.type.replace('-', ' ').toUpperCase()}`);
}
```

---

### STEP 6: Add Event Queue Processor

**All 3 Games - Find the game loop useEffect (around line 367-537)**  
**Add this NEW useEffect RIGHT AFTER the game loop useEffect:**

**TwoFactorGame.tsx:**
```typescript
// Event queue processor - handles screen transitions OUTSIDE game loop
useEffect(() => {
  if (gameScreen !== 'playing') return;
  
  const processEvents = () => {
    const event = eventQueueRef.current.shift();
    if (event) {
      if (event.type === 'scenario-collected') {
        setCurrentScenario(event.data);
        setGameScreen('scenario-inspection');
      } else if (event.type === 'game-over') {
        setGameScreen('game-over');
      } else if (event.type === 'life-lost') {
        // Toast already shown in game loop (debounced)
      }
    }
  };
  
  const eventInterval = setInterval(processEvents, 100);
  return () => clearInterval(eventInterval);
}, [gameScreen]);
```

**MalwareGame.tsx:**
```typescript
// Event queue processor - handles screen transitions OUTSIDE game loop
useEffect(() => {
  if (gameScreen !== 'playing') return;
  
  const processEvents = () => {
    const event = eventQueueRef.current.shift();
    if (event) {
      if (event.type === 'malware-collected') {
        setCurrentMalware(event.data);
        setGameScreen('malware-inspection');
      } else if (event.type === 'game-over') {
        setGameScreen('game-over');
      } else if (event.type === 'life-lost') {
        // Toast already shown in game loop (debounced)
      }
    }
  };
  
  const eventInterval = setInterval(processEvents, 100);
  return () => clearInterval(eventInterval);
}, [gameScreen]);
```

**DataProtectionGame.tsx:**
```typescript
// Event queue processor - handles screen transitions OUTSIDE game loop
useEffect(() => {
  if (gameScreen !== 'playing') return;
  
  const processEvents = () => {
    const event = eventQueueRef.current.shift();
    if (event) {
      if (event.type === 'challenge-collected') {
        setCurrentChallenge(event.data);
        setGameScreen('data-challenge');
      } else if (event.type === 'game-over') {
        setGameScreen('game-over');
      } else if (event.type === 'life-lost') {
        // Toast already shown in game loop (debounced)
      }
    }
  };
  
  const eventInterval = setInterval(processEvents, 100);
  return () => clearInterval(eventInterval);
}, [gameScreen]);
```

---

### STEP 7: Clear Event Queue on Resume

**All 3 Games - Find the answer handler (handleAnswer/handleMalwareAction/handleDataAction)**  
**Find where it returns to playing screen:**

```typescript
// BEFORE:
} else {
  setGameScreen('playing');
}
```

**Replace with:**
```typescript
// AFTER:
} else {
  eventQueueRef.current = []; // Clear stale events
  setGameScreen('playing');
}
```

---

### STEP 8: Optimize Canvas Dimension Setting

**All 3 Games - Find the render useEffect (around line 540-600)**  
**Find these lines:**

```typescript
// BEFORE (INEFFICIENT):
canvas.width = GRID_SIZE * CELL_SIZE;
canvas.height = GRID_SIZE * CELL_SIZE;
```

**Replace with:**
```typescript
// AFTER (OPTIMIZED):
if (canvas.width !== GRID_SIZE * CELL_SIZE || canvas.height !== GRID_SIZE * CELL_SIZE) {
  canvas.width = GRID_SIZE * CELL_SIZE;
  canvas.height = GRID_SIZE * CELL_SIZE;
}
```

---

## ✅ VERIFICATION CHECKLIST

After applying fixes to each game, verify:

### TwoFactorGame:
- [ ] No freeze when collecting 2FA scenarios
- [ ] No freeze on ghost collision
- [ ] Toasts don't spam
- [ ] Smooth transitions to/from scenario inspection
- [ ] Game over triggers correctly
- [ ] Results screen shows after completing all scenarios

### MalwareGame:
- [ ] No freeze when collecting malware samples
- [ ] No freeze on ghost collision
- [ ] Toasts don't spam
- [ ] Smooth transitions to/from malware inspection
- [ ] Game over triggers correctly
- [ ] Results screen shows after completing all samples

### DataProtectionGame:
- [ ] No freeze when collecting data challenges
- [ ] No freeze on ghost collision
- [ ] Toasts don't spam
- [ ] Smooth transitions to/from data challenge screen
- [ ] Game over triggers correctly
- [ ] Results screen shows after completing all challenges

---

## 🧪 TESTING PROCEDURE

For each game:

1. **Start the game**
2. **Collect first scenario/malware/challenge**
   - Should smoothly transition to inspection screen
   - No freeze or lag
3. **Answer the challenge**
   - Should smoothly return to game
4. **Collect power-up**
   - Toast should appear once
   - No lag
5. **Hit ghost** 
   - Should lose life without freeze
   - Toast should appear (debounced)
6. **Collect all items**
   - Should smoothly go to results
7. **Check DevTools console**
   - No React warnings
   - No setState errors

---

## 📊 EXPECTED PERFORMANCE

### Before Fixes:
- ❌ Freezes on item collection
- ❌ Freezes on collision
- ❌ Toast spam
- ❌ Jittery gameplay

### After Fixes:
- ✅ Smooth 60 FPS
- ✅ No freezing
- ✅ Debounced toasts
- ✅ Professional game feel

---

## 🚀 ESTIMATED TIME PER GAME

- **TwoFactorGame:** ~15 minutes
- **MalwareGame:** ~15 minutes
- **DataProtectionGame:** ~15 minutes

**Total:** ~45 minutes to fix all three games

---

## 💡 KEY POINTS TO REMEMBER

1. **Never setState inside requestAnimationFrame loop**
2. **Use event queue to defer state updates**
3. **Debounce all UI notifications**
4. **Set canvas dimensions ONCE, not per frame**
5. **Clear event queue when resuming gameplay**

---

## 🎯 FINAL RESULT

After applying these fixes to all 4 games:

✅ **All INBOX MAZE games will run at smooth 60 FPS**  
✅ **No freezing issues**  
✅ **Professional arcade-quality gameplay**  
✅ **Ready for South African SME deployment**

---

*Quick Fix Guide created: March 15, 2026*  
*Pattern tested and verified in PhishingGame.tsx*  
*Apply same pattern to remaining 3 games*
