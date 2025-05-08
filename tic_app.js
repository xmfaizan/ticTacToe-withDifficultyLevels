// Game elements
let boxes = document.querySelectorAll(".box");
let resetBtn = document.querySelector("#reset-btn");
let newGameBtn = document.querySelector("#new-btn");
let msgContainer = document.querySelector(".msg-container");
let msg = document.querySelector("#msg");
let welcomePopup = document.getElementById("welcome-popup");
let endGamePopup = document.getElementById("end-game-popup");
let resultIcon = document.getElementById("result-icon");
let resultTitle = document.getElementById("result-title");
let resultMessage = document.getElementById("result-message");
let easyBtn = document.getElementById("easy-btn");
let mediumBtn = document.getElementById("medium-btn");
let hardBtn = document.getElementById("hard-btn");
let playAgainBtn = document.getElementById("play-again-btn");
let winningLine = document.getElementById("winning-line");

// Game state variables
let currentPlayer = "X"; // Player is always X
let gameActive = false;
let gameBoard = ["", "", "", "", "", "", "", "", ""];
let difficulty = "";
let computerThinking = false;

// Win patterns and their corresponding line positions
const winPatterns = [
  { pattern: [0, 1, 2], line: { x1: 10, y1: 18, x2: 90, y2: 18, angle: 0 } },
  { pattern: [3, 4, 5], line: { x1: 10, y1: 50, x2: 90, y2: 50, angle: 0 } },
  { pattern: [6, 7, 8], line: { x1: 10, y1: 82, x2: 90, y2: 82, angle: 0 } },
  { pattern: [0, 3, 6], line: { x1: 18, y1: 10, x2: 18, y2: 90, angle: 90 } },
  { pattern: [1, 4, 7], line: { x1: 50, y1: 10, x2: 50, y2: 90, angle: 90 } },
  { pattern: [2, 5, 8], line: { x1: 82, y1: 10, x2: 82, y2: 90, angle: 90 } },
  { pattern: [0, 4, 8], line: { x1: 10, y1: 10, x2: 90, y2: 90, angle: 45 } },
  { pattern: [2, 4, 6], line: { x1: 90, y1: 10, x2: 10, y2: 90, angle: 135 } },
];

// Event listeners for difficulty selection
easyBtn.addEventListener("click", () => startGame("easy"));
mediumBtn.addEventListener("click", () => startGame("medium"));
hardBtn.addEventListener("click", () => startGame("hard"));
playAgainBtn.addEventListener("click", () => {
  endGamePopup.style.display = "none";
  welcomePopup.style.display = "flex";
});

// Set up the game with selected difficulty
function startGame(selectedDifficulty) {
  difficulty = selectedDifficulty;
  welcomePopup.style.display = "none";
  resetGame();
  gameActive = true;
}

// Reset the game to initial state
function resetGame() {
  currentPlayer = "X";
  gameBoard = ["", "", "", "", "", "", "", "", ""];
  hideWinningLine();
  enableBoxes();
  msgContainer.classList.add("hide");
  gameActive = true;
}

// Event listener for each box
boxes.forEach((box, index) => {
  box.addEventListener("click", () => {
    if (
      box.innerText === "" &&
      gameActive &&
      currentPlayer === "X" &&
      !computerThinking
    ) {
      makeMove(index);

      // Check for game end after player move
      if (gameActive) {
        // Computer's turn
        computerThinking = true;
        setTimeout(() => {
          computerMove();
          computerThinking = false;
        }, 600); // Slight delay for better UX
      }
    }
  });
});

// Handle player or computer move
function makeMove(index) {
  boxes[index].innerText = currentPlayer;
  gameBoard[index] = currentPlayer;

  // Check for winner or draw
  if (checkWinner()) {
    if (currentPlayer === "X") {
      endGame("You Won!");
      showEndGamePopup("win");
    } else {
      endGame("You Lost!");
      showEndGamePopup("lose");
    }
    return;
  }

  if (isBoardFull()) {
    endGame("Game was a Draw!");
    showEndGamePopup("draw");
    return;
  }

  // Switch player
  currentPlayer = currentPlayer === "X" ? "O" : "X";
}

// Show end game popup with appropriate message
function showEndGamePopup(result) {
  switch (result) {
    case "win":
      resultIcon.innerHTML = "🏆";
      resultIcon.className = "result-icon win-icon";
      resultTitle.innerText = "Congratulations!";
      resultMessage.innerText = "You won this round!";
      break;
    case "lose":
      resultIcon.innerHTML = "😢";
      resultIcon.className = "result-icon lose-icon";
      resultTitle.innerText = "You Lost";
      resultMessage.innerText = "Better luck next time!";
      break;
    case "draw":
      resultIcon.innerHTML = "🤝";
      resultIcon.className = "result-icon draw-icon";
      resultTitle.innerText = "It's a Draw";
      resultMessage.innerText = "Try again for a victory!";
      break;
  }

  // Display the popup with a slight delay
  setTimeout(() => {
    endGamePopup.style.display = "flex";
  }, 1000);
}

