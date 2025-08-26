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

// Sound Effects
const eatSound = new Audio('eat.mp3');
const gameOverSound = new Audio('gameOver.mp3');

// Touch control variables
let touchStartX = 0;
let touchStartY = 0;

// Image assets for the snake
const headImage = new Image();
headImage.src = 'head.png';
const tailImage = new Image();
tailImage.src = 'tail.png';

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
    if (snake.length > 1) {
        // Draw the snake's body segments as squares
        ctx.fillStyle = '#eb4b5b';
        for (let i = 1; i < snake.length - 1; i++) {
            ctx.fillRect(snake[i].x, snake[i].y, gridSize, gridSize);
        }

        // Draw the snake's head
        drawSegment(snake[0], getDirection(snake[1], snake[0]), 'head');

        // Draw the snake's tail
        drawSegment(snake[snake.length - 1], getDirection(snake[snake.length - 2], snake[snake.length - 1]), 'tail');

    } else {
        // If the snake has only one segment, draw a circle head
        ctx.fillStyle = '#eb4b5b';
        ctx.beginPath();
        ctx.arc(snake[0].x + gridSize / 2, snake[0].y + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}

function drawSegment(segment, direction, type) {
    const image = type === 'head' ? headImage : tailImage;
    const { x, y } = segment;

    ctx.save();
    ctx.translate(x + gridSize / 2, y + gridSize / 2);

    let angle = 0;
    if (type === 'tail') {
        switch (direction) {
            case 'up': angle = Math.PI / 2; break; // Tail should face down
            case 'down': angle = -Math.PI / 2; break; // Tail should face up
            case 'left': angle = 0; break; // Tail should face right
            case 'right': angle = Math.PI; break; // Tail should face left
        }
    } else { // Head rotation
        switch (direction) {
            case 'up': angle = -Math.PI / 2; break;
            case 'down': angle = Math.PI / 2; break;
            case 'left': angle = Math.PI; break;
            case 'right': angle = 0; break;
        }
    }

    ctx.rotate(angle);
    ctx.drawImage(image, -gridSize / 2, -gridSize / 2, gridSize, gridSize);
    ctx.restore();
}

function getDirection(fromSegment, toSegment) {
    if (toSegment.y < fromSegment.y) return 'up';
    if (toSegment.y > fromSegment.y) return 'down';
    if (toSegment.x < fromSegment.x) return 'left';
    if (toSegment.x > fromSegment.x) return 'right';
    return 'right';
}

function drawFood() {
    ctx.fillStyle = '#8EA604';
    ctx.beginPath();
    ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

function draw() {
    drawGrid();
    drawFood();
    drawSnake();
}

// --- Game Logic ---
function generateFood() {
    let newFood;
    let onSnake;
    do {
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
        };
        onSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    } while (onSnake);
    food = newFood;
}

function update() {
    if (isGameOver()) {
        endGame();
        return;
    }

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    changingDirection = false;

    // CORRECTED: Check if head coordinates match food coordinates exactly
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

// Keyboard controls (no change)
document.addEventListener('keydown', (event) => {
    const keyPressed = event.keyCode;
    if (keyPressed === 37) changeDirection('left');
    if (keyPressed === 38) changeDirection('up');
    if (keyPressed === 39) changeDirection('right');
    if (keyPressed === 40) changeDirection('down');
});

// Touch controls for the canvas only
canvas.addEventListener('touchstart', (event) => {
    event.preventDefault(); // Prevents page from scrolling
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}, { passive: false });

canvas.addEventListener('touchend', (event) => {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) changeDirection('right');
        else changeDirection('left');
    } else {
        if (diffY > 0) changeDirection('down');
        else changeDirection('up');
    }
}, { passive: false });

// Restart button with a standard click listener
restartBtn.addEventListener('click', setupGame);

// Initial call to set up the game
initializeGame();
