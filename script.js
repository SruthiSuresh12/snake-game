const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

let gridSize;
let snake = [{ x: 10, y: 10 }];
let food = {};
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let dx = 0;
let dy = 0;
let changingDirection = false;
let gameInterval;

// On-screen buttons
const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

function setupGame() {
    // Clear any existing game interval to prevent speed-up bugs
    clearInterval(gameInterval);
    
    gameOverScreen.style.display = 'none';
    canvas.style.display = 'block';
    
    const canvasSize = canvas.offsetWidth;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    gridSize = canvasSize / 20;

    snake = [{ x: 10 * gridSize, y: 10 * gridSize }];
    dx = gridSize;
    dy = 0;
    score = 0;
    scoreDisplay.textContent = 'Score: ' + score;
    
    generateFood();
    draw();
    
    gameInterval = setInterval(update, 150); // The game loop
}

highScoreDisplay.textContent = 'High Score: ' + highScore;
setupGame(); // Initial call to start the first game

function generateFood() {
    const minX = 0;
    const maxX = canvas.width - gridSize;
    const minY = 0;
    const maxY = canvas.height - gridSize;

    food = {
        x: Math.floor(Math.random() * (maxX - minX + 1) / gridSize) * gridSize,
        y: Math.floor(Math.random() * (maxY - minY + 1) / gridSize) * gridSize
    };
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 2 * 0.7, 0, Math.PI * 2);
    ctx.fill();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawFood();
    
    ctx.fillStyle = 'lime';
    snake.forEach(segment => {
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
    });
}

function update() {
    if (isGameOver()) {
        clearInterval(gameInterval);
        canvas.style.display = 'none';
        gameOverScreen.style.display = 'flex';
        finalScoreDisplay.textContent = 'Final Score: ' + score;
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreDisplay.textContent = 'High Score: ' + highScore;
        }
        return;
    }

    changingDirection = false;
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    
    const distanceX = Math.abs(head.x - food.x);
    const distanceY = Math.abs(head.y - food.y);
    const minDistance = gridSize;

    if (distanceX < minDistance && distanceY < minDistance) {
        score++;
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

function changeDirection(event) {
    if (changingDirection) return;
    changingDirection = true;
    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;
    
    let direction;
    if (event.type === 'keydown') {
        const keyPressed = event.keyCode;
        const LEFT_KEY = 37;
        const UP_KEY = 38;
        const RIGHT_KEY = 39;
        const DOWN_KEY = 40;
        if (keyPressed === LEFT_KEY) direction = 'left';
        if (keyPressed === UP_KEY) direction = 'up';
        if (keyPressed === RIGHT_KEY) direction = 'right';
        if (keyPressed === DOWN_KEY) direction = 'down';
    } else {
        direction = event.target.id.split('-')[0];
    }
    
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

// Event listeners for keyboard and touch controls
document.addEventListener('keydown', changeDirection);
upBtn.addEventListener('click', changeDirection);
downBtn.addEventListener('click', changeDirection);
leftBtn.addEventListener('click', changeDirection);
rightBtn.addEventListener('click', changeDirection);
restartBtn.addEventListener('click', setupGame);

// Handle window resizing
window.addEventListener('resize', () => {
    clearInterval(gameInterval);
    setupGame();
});

