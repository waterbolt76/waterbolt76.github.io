const GRID_ROWS = 9;
    const GRID_COLS = 9;
    const CANVAS_WIDTH = 240;
    const CANVAS_HEIGHT = 400;

    class TetrisGame {
      constructor(canvas) {
        this.context = canvas.getContext('2d');
        this.context.scale(20, 20);
        this.arena = this.createMatrix(12, 20);
        this.colors = [null, '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'];
        this.pieces = 'TJLOSZI';
        this.matrixTypes = this.createMatrixTypes();

        this.player = {
          pos: {x: 0, y: 0},
          matrix: null,
          score: 0,
          type: null
        };

        this.dropInterval = 1;
        this.dropCounter = 0;
        this.lastTime = 0;

        this.playerReset();
        this.update();
      }

      createMatrix(w, h) {
        const matrix = [];
        while (h--) matrix.push(new Array(w).fill(0));
        return matrix;
      }

      createMatrixTypes() {
        const base = {
          T: [[ [0,1,0], [1,1,1], [0,0,0] ]],
          J: [[ [1,0,0], [1,1,1], [0,0,0] ]],
          L: [[ [0,0,1], [1,1,1], [0,0,0] ]],
          O: [[ [2,2], [2,2] ]],
          S: [[ [0,3,3], [3,3,0], [0,0,0] ]],
          Z: [[ [4,4,0], [0,4,4], [0,0,0] ]],
          I: [[ [0,0,0,0], [5,5,5,5], [0,0,0,0], [0,0,0,0] ]]
        };
        for (const key in base) {
          const m = [];
          let shape = base[key][0];
          for (let i = 0; i < 4; i++) {
            m.push(shape.map(r => r.slice()));
            shape = this.rotate(shape);
          }
          base[key] = m;
        }
        return base;
      }

      rotate(matrix) {
        const m = matrix.map(r => r.slice());
        for (let y = 0; y < m.length; ++y) {
          for (let x = 0; x < y; ++x) {
            [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
          }
        }
        return m.map(row => row.reverse());
      }

      collide(arena, player) {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
          for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
              return true;
            }
          }
        }
        return false;
      }

      merge(arena, player) {
        player.matrix.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value) {
              arena[y + player.pos.y][x + player.pos.x] = value;
            }
          });
        });
      }

      arenaSweep() {
        outer: for (let y = this.arena.length - 1; y >= 0; --y) {
          for (let x = 0; x < this.arena[y].length; ++x) {
            if (this.arena[y][x] === 0) continue outer;
          }
          this.arena.splice(y, 1);
          this.arena.unshift(new Array(12).fill(0));
          this.player.score += 100;
        }
      }

      drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value) {
              this.context.fillStyle = this.colors[value];
              this.context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
          });
        });
      }

      draw() {
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.drawMatrix(this.arena, {x: 0, y: 0});
        this.drawMatrix(this.player.matrix, this.player.pos);
      }

      dropStep() {
        this.player.pos.y++;
        if (this.collide(this.arena, this.player)) {
          this.player.pos.y--;
          this.merge(this.arena, this.player);
          this.arenaSweep();
          this.player.score += 10;
          this.playerReset();
        }
      }

      evaluateBoard(board) {
        let aggregateHeight = 0, holes = 0, bumpiness = 0, prevHeight = null;
        for (let x = 0; x < board[0].length; x++) {
          let y = 0;
          while (y < board.length && board[y][x] === 0) y++;
          let height = board.length - y;
          aggregateHeight += height;
          for (let i = y + 1; i < board.length; i++) {
            if (board[i][x] === 0) holes++;
          }
          if (prevHeight !== null) bumpiness += Math.abs(prevHeight - height);
          prevHeight = height;
        }
        return -0.5 * aggregateHeight - 0.7 * holes - 0.3 * bumpiness;
      }

      simulateDrop(arena, pieceMatrix, offsetX) {
        const testPlayer = {
          matrix: pieceMatrix,
          pos: {x: offsetX, y: 0}
        };
        while (!this.collide(arena, testPlayer)) testPlayer.pos.y++;
        testPlayer.pos.y--;
        const newArena = arena.map(r => r.slice());
        this.merge(newArena, testPlayer);
        return this.evaluateBoard(newArena);
      }

      findBestMove() {
        let best = null, bestScore = -Infinity;
        const piece = this.player.type;
        const rotations = this.matrixTypes[piece];
        for (let r = 0; r < rotations.length; r++) {
          const mat = rotations[r];
          for (let x = -2; x < this.arena[0].length; x++) {
            const testPlayer = {matrix: mat, pos: {x, y: 0}};
            if (this.collide(this.arena, testPlayer)) continue;
            const score = this.simulateDrop(this.arena, mat, x);
            if (score > bestScore) {
              bestScore = score;
              best = {matrix: mat, x};
            }
          }
        }
        if (best) {
          this.player.matrix = best.matrix;
          this.player.pos.x = best.x;
        }
      }

      playerReset() {
        const type = this.pieces[Math.floor(Math.random() * this.pieces.length)];
        this.player.matrix = this.matrixTypes[type][0];
        this.player.type = type;
        this.player.pos.y = 0;
        this.player.pos.x = 4;

        if (this.collide(this.arena, this.player)) {
          this.arena.forEach(row => row.fill(0));
          this.player.score = 0;
        }

        this.findBestMove();
      }

      update(time = 0) {
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
          this.dropStep();
          this.dropCounter = 0;
        }
        this.draw();
        requestAnimationFrame(this.update.bind(this));
      }
    }

    // Build grid of canvas elements
    const grid = document.getElementById("grid");
    grid.style.gridTemplateColumns = `repeat(${GRID_COLS}, ${CANVAS_WIDTH}px)`;

    for (let i = 0; i < GRID_ROWS * GRID_COLS; i++) {
      const canvas = document.createElement("canvas");
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      grid.appendChild(canvas);
      new TetrisGame(canvas);
    }