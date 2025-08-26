const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');

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

// Function to handle game setup and resizing
function setupGame() {
    const canvasSize = canvas.offsetWidth;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    gridSize = canvasSize / 20; // 20 grid units
    
    // Reset snake to initial position with new grid size
    snake = [{ x: 10 * gridSize, y: 10 * gridSize }];
    dx = gridSize;
    dy = 0;
    
    generateFood();
    draw();
}

highScoreDisplay.textContent = 'High Score: ' + highScore;
setupGame();

function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
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
    
    // Draw food
    drawFood();
    
    // Draw snake
    ctx.fillStyle = 'lime';
    snake.forEach(segment => {
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
    });
}

function update() {
    if (isGameOver()) {
        clearInterval(gameInterval);
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
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

// Initial game start
gameInterval = setInterval(update, 100);

// Handle window resizing
window.addEventListener('resize', () => {
    clearInterval(gameInterval); // Stop the game loop
    setupGame(); // Re-initialize the game with the new canvas size
    gameInterval = setInterval(update, 100); // Restart the game loop
});

highScoreDisplay.textContent = 'High Score: ' + highScore;
setupGame();

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
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
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

// Initial game start
gameInterval = setInterval(update, 100);

// Handle window resizing
window.addEventListener('resize', () => {
    clearInterval(gameInterval); // Stop the game loop
    setupGame(); // Re-initialize the game with the new canvas size
    gameInterval = setInterval(update, 100); // Restart the game loop
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
