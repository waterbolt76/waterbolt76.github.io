const game = document.getElementById("game-2048");
let board = [];
  let aiPlaying = false;

  function createBoard() {
    board = Array(4).fill(null).map(() => Array(4).fill(0));
    addTile();
    addTile();
    drawBoard();
  }

  function drawBoard() {
    game.innerHTML = "";
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const value = board[row][col];
        const tile = document.createElement("div");
        tile.className = "tile";
        if (value) {
          tile.textContent = value;
          tile.dataset.value = value;
        }
        game.appendChild(tile);
      }
    }
  }

  function addTile() {
    let empty = [];
    board.forEach((row, r) => row.forEach((val, c) => {
      if (val === 0) empty.push({ r, c });
    }));
    if (empty.length === 0) return;
    const { r, c } = empty[Math.floor(Math.random() * empty.length)];
    board[r][c] = Math.random() < 0.9 ? 2 : 4;
  }

  function cloneBoard(b) {
    return b.map(row => row.slice());
  }

  function boardsEqual(b1, b2) {
    return b1.flat().every((v, i) => v === b2.flat()[i]);
  }

  function move(direction, simulate = false) {
    let newBoard = cloneBoard(board);
    let moved = false;

    for (let i = 0; i < 4; i++) {
      let row = direction === "up" || direction === "down" ?
                newBoard.map(r => r[i]) : newBoard[i];

      if (direction === "right" || direction === "down") row = row.reverse();

      let compressed = row.filter(x => x);
      for (let j = 0; j < compressed.length - 1; j++) {
        if (compressed[j] === compressed[j + 1]) {
          compressed[j] *= 2;
          compressed[j + 1] = 0;
        }
      }
      compressed = compressed.filter(x => x);
      while (compressed.length < 4) compressed.push(0);
      if (direction === "right" || direction === "down") compressed = compressed.reverse();

      for (let j = 0; j < 4; j++) {
        if (direction === "left" || direction === "right") {
          if (newBoard[i][j] !== compressed[j]) moved = true;
          newBoard[i][j] = compressed[j];
        } else {
          if (newBoard[j][i] !== compressed[j]) moved = true;
          newBoard[j][i] = compressed[j];
        }
      }
    }

    if (!simulate && moved) {
      board = newBoard;
      addTile();
      drawBoard();
      checkGameOver();
    }

    return simulate ? (moved ? newBoard : null) : moved;
  }

  function checkGameOver() {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === 0) return;
        if (c < 3 && board[r][c] === board[r][c + 1]) return;
        if (r < 3 && board[r][c] === board[r + 1][c]) return;
      }
    }
    alert("Game Over!");
    aiPlaying = false;
  }

  function aiStep() {
    const directions = ["up", "left", "right", "down"];
    for (let dir of directions) {
      const sim = move(dir, true);
      if (sim) {
        move(dir);
        break;
      }
    }
  }

  function aiLoop() {
    if (!aiPlaying) return;
    aiStep();
    setTimeout(aiLoop, 100);
  }
  function checkGameOver() {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return;
      if (c < 3 && board[r][c] === board[r][c + 1]) return;
      if (r < 3 && board[r][c] === board[r + 1][c]) return;
    }
  }
  setTimeout(() => {
    createBoard();
    if (aiPlaying) aiLoop(); // restart AI
  }, 1000);
}


  window.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") move("up");
    else if (e.key === "ArrowDown") move("down");
    else if (e.key === "ArrowLeft") move("left");
    else if (e.key === "ArrowRight") move("right");
    else if (e.key.toLowerCase() === "a") {
      aiPlaying = !aiPlaying;
      if (aiPlaying) aiLoop();
    }
  });

  createBoard();