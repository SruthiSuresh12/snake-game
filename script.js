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
let gameSpeed = 150;

// Image assets
const headImg = new Image();
headImg.src = 'head.png';

const tailImg = new Image();
tailImg.src = 'tail.png';

const foodImg = new Image();
foodImg.src = 'food.png';

let assetsLoaded = 0;
const totalAssets = 3;

function loadAssets() {
    assetsLoaded++;
    if (assetsLoaded === totalAssets) {
        highScoreDisplay.textContent = 'High Score: ' + highScore;
        setupGame();
    }
}

headImg.onload = loadAssets;
tailImg.onload = loadAssets;
foodImg.onload = loadAssets;

// On-screen buttons
const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

function setupGame() {
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
    
    clearInterval(gameInterval);
    gameSpeed = 150;
    gameInterval = setInterval(update, gameSpeed);
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
    };
}

function drawFood() {
    ctx.drawImage(foodImg, food.x, food.y, gridSize, gridSize);
}

function drawSnake() {
    const head = snake[0];
    const tail = snake[snake.length - 1];

    snake.forEach((segment, index) => {
        let currentImage;
        let angle = 0;

        // Head
        if (index === 0) {
            currentImage = headImg;
            if (dx === gridSize) angle = 0;
            if (dx === -gridSize) angle = Math.PI;
            if (dy === -gridSize) angle = -Math.PI / 2;
            if (dy === gridSize) angle = Math.PI / 2;
        } 
        // Tail
        else if (index === snake.length - 1 && snake.length > 1) {
            currentImage = tailImg;
            const prevSegment = snake[index - 1];
            if (segment.x > prevSegment.x) angle = Math.PI;
            if (segment.x < prevSegment.x) angle = 0;
            if (segment.y > prevSegment.y) angle = -Math.PI / 2;
            if (segment.y < prevSegment.y) angle = Math.PI / 2;
        }
        // Body (custom styling)
        else {
            ctx.fillStyle = '#68c431'; // Light green to match head
            ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
            return;
        }

        // Draw rotated image
        ctx.save();
        ctx.translate(segment.x + gridSize / 2, segment.y + gridSize / 2);
        ctx.rotate(angle);
        ctx.drawImage(currentImage, -gridSize / 2, -gridSize / 2, gridSize, gridSize);
        ctx.restore();
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFood();
    drawSnake();
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
