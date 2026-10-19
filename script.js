const overlay = document.getElementById("overlay");
const winMoves = document.getElementById("win-moves");
const winTime = document.getElementById("win-time");
const SOLVED = [1, 2, 3, 4, 5, 6, 7, 8, 0];

// TILES MAKING:

const board = document.getElementById("board");

let tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];

function renderBoard() {
  board.innerHTML = "";
  tiles.forEach(function (value, index) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    if (value === 0) {
      tile.classList.add("empty");
    } else {
      tile.textContent = value;
    }
    // When this tile is clicked, try to move the tile at this position
    tile.addEventListener("click", function () {
      moveTile(index);
    });
    board.appendChild(tile);
  });
}

// renderBoard();

const SIZE = 3;

function getEmptyIndex() {
  return tiles.indexOf(0);
}

function isNextToEmpty(index) {
  const emptyIndex = getEmptyIndex();
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  const emptyRow = Math.floor(emptyIndex / SIZE);
  const emptyCol = emptyIndex % SIZE;
  const distance = Math.abs(row - emptyRow) + Math.abs(col - emptyCol);
  return distance === 1;
}

//MOVING THE TILES

function moveTile(index) {
  if (!isNextToEmpty(index)) {
    return;
  }

  startTimer();

  const emptyIndex = getEmptyIndex();

  const temp = tiles[index];

  tiles[index] = tiles[emptyIndex];

  tiles[emptyIndex] = temp;

  moves++;

  updateMoves();

  msg.textContent = "Nice move. Keep going!";

  renderBoard();

  checkWin();
}

// MOVE COUNT and TIMER:

const movesCount = document.getElementById("moves-count");
const timerCount = document.getElementById("timer-count");
const msg = document.getElementById("msg");

let moves = 0;
let seconds = 0;
let timerId = null;

function updateMoves() {
  movesCount.textContent = String(moves).padStart(2, "0");
}

function updateTimer() {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  timerCount.textContent =
    String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
}

function startTimer() {
  if (timerId !== null) {
    return;
  }
  timerId = setInterval(function () {
    seconds++;

    updateTimer();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function resetTimer() {
  stopTimer();
  seconds = 0;
  updateTimer();
}

// SHUFFLE:

const shuffleBtn = document.getElementById("shuffle-btn");

function shuffle() {
  tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  for (let i = 0; i < 100; i++) {
    const movable = [];

    tiles.forEach(function (value, index) {
      if (isNextToEmpty(index)) {
        movable.push(index);
      }
    });
    const pick = movable[Math.floor(Math.random() * movable.length)];
    const emptyIndex = getEmptyIndex();
    tiles[emptyIndex] = tiles[pick];
    tiles[pick] = 0;
  }
  moves = 0;
  resetTimer();
  updateMoves();
  msg.textContent = "Tap a number beside the empty space.";

  renderBoard();
}

shuffleBtn.addEventListener("click", shuffle);

// RESET:

const resetBtn = document.getElementById("reset-btn");

function reset() {
  tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  moves = 0;
  resetTimer();
  updateMoves();
  msg.textContent = "Tap a number beside the empty space.";

  //   renderBoard();
  shuffle();
}
// Show 00 and 00:00 on the screen when the page first loads
updateMoves();
updateTimer();
shuffle();
resetBtn.addEventListener("click", reset);

// CHECK:
function isSolved() {
  return tiles.join() === SOLVED.join();
}

function checkWin() {
  if (!isSolved()) {
    return;
  }
  stopTimer();

  winMoves.textContent = moves;
  winTime.textContent = timerCount.textContent;

  overlay.classList.add("show");
}

// PLAY AGAIN:

const playAgainBtn = document.getElementById("play-again");

playAgainBtn.addEventListener("click", function () {
  overlay.classList.remove("show");

  shuffle();
});
