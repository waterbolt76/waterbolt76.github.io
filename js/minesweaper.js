const SIZE = 40;
const MINES = 300;
let board = [];
let mineMap = [];
let revealed = [];
let aiInterval;

function reset() {
  clearInterval(aiInterval);

  const boardDiv = document.getElementById('board');
  boardDiv.innerHTML = '';
  board = [];
  mineMap = [];
  revealed = [];

  for (let r = 0; r < SIZE; r++) {
    board[r] = [];
    mineMap[r] = Array(SIZE).fill(0);
    revealed[r] = Array(SIZE).fill(false);
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.id = `cell-${r}-${c}`;
      cell.addEventListener('click', () => reveal(r, c));
      cell.addEventListener('contextmenu', e => {
        e.preventDefault();
        flag(r, c);
      });
      board[r][c] = cell;
      boardDiv.appendChild(cell);
    }
  }

  let placed = 0;
  while (placed < MINES) {
    let r = Math.floor(Math.random() * SIZE);
    let c = Math.floor(Math.random() * SIZE);
    if (mineMap[r][c] === 0) {
      mineMap[r][c] = 'M';
      placed++;
    }
  }

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (mineMap[r][c] === 'M') continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          let nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && mineMap[nr][nc] === 'M') count++;
        }
      }
      mineMap[r][c] = count;
    }
  }

  startAI();
}

function checkWin() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (mineMap[r][c] !== 'M' && !revealed[r][c]) {
        return false;
      }
    }
  }
  return true;
}


function reveal(r, c) {
  if (revealed[r][c] || board[r][c].classList.contains('flag')) return;
  revealed[r][c] = true;
  board[r][c].classList.add('revealed');
  let val = mineMap[r][c];
  board[r][c].textContent = val === 0 ? '' : val;

  if (val === 'M') {
    board[r][c].style.background = 'red';
    alert("Game Over! Restarting...");
    reset();
    return;
  }

  if (val === 0) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        let nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
          reveal(nr, nc);
        }
      }
    }
  }
    if (checkWin()) {
    alert("Congratulations! You won!");
    gameOver = true;
    reset();
    gameOver = false;
  }
}

function flag(r, c) {
  if (revealed[r][c]) return;
  board[r][c].classList.toggle('flag');
  board[r][c].textContent = board[r][c].classList.contains('flag') ? '⚑' : '';
}

function getProbabilities() {
  let probMap = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
  let totalMinesLeft = MINES - countFlags();

  let unrevealedCount = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!revealed[r][c] && !board[r][c].classList.contains('flag')) unrevealedCount++;
    }
  }
  let globalProb = totalMinesLeft / unrevealedCount;

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!revealed[r][c] && !board[r][c].classList.contains('flag')) {
        probMap[r][c] = globalProb;
      }
    }
  }

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!revealed[r][c]) continue;
      const val = parseInt(board[r][c].textContent);
      if (isNaN(val) || val === 0) continue;

      let neighbors = [];
      let flagged = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          let nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && !(dr === 0 && dc === 0)) {
            if (board[nr][nc].classList.contains('flag')) flagged++;
            else if (!revealed[nr][nc]) neighbors.push([nr, nc]);
          }
        }
      }

      if (neighbors.length === 0) continue;

      let remainingMines = val - flagged;
      let prob = remainingMines / neighbors.length;

      neighbors.forEach(([nr, nc]) => {
        if (probMap[nr][nc] === null || probMap[nr][nc] < prob) {
          probMap[nr][nc] = prob;
        }
      });
    }
  }

  return probMap;
}

function countFlags() {
  let count = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c].classList.contains('flag')) count++;
    }
  }
  return count;
}

function aiStep() {
  let moved = false;

  let anyRevealed = revealed.flat().some(cell => cell);
  if (!anyRevealed) {
    let r, c;
    do {
      r = Math.floor(Math.random() * SIZE);
      c = Math.floor(Math.random() * SIZE);
    } while (revealed[r][c]);
    reveal(r, c);
    return;
  }

  function neighbors(r, c) {
    let nbrs = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        let nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) nbrs.push([nr, nc]);
      }
    }
    return nbrs;
  }

  let toReveal = new Set();
  let toFlag = new Set();

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!revealed[r][c]) continue;
      const val = parseInt(board[r][c].textContent);
      if (isNaN(val) || val === 0) continue;

      let nbrs = neighbors(r, c);
      let flaggedCount = 0;
      let hiddenCells = [];

      nbrs.forEach(([nr, nc]) => {
        if (board[nr][nc].classList.contains('flag')) flaggedCount++;
        else if (!revealed[nr][nc]) hiddenCells.push([nr, nc]);
      });


      if (flaggedCount === val && hiddenCells.length > 0) {
        hiddenCells.forEach(([nr, nc]) => toReveal.add(`${nr},${nc}`));
      }

      else if (flaggedCount + hiddenCells.length === val && hiddenCells.length > 0) {
        hiddenCells.forEach(([nr, nc]) => toFlag.add(`${nr},${nc}`));
      }
    }
  }


  toFlag.forEach(pos => {
    let [r, c] = pos.split(',').map(Number);
    if (!board[r][c].classList.contains('flag')) {
      flag(r, c);
      moved = true;
    }
  });


  toReveal.forEach(pos => {
    let [r, c] = pos.split(',').map(Number);
    if (!revealed[r][c] && !board[r][c].classList.contains('flag')) {
      reveal(r, c);
      moved = true;
    }
  });

  if (!moved) {
    let probs = getProbabilities();
    let minProb = 1.1;
    let candidates = [];

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!revealed[r][c] && !board[r][c].classList.contains('flag')) {
          let p = probs[r][c] ?? 1;
          if (p < minProb) {
            minProb = p;
            candidates = [[r, c]];
          } else if (p === minProb) {
            candidates.push([r, c]);
          }
        }
      }
    }

    if (candidates.length > 0) {
      let [r, c] = candidates[Math.floor(Math.random() * candidates.length)];
      reveal(r, c);
    }
  }
}

function startAI() {
  aiInterval = setInterval(() => {
    aiStep();
  }, 500);
}

reset();
