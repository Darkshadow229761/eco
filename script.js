const canvas = document.getElementById('gameCanvas');
const basket = document.getElementById('basket');
const scoreVal = document.getElementById('scoreVal');
const livesVal = document.getElementById('livesVal');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');

let score = 0;
let lives = 3;
let gameActive = false;
let activeItems = [];
let gameInterval;
let spawnInterval;
let currentItemSpeed = 4;

// Mouse Tracker Event Listener
canvas.addEventListener('mousemove', (e) => {
    if (!gameActive) return;
    const rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    
    // Constrain basket center position inside the boundary coordinates
    let basketX = mouseX - 35; 
    if (basketX < 0) basketX = 0;
    if (basketX > 326) basketX = 326; 
    
    basket.style.left = basketX + 'px';
});

// Touch Control Tracker Support for Mobile Viewports
canvas.addEventListener('touchmove', (e) => {
    if (!gameActive) return;
    // Prevent scrolling behavior while actively sliding controls
    e.preventDefault(); 
    const rect = canvas.getBoundingClientRect();
    let touchX = e.touches.clientX - rect.left;
    
    let basketX = touchX - 35;
    if (basketX < 0) basketX = 0;
    if (basketX > 326) basketX = 326;
    
    basket.style.left = basketX + 'px';
}, { passive: false });

// Initializes Game State Parameters
function startGame() {
    score = 0;
    lives = 3;
    currentItemSpeed = 4;
    scoreVal.innerText = score;
    livesVal.innerText = lives;
    
    // Sweep clear old existing components if resetting game loops
    activeItems.forEach(item => item.element.remove());
    activeItems = [];
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameActive = true;

    // Execution Interval Core Loops 
    gameInterval = setInterval(updateGame, 1000 / 60); // Standardized rendering update frame rates
    spawnInterval = setInterval(spawnItem, 800);      // Frequency rate configuration parameters
}

// Generates Random Falling Nodes 
function spawnItem() {
    if (!gameActive) return;

    const itemPool = [
        { icon: '🌱', type: 'good' },
        { icon: '💧', type: 'good' },
        { icon: '💥', type: 'bad' }
    ];
    
    // Balanced probabilities: 70% Eco targets, 30% Hazardous traps
    const chosenItem = Math.random() < 0.7 ? itemPool[Math.floor(Math.random() * 2)] : itemPool[2];

    const itemEl = document.createElement('div');
    itemEl.className = 'falling-item';
    itemEl.innerText = chosenItem.icon;
    
    // Random horizontal entry values
    const randomX = Math.floor(Math.random() * 350);
    itemEl.style.left = randomX + 'px';
    itemEl.style.top = '-40px';
    
    canvas.appendChild(itemEl);
    
    activeItems.push({
        element: itemEl,
        x: randomX,
        y: -40,
        type: chosenItem.type
    });
}

// Updates Frame Cycles & Processes Collision Metrics
function updateGame() {
    const basketRect = basket.getBoundingClientRect();

    for (let i = activeItems.length - 1; i >= 0; i--) {
        let item = activeItems[i];
        item.y += currentItemSpeed;
        item.element.style.top = item.y + 'px';

        const itemRect = item.element.getBoundingClientRect();

        // Axis Collision Logic Check
        if (
            itemRect.bottom >= basketRect.top &&
            itemRect.top <= basketRect.bottom &&
            itemRect.right >= basketRect.left &&
            itemRect.left <= basketRect.right
        ) {
            // Collision action outcomes
            if (item.type === 'good') {
                score += 10;
                scoreVal.innerText = score;
                // Dynamically accelerates speeds to match scaling capabilities
                if (score % 60 === 0) currentItemSpeed += 0.5;
            } else {
                lives--;
                livesVal.innerText = lives;
                if (lives <= 0) endGame();
            }
            
            item.element.remove();
            activeItems.splice(i, 1);
            continue;
        }

        // If items slip completely past target line borders
        if (item.y > 600) {
            if (item.type === 'good') {
                lives--; // Penalizes failure to capture eco nodes
                livesVal.innerText = lives;
                if (lives <= 0) endGame();
            }
            item.element.remove();
            activeItems.splice(i, 1);
        }
    }
}

// Unmounts Core Execution Intervals upon Terminal States
function endGame() {
    gameActive = false;
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    finalScore.innerText = score;
    gameOverScreen.classList.remove('hidden');
}
