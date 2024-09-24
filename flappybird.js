const DISPLAY_WIDTH = 280;
const DISPLAY_HEIGHT = 512;
const gravity = 0.05;  // Adjusted gravity for a slower game
let birdMove = 1;
let pipeList = [];
let birdIndex = 0;
let game = false;  // Start with the game not active
let score = 0;
let highScore = 0;
let floorPosX = 0;
let intervalId = null;  // To store the interval ID for pipes
let gameStarted = false;  // Track if the game has started

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const birdFrames = [
    document.getElementById('birdDown'),
    document.getElementById('birdMid'),
    document.getElementById('birdUp')
];
const bg = document.getElementById('bg');
const floor = document.getElementById('floor');
const pipeImg = document.getElementById('pipe');
const bgGameOver = document.getElementById('bgGameOver');

const flapSound = new Audio('C:\Users\DELL\Desktop\Projects\puzzel\assets\sounds\sound_effects\Flap.ogg');
const collideSound = new Audio('assets\sounds\sound_effects\Hit.ogg');
const pointSound = new Audio('assets\sounds\sound_effects\Point.ogg');

let bird = birdFrames[birdIndex];
let birdRect = { x: 50, y: DISPLAY_HEIGHT / 2, width: bird.width, height: bird.height };

function createPipe() {
    const gapHeight = 150;
    const randomPipe = [200, 300, 400][Math.floor(Math.random() * 3)];
    const topPipe = { x: DISPLAY_WIDTH, y: randomPipe - pipeImg.height - gapHeight, width: pipeImg.width, height: pipeImg.height };
    const bottomPipe = { x: DISPLAY_WIDTH, y: randomPipe, width: pipeImg.width, height: pipeImg.height };
    return [topPipe, bottomPipe];
}

function drawPipe(pipes) {
    pipes.forEach(pipeSet => {
        pipeSet.forEach(p => {
            if (p.y < 0) {
                ctx.save();
                ctx.translate(p.x, p.y + p.height);
                ctx.scale(1, -1);
                ctx.drawImage(pipeImg, 0, 0);
                ctx.restore();
            } else {
                ctx.drawImage(pipeImg, p.x, p.y);
            }
        });
    });
}

function movePipe(pipes) {
    pipes.forEach(pipeSet => {
        pipeSet.forEach(p => {
            p.x -= 1;  // Adjusted pipe speed for a slower game
        });
    });
    return pipes.filter(pipeSet => pipeSet[0].x + pipeSet[0].width > 0);  // Keep pipe sets within the screen
}

function removePipe(pipes) {
    return pipes.filter(pipeSet => pipeSet[0].x + pipeSet[0].width > 0);  // Only keep pipe sets still on the screen
}

function moveFloor() {
    ctx.drawImage(floor, floorPosX, DISPLAY_HEIGHT - floor.height / 2);
    ctx.drawImage(floor, floorPosX + DISPLAY_WIDTH, DISPLAY_HEIGHT - floor.height / 2);
}

function checkCollision(pipes) {
    for (let pipeSet of pipes) {
        for (let p of pipeSet) {
            if (
                birdRect.x < p.x + p.width &&
                birdRect.x + birdRect.width > p.x &&
                birdRect.y < p.y + p.height &&
                birdRect.y + birdRect.height > p.y
            ) {
                collideSound.play();
                return false;
            }
        }
    }
    if (birdRect.y <= 0 || birdRect.y + birdRect.height >= DISPLAY_HEIGHT - floor.height / 2) {
        collideSound.play();
        return false;
    }
    return true;
}

function incrementScore() {
    pipeList.forEach(pipeSet => {
        if (pipeSet[0].x + pipeSet[0].width < birdRect.x && !pipeSet.passed) {
            pointSound.play();
            score += 1;
            pipeSet.passed = true;  // Mark this set as passed
        }
    });
}

function draw() {
    ctx.drawImage(bg, 0, 0);
    if (game) {
        birdMove += gravity;
        birdRect.y += birdMove;
        ctx.drawImage(bird, birdRect.x, birdRect.y);
        game = checkCollision(pipeList);

        drawPipe(pipeList);
        pipeList = movePipe(pipeList);
        pipeList = removePipe(pipeList);

        incrementScore();
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';  // Changed font size and type
        ctx.textAlign = 'center';  // Center the text
        ctx.fillText(`Score: ${score}`, DISPLAY_WIDTH / 2, 50);
    } else {
        ctx.drawImage(bgGameOver, DISPLAY_WIDTH / 2 - bgGameOver.width / 2, DISPLAY_HEIGHT / 2 - bgGameOver.height / 2 - 25);
        pipeList = movePipe(pipeList);
        pipeList = removePipe(pipeList);
        highScore = Math.max(score, highScore);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';  // Changed font size and type
        ctx.textAlign = 'center';  // Center the text
        ctx.fillText(`Score: ${score}`, DISPLAY_WIDTH / 2, 50);
        ctx.fillText(`High Score: ${highScore}`, DISPLAY_WIDTH / 2, 412);
    }
    moveFloor();
    if (floorPosX <= -DISPLAY_WIDTH) {
        floorPosX = 0;
    }
    floorPosX -= 0.25;  // Slower floor movement
    requestAnimationFrame(draw);
}

function resetGame() {
    game = true;
    pipeList = [];
    birdMove = 1;  // Reset bird movement to initial speed
    birdRect.y = DISPLAY_HEIGHT / 2;
    score = 0;

    if (intervalId) {
        clearInterval(intervalId);
    }
    intervalId = setInterval(() => {
        if (game) {
            pipeList.push(createPipe());  // Push a new set of pipes
        }
    }, 2000);
}

function gameInit() {
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            if (!gameStarted) {
                gameStarted = true;
                resetGame();
            } else if (!game) {
                resetGame();
            } else {
                birdMove = 0;
                birdMove -= 3;
                flapSound.play();
            }
        }
    });

    document.addEventListener('touchstart', () => {
        if (!gameStarted) {
            gameStarted = true;
            resetGame();
        } else if (!game) {
            resetGame();
        } else {
            birdMove = 0;
            birdMove -= 3;
            flapSound.play();
        }
    });

    // Set the interval for generating pipes
    intervalId = setInterval(() => {
        if (game) {
            pipeList.push(createPipe());  // Push a new set of pipes
        }
    }, 2000);

    draw();
}

gameInit();
