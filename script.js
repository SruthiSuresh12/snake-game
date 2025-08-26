const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');

const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let food = {};
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0; // Get high score from localStorage
let dx = gridSize;
let dy = 0;
let changingDirection = false;
let gameInterval;

highScoreDisplay.textContent = 'High Score: ' + highScore; // Display initial high score

function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
    };
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw food
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, gridSize, gridSize);
    
    // Draw snake
    ctx.fillStyle = 'lime';
    snake.forEach(segment => {
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
    });
}

function update() {
    if (isGameOver()) {
        clearInterval(gameInterval);
        // Check if the current score is a new high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore); // Save new high score to localStorage
            highScoreDisplay.textContent = 'High Score: ' + highScore;
            alert('New High Score! Your score was ' + score);
        } else {
            alert('Game Over! Your score was ' + score);
        }
        return;
    }

    changingDirection = false;
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
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
    const keyPressed = event.keyCode;
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -gridSize;
        dy = 0;
    } else if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -gridSize;
    } else if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = gridSize;
        dy = 0;
    } else if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = gridSize;
    }
}

// Event listeners and game start
document.addEventListener('keydown', changeDirection);
generateFood();
gameInterval = setInterval(update, 100);
