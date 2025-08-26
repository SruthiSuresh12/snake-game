const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

// Game state variables
let gridSize;
let snake = [];
let food = {};
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let dx = 0;
let dy = 0;
let gameInterval;
let gameSpeed = 150;
let changingDirection = false;

// Assets
const eatSound = new Audio('eat.mp3');
const gameOverSound = new Audio('gameOver.mp3');
const foodImage = new Image();
foodImage.src = 'food.png';

// Touch control variables
let touchStartX = 0;
let touchStartY = 0;

// --- Game Initialization ---
function initializeGame() {
    const canvasSize = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9);
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    gridSize = canvasSize / 20;

    highScoreDisplay.textContent = 'High Score: ' + highScore;
    setupGame();
}

function setupGame() {
    gameOverScreen.classList.add('hidden');
    canvas.style.display = 'block';

    // Reset game state
    snake = [{ x: 10 * gridSize, y: 10 * gridSize }];
    dx = gridSize;
    dy = 0;
    score = 0;
    scoreDisplay.textContent = 'Score: ' + score;
    changingDirection = false;

    generateFood();
    draw();

    clearInterval(gameInterval);
    gameSpeed = 150;
    gameInterval = setInterval(update, gameSpeed);
}

// --- Drawing Functions ---
function drawGrid() {
    const lightColor = '#fcd988';
    const darkColor = '#fce8a6';
    const numRows = canvas.height / gridSize;
    const numCols = canvas.width / gridSize;

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            ctx.fillStyle = (row + col) % 2 === 0 ? darkColor : lightColor;
            ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
        }
    }
}

function drawSnake() {
    ctx.lineWidth = gridSize; // Make the line as thick as a grid cell
    ctx.lineCap = 'round'; // Gives the line rounded ends
    ctx.strokeStyle = '#4CAF50';
    
    ctx.beginPath();
    // Move to the first segment
    ctx.moveTo(snake[0].x + gridSize / 2, snake[0].y + gridSize / 2);

    // Draw lines to the subsequent segments
    for (let i = 1; i < snake.length; i++) {
        ctx.lineTo(snake[i].x + gridSize / 2, snake[i].y + gridSize / 2);
    }
    
    ctx.stroke();
}

function drawFood() {
    if (foodImage.complete) {
        ctx.drawImage(foodImage, food.x, food.y, gridSize, gridSize);
    } else {
        // Fallback to a circle if the image hasn't loaded
        ctx.fillStyle = '#ff6347';
        ctx.beginPath();
        ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}

function draw() {
    drawGrid();
    drawFood();
    drawSnake();
}

// --- Game Logic ---
function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
    };
}

function update() {
    if (isGameOver()) {
        endGame();
        return;
    }

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    changingDirection = false;

    const distanceX = Math.abs(head.x - food.x);
    const distanceY = Math.abs(head.y - food.y);
    const minDistance = gridSize;

    if (distanceX < minDistance && distanceY < minDistance) {
        score++;
        eatSound.play();
        scoreDisplay.textContent = 'Score: ' + score;
        generateFood();
    } else {
        snake.pop();
    }

    draw();
}

function isGameOver() {
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }

    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x >= canvas.width;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y >= canvas.height;

    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
}

function endGame() {
    clearInterval(gameInterval);
    gameOverSound.play();
    canvas.style.display = 'none';
    gameOverScreen.classList.remove('hidden');
    finalScoreDisplay.textContent = 'Final Score: ' + score;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreDisplay.textContent = 'High Score: ' + highScore;
    }
}

function changeDirection(direction) {
    if (changingDirection) return;
    changingDirection = true;

    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;

    if (direction === 'left' && !goingRight) {
        dx = -gridSize;
        dy = 0;
    } else if (direction === 'up' && !goingDown) {
        dx = 0;
        dy = -gridSize;
    } else if (direction === 'right' && !goingLeft) {
        dx = gridSize;
        dy = 0;
    } else if (direction === 'down' && !goingUp) {
        dx = 0;
        dy = gridSize;
    }
}

// --- Event Listeners ---
document.addEventListener('keydown', (event) => {
    const keyPressed = event.keyCode;
    if (keyPressed === 37) changeDirection('left');
    if (keyPressed === 38) changeDirection('up');
    if (keyPressed === 39) changeDirection('right');
    if (keyPressed === 40) changeDirection('down');
});

document.addEventListener('touchstart', (event) => {
    event.preventDefault();
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}, { passive: false });

document.addEventListener('touchmove', (event) => {
    event.preventDefault();
    const touchMoveX = event.touches[0].clientX;
    const touchMoveY = event.touches[0].clientY;

    const diffX = touchMoveX - touchStartX;
    const diffY = touchMoveY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) changeDirection('right');
        else changeDirection('left');
    } else {
        if (diffY > 0) changeDirection('down');
        else changeDirection('up');
    }

    touchStartX = touchMoveX;
    touchStartY = touchMoveY;
}, { passive: false });

restartBtn.addEventListener('click', setupGame);

// Initial call to set up the game
initializeGame();
