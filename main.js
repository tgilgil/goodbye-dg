let score = 0;
let autoClickersCount = 0;
let autoClickerCost = 10;
let currentX = 0;
let currentY = 0;
let targetX = 0;
let targetY = 0;
let speed = 0.02; // Base speed for constant movement

const scoreElement = document.getElementById('score');
const autoClickersElement = document.getElementById('auto-clickers');
const david = document.getElementById('david-target');
const playArea = document.getElementById('play-area');
const buyAutoClickerBtn = document.getElementById('buy-auto-clicker');
const buyMissileLauncherBtn = document.getElementById('buy-missile-launcher');
const buyGuitarBtn = document.getElementById('buy-guitar');
const upgradeMissileRateBtn = document.getElementById('upgrade-missile-rate');
const upgradeMissileRateDesc = document.getElementById('upgrade-missile-rate-desc');
const upgradeGuitarRateBtn = document.getElementById('upgrade-guitar-rate');
const upgradeGuitarRateDesc = document.getElementById('upgrade-guitar-rate-desc');
const buyPRBtn = document.getElementById('buy-pull-request');
const kissIndicator = document.getElementById('kiss-indicator');

let missileLaunchersCount = 0;
let missileLauncherCost = 50;
let missileFireRateLevel = 1;
let missileFireRateCost = 200;

let guitarsCount = 0;
let guitarCost = 100;
let guitarFireRateLevel = 1;
let guitarFireRateCost = 250;

let pullRequestsCount = 0;
let pullRequestCost = 150;
const activePRs = []; // Store PR positions for slowing logic

const launcherIntervals = []; // Store intervals to clear and recreate with new rate
const blush = document.getElementById('blush');

// Cosmetic logic
const cosmetics = {
  tophat: { icon: '🎩', type: 'hat' },
  viking: { icon: '🪖', type: 'hat' },
  shades: { icon: '🕶️', type: 'glasses' },
  sparkles: { icon: '✨', type: 'aura' },
  arcade: { icon: '🕹️', type: 'ui' },
  minecraft: { icon: '🧱', type: 'ui' }
};

const ownedCosmetics = new Set();
const activeCosmetics = { hat: null, glasses: null, aura: null, ui: null };

function applyCosmetic(name) {
  const meta = cosmetics[name];
  if (!meta) return;

  if (meta.type === 'ui') {
    if (activeCosmetics[meta.type] === name) {
      // Unequip if already active
      document.body.classList.remove('arcade-mode');
      document.body.classList.remove('minecraft-mode');
      activeCosmetics[meta.type] = null;
    } else {
      // Equip new
      document.body.classList.remove('arcade-mode');
      document.body.classList.remove('minecraft-mode');
      
      if (name === 'arcade') {
        document.body.classList.add('arcade-mode');
      } else if (name === 'minecraft') {
        document.body.classList.add('minecraft-mode');
      }
      activeCosmetics[meta.type] = name;
    }
    updateUI();
    return;
  }

  // Remove existing of same type
  const oldElement = document.getElementById(`cosmetic-${meta.type}`);
  if (oldElement) oldElement.remove();

  if (activeCosmetics[meta.type] === name) {
    // If we just clicked the already active one, leave it removed (unequip)
    activeCosmetics[meta.type] = null;
  } else {
    // Create new (equip)
    const el = document.createElement('div');
    el.id = `cosmetic-${meta.type}`;
    el.className = `david-cosmetic cosmetic-${meta.type} active`;
    el.textContent = meta.icon;
    david.querySelector('.david-body').appendChild(el);
    activeCosmetics[meta.type] = name;
  }
  updateUI();
}

document.querySelectorAll('.cosmetic-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.name;
    const cost = parseInt(btn.dataset.cost);
    
    if (score >= cost && !ownedCosmetics.has(name)) {
      score -= cost;
      ownedCosmetics.add(name);
      btn.classList.add('owned');
      applyCosmetic(name);
      updateUI();
    } else if (ownedCosmetics.has(name)) {
      applyCosmetic(name);
    }
  });
});

// Initialize positions
function initPositions() {
  const areaWidth = playArea.clientWidth || window.innerWidth;
  const areaHeight = playArea.clientHeight || window.innerHeight;
  currentX = areaWidth / 2;
  currentY = areaHeight / 2;
  setRandomTarget();
}

function setRandomTarget() {
  const areaWidth = playArea.clientWidth || window.innerWidth;
  const areaHeight = playArea.clientHeight || window.innerHeight;
  
  targetX = Math.random() * (areaWidth - 150) + 50;
  targetY = Math.random() * (areaHeight - 200) + 50;
  
  if (Math.random() > 0.8) {
    speed = 0.15;
  } else {
    speed = 0.03;
  }
}

