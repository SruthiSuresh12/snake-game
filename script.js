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
let gameInterval;
let gameSpeed = 150;

// Sound Effects
const eatSound = new Audio('eat.mp3'); 
const gameOverSound = new Audio('gameOver.mp3'); 

let touchStartX = 0;
let touchStartY = 0;
let changingDirection = false;

function setupGame() {
    gameOverScreen.classList.add('hidden');
    canvas.style.display = 'block';
    
    const canvasSize = canvas.offsetWidth;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    gridSize = canvasSize / 40; // Smaller snake
    
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

function drawGrid() {
    const lightColor = '#fcd988';
    const darkColor = '#fce8a6';
    
    for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.fillStyle = (x / gridSize + y / gridSize) % 2 === 0 ? darkColor : lightColor;
            ctx.fillRect(x, y, gridSize, gridSize);
        }
    }
}

function drawSnake() {
    ctx.fillStyle = '#4CAF50';
    snake.forEach(segment => {
        ctx.beginPath();
        ctx.arc(segment.x + gridSize / 2, segment.y + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    });
}

function drawFood() {
    ctx.fillStyle = '#ff6347';
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

function update() {
    if (isGameOver()) {
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

// Keyboard controls
document.addEventListener('keydown', (event) => {
    const keyPressed = event.keyCode;
    const LEFT_KEY = 37;
    const UP_KEY = 38;
    const RIGHT_KEY = 39;
    const DOWN_KEY = 40;

    if (keyPressed === LEFT_KEY) changeDirection('left');
    if (keyPressed === UP_KEY) changeDirection('up');
    if (keyPressed === RIGHT_KEY) changeDirection('right');
    if (keyPressed === DOWN_KEY) changeDirection('down');
});

// Touch controls using swipe logic
document.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
});

document.addEventListener('touchend', (event) => {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 0) changeDirection('right');
        else changeDirection('left');
    } else {
        // Vertical swipe
        if (diffY > 0) changeDirection('down');
        else changeDirection('up');
    }
});

restartBtn.addEventListener('click', setupGame);

// Initial game setup and event listener for resizing
highScoreDisplay.textContent = 'High Score: ' + highScore;
setupGame();
window.addEventListener('resize', () => {
    clearInterval(gameInterval);
    setupGame();
});