// Computer move based on difficulty
function computerMove() {
  if (!gameActive) return;

  let moveIndex;

  switch (difficulty) {
    case "easy":
      moveIndex = getRandomMove();
      break;
    case "medium":
      // 50% chance to make smart move, 50% random
      moveIndex = Math.random() > 0.5 ? getSmartMove() : getRandomMove();
      break;
    case "hard":
      moveIndex = getBestMove();
      break;
    default:
      moveIndex = getRandomMove();
  }

  if (moveIndex !== null) {
    makeMove(moveIndex);
  }
}

// Random move for easy difficulty
function getRandomMove() {
  const availableMoves = [];

  for (let i = 0; i < gameBoard.length; i++) {
    if (gameBoard[i] === "") {
      availableMoves.push(i);
    }
  }

  if (availableMoves.length === 0) return null;

  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// Medium difficulty - block winning moves or make winning moves
function getSmartMove() {
  // Check if computer can win
  for (let i = 0; i < gameBoard.length; i++) {
    if (gameBoard[i] === "") {
      gameBoard[i] = "O";
      if (checkWinningMove()) {
        gameBoard[i] = "";
        return i;
      }
      gameBoard[i] = "";
    }
  }

  // Check if player can win and block
  for (let i = 0; i < gameBoard.length; i++) {
    if (gameBoard[i] === "") {
      gameBoard[i] = "X";
      if (checkWinningMove()) {
        gameBoard[i] = "";
        return i;
      }
      gameBoard[i] = "";
    }
  }

  // Try to take center if available
  if (gameBoard[4] === "") {
    return 4;
  }

  // Fall back to random move
  return getRandomMove();
}

// Check if current board state has a winner
function checkWinningMove() {
  for (let { pattern } of winPatterns) {
    const [a, b, c] = pattern;
    if (
      gameBoard[a] &&
      gameBoard[a] === gameBoard[b] &&
      gameBoard[a] === gameBoard[c]
    ) {
      return true;
    }
  }
  return false;
}

// Minimax algorithm for hard difficulty
function getBestMove() {
  let bestScore = -Infinity;
  let bestMove = null;

  for (let i = 0; i < gameBoard.length; i++) {
    if (gameBoard[i] === "") {
      gameBoard[i] = "O";
      let score = minimax(gameBoard, 0, false);
      gameBoard[i] = "";

      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}

// Minimax algorithm helper function
function minimax(board, depth, isMaximizing) {
  // Check for terminal states
  let winner = checkMinimaxWinner();

  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (isBoardFull()) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;

    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = "O";
        let score = minimax(board, depth + 1, false);
        board[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }

    return bestScore;
  } else {
    let bestScore = Infinity;

    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        board[i] = "X";
        let score = minimax(board, depth + 1, true);
        board[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }

    return bestScore;
  }
}

// Check winner for minimax
function checkMinimaxWinner() {
  for (let { pattern } of winPatterns) {
    const [a, b, c] = pattern;
    if (
      gameBoard[a] &&
      gameBoard[a] === gameBoard[b] &&
      gameBoard[a] === gameBoard[c]
    ) {
      return gameBoard[a];
    }
  }
  return null;
}

// Check if board is full (draw)
function isBoardFull() {
  return !gameBoard.includes("");
}

// Check for winner in the game
function checkWinner() {
  for (let i = 0; i < winPatterns.length; i++) {
    const { pattern, line } = winPatterns[i];
    const [a, b, c] = pattern;

    if (
      boxes[a].innerText &&
      boxes[a].innerText === boxes[b].innerText &&
      boxes[a].innerText === boxes[c].innerText
    ) {
      // Draw winning line
      drawWinningLine(line);
      return true;
    }
  }
  return false;
}

// Draw the winning line
function drawWinningLine(line) {
  winningLine.style.display = "block";
  winningLine.style.width = "80%";
  winningLine.style.left = line.x1 + "%";
  winningLine.style.top = line.y1 + "%";

  if (line.angle === 0) {
    winningLine.style.width = "80%";
    winningLine.style.transform = "rotate(0deg)";
  } else if (line.angle === 90) {
    winningLine.style.width = "80%";
    winningLine.style.transform = "rotate(90deg)";
  } else if (line.angle === 45) {
    winningLine.style.width = "115%";
    winningLine.style.transform = "rotate(45deg)";
  } else if (line.angle === 135) {
    winningLine.style.width = "115%";
    winningLine.style.transform = "rotate(135deg)";
  }
}

// Hide winning line
function hideWinningLine() {
  winningLine.style.display = "none";
}

// Disable all boxes
function disableBoxes() {
  for (let box of boxes) {
    box.disabled = true;
  }
}

// Enable and reset all boxes
function enableBoxes() {
  for (let box of boxes) {
    box.disabled = false;
    box.innerText = "";
  }
}

// End the game
function endGame(message) {
  msg.innerText = message;
  msgContainer.classList.remove("hide");
  gameActive = false;
  disableBoxes();
}

// Event listeners for buttons
newGameBtn.addEventListener("click", () => {
  welcomePopup.style.display = "flex";
  resetGame();
  gameActive = false;
});

resetBtn.addEventListener("click", resetGame);