function updatePosition() {
  let currentSpeed = speed;
  
  // Check if David is in any PR radius
  let slowed = false;
  activePRs.forEach(pr => {
    const dx = pr.x - currentX;
    const dy = pr.y - currentY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < pr.radius) {
      slowed = true;
    }
  });

  if (slowed) {
    currentSpeed *= 0.3; // Slow David down by 70%
    david.style.filter = 'grayscale(0.5)'; // Visual indicator of being slowed
  } else {
    david.style.filter = 'none';
  }

  currentX += (targetX - currentX) * currentSpeed;
  currentY += (targetY - currentY) * currentSpeed;
  
  david.style.left = '0px';
  david.style.top = '0px';
  david.style.transform = `translate(${currentX}px, ${currentY}px)`;
  
  const dist = Math.sqrt(Math.pow(targetX - currentX, 2) + Math.pow(targetY - currentY, 2));
  if (dist < 10) {
    setRandomTarget();
  }
  
  requestAnimationFrame(updatePosition);
}

// Start movement
initPositions();
requestAnimationFrame(updatePosition);

// Interaction
david.addEventListener('mousedown', (e) => {
  addBisou();
  showGiggle();
  // We don't call setRandomTarget() here anymore to avoid the "teleport" feel
  // and instead just let him continue his current path, 
  // or we could just increase the speed to the CURRENT target.
  speed = 0.15; // Speed up towards the current target for a "dash" effect
  e.stopPropagation();
});

function addBisou() {
  score++;
  updateUI();
  
  // Visual feedback for kiss
  kissIndicator.style.opacity = '1';
  kissIndicator.style.transform = 'translateY(-20px)';
  
  setTimeout(() => {
    kissIndicator.style.opacity = '0';
    kissIndicator.style.transform = 'translateY(0)';
  }, 300);
}

function showGiggle() {
  david.classList.add('giggle');
  blush.style.opacity = '1';
  
  // Fake giggle sound effect using browser Synthesis if needed, 
  // but for now let's just use the visual feedback.
  // console.log("David: *Cute Giggle*");
  
  setTimeout(() => {
    david.classList.remove('giggle');
    blush.style.opacity = '0';
  }, 500);
}

function updateUI() {
  scoreElement.textContent = Math.floor(score);
  autoClickersElement.textContent = autoClickersCount;
  buyAutoClickerBtn.disabled = score < autoClickerCost;
  buyAutoClickerBtn.innerHTML = `Auto-Bec (${autoClickerCost} 💋)`;

  buyMissileLauncherBtn.disabled = score < missileLauncherCost;
  buyMissileLauncherBtn.innerHTML = `Lance-missiles (${missileLauncherCost} 💋)`;

  buyGuitarBtn.disabled = score < guitarCost;
  buyGuitarBtn.innerHTML = `Guitare (${guitarCost} 💋)`;

  buyPRBtn.disabled = score < pullRequestCost;
  buyPRBtn.innerHTML = `Pull Request (${pullRequestCost} 💋)`;

  if (missileLaunchersCount > 0) {
    upgradeMissileRateBtn.style.display = 'inline-block';
    upgradeMissileRateDesc.style.display = ''; // Let CSS hover handle it
    upgradeMissileRateBtn.disabled = score < missileFireRateCost;
    upgradeMissileRateBtn.innerHTML = `🔥 Plus vite (${missileFireRateCost} 💋)`;
  } else {
    upgradeMissileRateBtn.style.display = 'none';
    upgradeMissileRateDesc.style.display = 'none';
  }

  if (guitarsCount > 0) {
    upgradeGuitarRateBtn.style.display = 'inline-block';
    upgradeGuitarRateDesc.style.display = ''; // Let CSS hover handle it
    upgradeGuitarRateBtn.disabled = score < guitarFireRateCost;
    upgradeGuitarRateBtn.innerHTML = `🎸 Plus de notes (${guitarFireRateCost} 💋)`;
  } else {
    upgradeGuitarRateBtn.style.display = 'none';
    upgradeGuitarRateDesc.style.display = 'none';
  }

  document.querySelectorAll('.cosmetic-item').forEach(btn => {
    const cost = parseInt(btn.dataset.cost);
    const name = btn.dataset.name;
    const meta = cosmetics[name];
    
    // Find the container for this specific button to handle its specific tooltip
    const container = btn.closest('.shop-item-container');
    const desc = container ? container.querySelector('.shop-item-desc') : null;
    
    if (ownedCosmetics.has(name)) {
      btn.disabled = false;
      btn.classList.add('owned');
      if (activeCosmetics[meta.type] === name) {
        btn.textContent = `Retirer ${meta.icon}`;
        btn.classList.add('equipped');
      } else {
        btn.textContent = `Porter ${meta.icon}`;
        btn.classList.remove('equipped');
      }
    } else {
      btn.disabled = score < cost;
    }
  });
}

