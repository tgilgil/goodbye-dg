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
const kissIndicator = document.getElementById('kiss-indicator');
const blush = document.getElementById('blush');

// Cosmetic logic
const cosmetics = {
  tophat: { icon: '🎩', type: 'hat' },
  viking: { icon: '🪖', type: 'hat' },
  shades: { icon: '🕶️', type: 'glasses' },
  sparkles: { icon: '✨', type: 'aura' }
};

const ownedCosmetics = new Set();
const activeCosmetics = { hat: null, glasses: null, aura: null };

function applyCosmetic(name) {
  const meta = cosmetics[name];
  if (!meta) return;

  // Remove existing of same type
  const oldElement = document.getElementById(`cosmetic-${meta.type}`);
  if (oldElement) oldElement.remove();

  // Create new
  const el = document.createElement('div');
  el.id = `cosmetic-${meta.type}`;
  el.className = `david-cosmetic cosmetic-${meta.type} active`;
  el.textContent = meta.icon;
  david.querySelector('.david-body').appendChild(el);
  activeCosmetics[meta.type] = name;
}

document.querySelectorAll('.cosmetic-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.name;
    const cost = parseInt(btn.dataset.cost);
    
    if (score >= cost && !ownedCosmetics.has(name)) {
      score -= cost;
      ownedCosmetics.add(name);
      btn.classList.add('owned');
      btn.textContent = `Equipped ${cosmetics[name].icon}`;
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
  currentX += (targetX - currentX) * speed;
  currentY += (targetY - currentY) * speed;
  
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

  document.querySelectorAll('.cosmetic-item').forEach(btn => {
    const cost = parseInt(btn.dataset.cost);
    const name = btn.dataset.name;
    if (!ownedCosmetics.has(name)) {
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
    buyAutoClickerBtn.textContent = `Buy Auto-Clicker (${autoClickerCost} 💋)`;
    updateUI();
    spawnAutoClicker();
  }
});

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
