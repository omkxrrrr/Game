document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const difficulties = {
        easy: { canvasSize: 400, cellSize: 40 },
        medium: { canvasSize: 600, cellSize: 30 },
        hard: { canvasSize: 600, cellSize: 30 } // Hard mode uses medium scale
    };

    let currentDifficulty = 'easy'; // Default difficulty
    let handleKeydownRef; // Reference to the keydown handler
    let player, startX, startY, exitX, exitY; // Player, start, and exit positions

    function setupMaze(difficulty) {
        // Remove existing keydown listener if it exists
        if (handleKeydownRef) {
            document.removeEventListener('keydown', handleKeydownRef);
        }

        currentDifficulty = difficulty; // Update current difficulty
        const { canvasSize, cellSize } = difficulties[difficulty];
        canvas.width = canvasSize;
        canvas.height = canvasSize;

        const rows = canvas.height / cellSize;
        const cols = canvas.width / cellSize;

        const cells = [];
        const directions = [
            { dx: 0, dy: -1, wallIndex: 0 }, // up
            { dx: 1, dy: 0, wallIndex: 1 },  // right
            { dx: 0, dy: 1, wallIndex: 2 },  // down
            { dx: -1, dy: 0, wallIndex: 3 }  // left
        ];

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                cells.push({
                    x: x,
                    y: y,
                    walls: [true, true, true, true], // top, right, bottom, left
                    visited: false
                });
            }
        }

        // Determine start and exit positions
        startX = 0;
        startY = 0;
        exitX = cols - 1;
        exitY = rows - 1;

        // Randomize start and exit locations only in hard mode
        if (difficulty === 'hard') {
            startX = Math.floor(Math.random() * cols);
            startY = Math.floor(Math.random() * rows);
            exitX = Math.floor(Math.random() * cols);
            exitY = Math.floor(Math.random() * rows);
        }

        player = { x: startX, y: startY }; // Set player's start position

        function index(x, y) {
            if (x < 0 || y < 0 || x >= cols || y >= rows) {
                return -1;
            }
            return x + y * cols;
        }

        function removeWalls(current, next) {
            const dx = current.x - next.x;
            const dy = current.y - next.y;

            if (dx === 1) {
                current.walls[3] = false;
                next.walls[1] = false;
            } else if (dx === -1) {
                current.walls[1] = false;
                next.walls[3] = false;
            }

            if (dy === 1) {
                current.walls[0] = false;
                next.walls[2] = false;
            } else if (dy === -1) {
                current.walls[2] = false;
                next.walls[0] = false;
            }
        }

        function generateMaze(x, y) {
            const current = cells[index(x, y)];
            current.visited = true;

            const shuffledDirections = directions.slice();
            shuffle(shuffledDirections);

            shuffledDirections.forEach(direction => {
                const nx = x + direction.dx;
                const ny = y + direction.dy;
                const nextIndex = index(nx, ny);

                if (nextIndex !== -1 && !cells[nextIndex].visited) {
                    removeWalls(current, cells[nextIndex]);
                    generateMaze(nx, ny);
                }
            });
        }

        function drawMaze() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;

            cells.forEach(cell => {
                const x = cell.x * cellSize;
                const y = cell.y * cellSize;

                if (cell.walls[0]) {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + cellSize, y);
                    ctx.stroke();
                }
                if (cell.walls[1]) {
                    ctx.beginPath();
                    ctx.moveTo(x + cellSize, y);
                    ctx.lineTo(x + cellSize, y + cellSize);
                    ctx.stroke();
                }
                if (cell.walls[2]) {
                    ctx.beginPath();
                    ctx.moveTo(x, y + cellSize);
                    ctx.lineTo(x + cellSize, y + cellSize);
                    ctx.stroke();
                }
                if (cell.walls[3]) {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x, y + cellSize);
                    ctx.stroke();
                }
            });

            // Draw start and exit points
            ctx.fillStyle = 'rgba(0, 128, 0, 0.5)';
            ctx.fillRect(startX * cellSize, startY * cellSize, cellSize, cellSize); // Start

            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(exitX * cellSize, exitY * cellSize, cellSize, cellSize); // Exit
        }

        function drawPlayer() {
            ctx.fillStyle = 'blue';
            ctx.beginPath();
            ctx.arc(player.x * cellSize + cellSize / 2, player.y * cellSize + cellSize / 2, cellSize / 4, 0, Math.PI * 2);
            ctx.fill();
        }

        function movePlayer(dx, dy) {
            const currentCell = cells[index(player.x, player.y)];
            let newX = player.x + dx;
            let newY = player.y + dy;
            const newCell = cells[index(newX, newY)];

            if (newCell && !currentCell.walls[directions.findIndex(d => d.dx === dx && d.dy === dy)]) {
                player.x = newX;
                player.y = newY;
                drawMaze();
                drawPlayer();
                checkWin(); // Check win condition after moving
            }
        }

        function handleKeydown(e) {
            // Prevent default behavior of arrow keys to stop page movement
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }

            switch (e.key) {
                case 'ArrowUp':
                    movePlayer(0, -1);
                    break;
                case 'ArrowDown':
                    movePlayer(0, 1);
                    break;
                case 'ArrowLeft':
                    movePlayer(-1, 0);
                    break;
                case 'ArrowRight':
                    movePlayer(1, 0);
                    break;
            }
            drawMaze();
            drawPlayer();
            checkWin();
        }

        function checkWin() {
            if (player.x === exitX && player.y === exitY) {
                alert("You reached the exit!");
            }
        }

        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        generateMaze(startX, startY);
        drawMaze();
        drawPlayer();

        // Add keydown listener and keep a reference
        handleKeydownRef = handleKeydown;
        document.addEventListener('keydown', handleKeydownRef);
    }

    // Initialize the maze based on selected difficulty
    document.getElementById('easyBtn').addEventListener('click', () => setupMaze('easy'));
    document.getElementById('mediumBtn').addEventListener('click', () => setupMaze('medium'));
    document.getElementById('hardBtn').addEventListener('click', () => setupMaze('hard'));

    // Restart button functionality to restart the entire maze
    document.getElementById('restartBtn').addEventListener('click', () => setupMaze(currentDifficulty));

    // Start with the easy maze
    setupMaze('easy');
});