// Shop Logic
buyAutoClickerBtn.addEventListener('click', () => {
  if (score >= autoClickerCost) {
    score -= autoClickerCost;
    autoClickersCount++;
    autoClickerCost = Math.floor(autoClickerCost * 1.5);
    updateUI();
    spawnAutoClicker();
  }
});

buyMissileLauncherBtn.addEventListener('click', () => {
  if (score >= missileLauncherCost) {
    score -= missileLauncherCost;
    missileLaunchersCount++;
    missileLauncherCost = Math.floor(missileLauncherCost * 1.5);
    updateUI();
    spawnLauncher('🚀', 'missile');
  }
});

buyGuitarBtn.addEventListener('click', () => {
  if (score >= guitarCost) {
    score -= guitarCost;
    guitarsCount++;
    guitarCost = Math.floor(guitarCost * 1.5);
    updateUI();
    spawnLauncher('🎸', 'guitar');
  }
});

upgradeMissileRateBtn.addEventListener('click', () => {
  if (score >= missileFireRateCost) {
    score -= missileFireRateCost;
    missileFireRateLevel++;
    missileFireRateCost = Math.floor(missileFireRateCost * 2);
    updateUI();
    resetLauncherIntervals('missile');
  }
});

upgradeGuitarRateBtn.addEventListener('click', () => {
  if (score >= guitarFireRateCost) {
    score -= guitarFireRateCost;
    guitarFireRateLevel++;
    guitarFireRateCost = Math.floor(guitarFireRateCost * 2);
    updateUI();
    resetLauncherIntervals('guitar');
  }
});

buyPRBtn.addEventListener('click', () => {
  if (score >= pullRequestCost) {
    score -= pullRequestCost;
    pullRequestsCount++;
    pullRequestCost = Math.floor(pullRequestCost * 1.8);
    updateUI();
    spawnPullRequest();
  }
});

function spawnPullRequest() {
  const prContainer = document.createElement('div');
  prContainer.className = 'pr-wrapper';
  
  const prCard = document.createElement('div');
  prCard.className = 'pull-request-card';
  
  const radiusVisual = document.createElement('div');
  radiusVisual.className = 'pr-radius-visual';
  
  const titles = [
    "Refactoring : Optimiser les bisous",
    "Fix : Bug de téléportation de becs",
    "Feature : Ajouter des cosmétiques l'fun",
    "Docs : Updater la bio secrète à David",
    "Perf : Réduire la latence des giggles",
    "Chore : Ramasser les débris de cœurs",
    "Fix : La physique des cheveux à David",
    "WIP : Mode amour infini"
  ];
  const randomTitle = titles[Math.floor(Math.random() * titles.length)];
  const prNumber = Math.floor(Math.random() * 9999);

  prCard.innerHTML = `
    <div class="pr-icon">⊙</div>
    <div class="pr-content">
      <div class="pr-title">${randomTitle} #${prNumber}</div>
      <div class="pr-meta">david-g/goodbye veut merger dans main</div>
    </div>
  `;

  prContainer.appendChild(radiusVisual);
  prContainer.appendChild(prCard);
  playArea.appendChild(prContainer);

  const x = Math.random() * (playArea.clientWidth - 250) + 25;
  const y = Math.random() * (playArea.clientHeight - 100) + 25;
  prContainer.style.position = 'absolute';
  prContainer.style.left = `${x}px`;
  prContainer.style.top = `${y}px`;

  // Add to tracking for speed reduction
  activePRs.push({ x: x + 100, y: y + 25, radius: 150 });
}

function resetLauncherIntervals(type) {
  launcherIntervals.forEach(item => {
    if (item.type === type) {
      clearInterval(item.id);
      const baseRate = type === 'missile' ? 3000 : 4000;
      const rateLevel = type === 'missile' ? missileFireRateLevel : guitarFireRateLevel;
      const newInterval = Math.max(500, baseRate / rateLevel);
      
      item.id = setInterval(() => {
        if (type === 'missile') {
          shootProjectile(item.x, item.y, '❤️🚀', 'missile');
        } else {
          shootProjectile(item.x, item.y, '🎵', 'note');
        }
      }, newInterval + Math.random() * 1000);
    }
  });
}

