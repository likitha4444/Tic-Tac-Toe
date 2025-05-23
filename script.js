// Game state variables
let gameBoard = Array(9).fill(null);
let currentPlayer = 'X';
let gameStatus = 'playing'; // 'playing', 'won', 'tie'
let winner = null;
let winningCells = [];
let scores = { X: 0, O: 0, ties: 0 };

// Winning combinations
const WINNING_COMBINATIONS = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal top-left to bottom-right
    [2, 4, 6], // Diagonal top-right to bottom-left
];

// DOM elements
const gameStatusElement = document.getElementById('game-status');
const currentPlayerIndicator = document.getElementById('current-player-indicator');
const victoryBadge = document.getElementById('victory-badge');
const gameBoard_element = document.getElementById('game-board');
const newGameBtn = document.getElementById('new-game-btn');
const resetScoresBtn = document.getElementById('reset-scores-btn');
const xScoreElement = document.getElementById('x-score');
const oScoreElement = document.getElementById('o-score');
const tiesScoreElement = document.getElementById('ties-score');
const toast = document.getElementById('toast');
const toastTitle = document.getElementById('toast-title');
const toastMessage = document.getElementById('toast-message');

// Initialize game
function initGame() {
    // Add event listeners to cells
    const cells = document.querySelectorAll('.game-cell');
    cells.forEach((cell, index) => {
        cell.addEventListener('click', () => handleCellClick(index));
    });

    // Add event listeners to buttons
    newGameBtn.addEventListener('click', resetGame);
    resetScoresBtn.addEventListener('click', resetScores);

    // Update UI
    updateGameStatus();
    updateScoreboard();
}

// Handle cell click
function handleCellClick(index) {
    // Prevent moves if game is over or cell is already filled
    if (gameStatus !== 'playing' || gameBoard[index] !== null) {
        return;
    }

    // Make move
    gameBoard[index] = currentPlayer;
    
    // Update cell display
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.textContent = currentPlayer;
    cell.classList.add('filled', currentPlayer.toLowerCase());
    cell.setAttribute('aria-label', `Cell ${index + 1}, filled with ${currentPlayer}`);
    
    // Add animation
    cell.classList.add('cell-pop');
    setTimeout(() => {
        cell.classList.remove('cell-pop');
    }, 300);

    // Check for game end
    const gameEnd = checkGameEnd();
    
    if (gameEnd.status === 'won') {
        gameStatus = 'won';
        winner = gameEnd.winner;
        winningCells = gameEnd.winningCells;
        
        // Highlight winning cells
        winningCells.forEach(cellIndex => {
            const cell = document.querySelector(`[data-index="${cellIndex}"]`);
            cell.classList.add('winner-highlight');
        });
        
        // Update scores
        scores[winner]++;
        
        // Show toast notification
        showToast(`🎉 Player ${winner} Wins!`, "Great game! Ready for another round?");
        
    } else if (gameEnd.status === 'tie') {
        gameStatus = 'tie';
        scores.ties++;
        
        // Show toast notification
        showToast("🤝 It's a Tie!", "Well played by both players!");
    } else {
        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }

    // Update UI
    updateGameStatus();
    updateScoreboard();
}

// Check for game end (win or tie)
function checkGameEnd() {
    // Check for winner
    for (const combination of WINNING_COMBINATIONS) {
        const [a, b, c] = combination;
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            return {
                status: 'won',
                winner: gameBoard[a],
                winningCells: combination,
            };
        }
    }

    // Check for tie
    if (gameBoard.every(cell => cell !== null)) {
        return {
            status: 'tie',
            winner: null,
            winningCells: [],
        };
    }

    // Game continues
    return {
        status: 'playing',
        winner: null,
        winningCells: [],
    };
}

// Update game status display
function updateGameStatus() {
    if (gameStatus === 'won') {
        gameStatusElement.textContent = `Player ${winner} wins! 🎉`;
        currentPlayerIndicator.style.display = 'none';
        victoryBadge.classList.remove('hidden');
    } else if (gameStatus === 'tie') {
        gameStatusElement.textContent = "It's a tie! 🤝";
        currentPlayerIndicator.style.display = 'none';
        victoryBadge.classList.remove('hidden');
    } else {
        gameStatusElement.textContent = `Player ${currentPlayer}'s turn`;
        currentPlayerIndicator.style.display = 'block';
        currentPlayerIndicator.className = `player-indicator ${currentPlayer.toLowerCase()}-player`;
        victoryBadge.classList.add('hidden');
    }
}

// Update scoreboard
function updateScoreboard() {
    xScoreElement.textContent = scores.X;
    oScoreElement.textContent = scores.O;
    tiesScoreElement.textContent = scores.ties;
}

// Reset game
function resetGame() {
    // Reset game state
    gameBoard = Array(9).fill(null);
    currentPlayer = 'X';
    gameStatus = 'playing';
    winner = null;
    winningCells = [];

    // Reset cell displays
    const cells = document.querySelectorAll('.game-cell');
    cells.forEach((cell, index) => {
        cell.textContent = '';
        cell.className = 'game-cell';
        cell.setAttribute('aria-label', `Cell ${index + 1}, empty`);
    });

    // Update UI
    updateGameStatus();
}

// Reset scores
function resetScores() {
    scores = { X: 0, O: 0, ties: 0 };
    resetGame();
    updateScoreboard();
    showToast("Scores Reset", "All scores have been cleared. Good luck!");
}

// Show toast notification
function showToast(title, message) {
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Load scores from localStorage
function loadScores() {
    const savedScores = localStorage.getItem('ticTacToeScores');
    if (savedScores) {
        scores = JSON.parse(savedScores);
        updateScoreboard();
    }
}

// Save scores to localStorage
function saveScores() {
    localStorage.setItem('ticTacToeScores', JSON.stringify(scores));
}

// Override updateScoreboard to save scores
const originalUpdateScoreboard = updateScoreboard;
updateScoreboard = function() {
    originalUpdateScoreboard();
    saveScores();
};

// Add keyboard support
document.addEventListener('keydown', (e) => {
    // Numbers 1-9 to select cells
    if (e.key >= '1' && e.key <= '9') {
        const cellIndex = parseInt(e.key) - 1;
        handleCellClick(cellIndex);
    }
    // 'R' to reset game
    else if (e.key.toLowerCase() === 'r') {
        resetGame();
    }
    // 'S' to reset scores
    else if (e.key.toLowerCase() === 's') {
        resetScores();
    }
});

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadScores();
    initGame();
    
    // Show welcome message
    setTimeout(() => {
        showToast("Welcome to Tic-Tac-Toe!", "Player X goes first. Good luck!");
    }, 500);
});

// Add click handler to toast to dismiss it
toast.addEventListener('click', () => {
    toast.classList.add('hidden');
});