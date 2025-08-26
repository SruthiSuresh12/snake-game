Const canvas = document.getElementById('gameCanvas');
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
    draw(); // Draw the initial state of the game

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
    // Draw the head with rounded corners
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.roundRect(snake[0].x, snake[0].y, gridSize, gridSize, 5);
    ctx.fill();
    ctx.closePath();

    // Draw the body segments as rectangles
    ctx.fillStyle = '#66BB6A';
    for (let i = 1; i < snake.length - 1; i++) {
        ctx.fillRect(snake[i].x, snake[i].y, gridSize, gridSize);
    }

    // Draw the tail with rounded corners
    if (snake.length > 1) {
        ctx.fillStyle = '#81C784';
        ctx.beginPath();
        ctx.roundRect(snake[snake.length - 1].x, snake[snake.length - 1].y, gridSize, gridSize, 5);
        ctx.fill();
        ctx.closePath();
    }
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
    // Ensure food is not generated on the snake
    for (const segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

function update() {
    if (isGameOver()) {
        endGame();
        return;
    }

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    changingDirection = false;

    // Check for food collision with a more accurate comparison
    if (head.x === food.x && head.y === food.y) {
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
    for (let i = 1; i < snake.length; i++) {
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

// Added passive: false to prevent default touch actions like scrolling
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