function spawnLauncher(icon, type) {
  const launcher = document.createElement('div');
  launcher.className = `powerup-launcher launcher-${type}`;
  // Using the local images provided in the project root
  const img = document.createElement('img');
  img.src = type === 'missile' ? '/missile-launcher.webp' : '/guitar.webp';
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'contain';
  img.onerror = () => { 
    launcher.textContent = icon; 
    launcher.style.fontSize = '2rem'; 
  };
  launcher.appendChild(img);
  playArea.appendChild(launcher);
  
  // Ensure the position is within the visible play area
  const x = Math.random() * (playArea.clientWidth - 150) + 50;
  const y = Math.random() * (playArea.clientHeight - 150) + 50;
  launcher.style.left = `${x}px`;
  launcher.style.top = `${y}px`;
  launcher.style.display = 'block'; // Ensure it's not hidden
  launcher.style.zIndex = '100'; // Make sure it's on top

  const baseRate = type === 'missile' ? 3000 : 4000;
  const rateLevel = type === 'missile' ? missileFireRateLevel : guitarFireRateLevel;
  const intervalTime = Math.max(500, baseRate / rateLevel);

  const intervalId = setInterval(() => {
    if (type === 'missile') {
      shootProjectile(x, y, '❤️🚀', 'missile');
    } else {
      shootProjectile(x, y, '🎵', 'note');
    }
  }, intervalTime + Math.random() * 1000);

  launcherIntervals.push({ id: intervalId, type, x, y });
}

function shootProjectile(startX, startY, icon, type) {
  const projectile = document.createElement('div');
  projectile.className = `projectile ${type === 'missile' ? 'missile' : 'note-wave'}`;
  projectile.textContent = icon;
  playArea.appendChild(projectile);

  let currentPX = startX;
  let currentPY = startY;
  const projectileSpeed = type === 'missile' ? 3 : 2;

  function moveProjectile() {
    const davidRect = david.getBoundingClientRect();
    const areaRect = playArea.getBoundingClientRect();
    const targetX = davidRect.left - areaRect.left + 60;
    const targetY = davidRect.top - areaRect.top + 90;

    const angle = Math.atan2(targetY - currentPY, targetX - currentPX);
    
    currentPX += Math.cos(angle) * projectileSpeed;
    currentPY += Math.sin(angle) * projectileSpeed;

    projectile.style.left = `${currentPX}px`;
    projectile.style.top = `${currentPY}px`;
    
    if (type === 'missile') {
      projectile.style.transform = `rotate(${angle + Math.PI / 4}deg)`;
    }

    const dist = Math.sqrt(Math.pow(targetX - currentPX, 2) + Math.pow(targetY - currentPY, 2));
    if (dist < 30) {
      addBisou();
      if (type === 'missile') showGiggle();
      projectile.remove();
    } else if (currentPX < -50 || currentPX > playArea.clientWidth + 50 || 
               currentPY < -50 || currentPY > playArea.clientHeight + 50) {
      projectile.remove();
    } else {
      requestAnimationFrame(moveProjectile);
    }
  }
  requestAnimationFrame(moveProjectile);
}

// Auto-Clicker System
function spawnAutoClicker() {
  const clicker = document.createElement('div');
  clicker.className = 'auto-kisser';
  clicker.textContent = '😘';
  playArea.appendChild(clicker);
  
  let x = Math.random() * playArea.clientWidth;
  let y = Math.random() * playArea.clientHeight;
  
  function moveClicker() {
    // Move towards David
    const davidRect = david.getBoundingClientRect();
    const areaRect = playArea.getBoundingClientRect();
    
    const targetX = davidRect.left - areaRect.left + 60;
    const targetY = davidRect.top - areaRect.top + 90;
    
    // Smooth glide towards David
    x += (targetX - x) * 0.05;
    y += (targetY - y) * 0.05;
    
    clicker.style.left = `${x}px`;
    clicker.style.top = `${y}px`;
    
    // If close enough, "kiss"
    const dist = Math.sqrt(Math.pow(targetX - x, 2) + Math.pow(targetY - y, 2));
    if (dist < 40) {
      addBisou();
      // Temporary boost in movement to look like a bounce
      x += (Math.random() - 0.5) * 100;
      y += (Math.random() - 0.5) * 100;
    }
    
    requestAnimationFrame(moveClicker);
  }
  
  moveClicker();
}

// Periodically check if we can buy stuff
setInterval(updateUI, 500);

// Admin / Debug Hotkeys
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'b') {
    score += 100;
    updateUI();
  }
});
