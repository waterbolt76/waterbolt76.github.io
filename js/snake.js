const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const box = 10;
const rows = canvas.width / box;

let obstacles = [];
const initialSpeed = 1;
randomSeed = Math.floor(Math.random() * 1000);
let snakes = [
  "lime", "cyan", "magenta", "yellow", "orange", "purple", "blue", "red", "green", "pink", "brown", "white"
].map(color => ({
  color,
  body: [{
    x: Math.floor(Math.random() * rows) * box,
    y: Math.floor(Math.random() * rows) * box,
  }],
  alive: true,
  score: 0
}));


obstacles = spawnObstacles(Math.floor(Math.random() * 10) + 5);
let speed = initialSpeed;
let game;

let foods = spawnFood(10);

function spawnFood(count) {
  const foodItems = [];
  while (foodItems.length < count) {
    let f = {
      x: Math.floor(Math.random() * rows) * box,
      y: Math.floor(Math.random() * rows) * box,
    };
    while (
      snakes.some(s => s.body.some(seg => seg.x === f.x && seg.y === f.y)) ||
      obstacles.some(o => o.x === f.x && o.y === f.y) ||
      foodItems.some(food => food.x === f.x && food.y === f.y)
    ) {
      f = {
        x: Math.floor(Math.random() * rows) * box,
        y: Math.floor(Math.random() * rows) * box,
      };
    }
    foodItems.push(f);
  }
  return foodItems;
}

function spawnObstacles(count) {
  const obs = [];
  while (obs.length < count) {
    let o = {
      x: Math.floor(Math.random() * rows) * box,
      y: Math.floor(Math.random() * rows) * box,
    };
    if (
      !snakes.some(s => s.body.some(seg => seg.x === o.x && seg.y === o.y)) &&
      !obs.some(p => p.x === o.x && p.y === o.y)
    ) obs.push(o);
  }
  return obs;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "red";
  for (let food of foods) {
    ctx.fillRect(food.x, food.y, box, box);
  }

  for (let o of obstacles) {
    ctx.fillStyle = "gray";
    ctx.fillRect(o.x, o.y, box, box);
  }

  for (let snake of snakes) {
    if (!snake.body.length) {
      snake.alive = false;
      continue;
    }

    if (snake.alive) {
      const nextMove = getNextMove(snake.body, snakes.flatMap(s => s.body).concat(obstacles));

      if (nextMove) {
        const newHead = {
          x: snake.body[0].x + nextMove.x,
          y: snake.body[0].y + nextMove.y,
        };

        if (
          newHead.x < 0 || newHead.y < 0 ||
          newHead.x >= canvas.width || newHead.y >= canvas.height ||
          snake.body.some(seg => seg.x === newHead.x && seg.y === newHead.y) ||
          obstacles.some(o => o.x === newHead.x && o.y === newHead.y)
        ) {
          snake.alive = false;
        } else {
          snake.body.unshift(newHead);

          let ateFood = false;
          for (let i = 0; i < foods.length; i++) {
            if (newHead.x === foods[i].x && newHead.y === foods[i].y) {
              snake.score += 1;
              foods.splice(i, 1);
              foods.push(...spawnFood(1));
              speed = Math.max(30, speed - 3);
              restartGameLoop();
              ateFood = true;
              break;
            }
          }

          if (!ateFood) {
            snake.body.pop();
          }
        }
      } else {
        snake.alive = false;
      }
    }

    for (let seg of snake.body) {
      ctx.fillStyle = snake.color;
      ctx.fillRect(seg.x, seg.y, box, box);
    }
  }

  scoreboard.innerText = snakes
    .map(s => `${s.color}: ${s.score} ${s.alive ? "" : "💀"}`)
    .join("\n");

  let aliveSnakes = snakes.filter(s => s.alive);
  if (aliveSnakes.length <= 1) {
    clearInterval(game);
    showResults(aliveSnakes[0]);
  }
}

function getNextMove(snakeBody, allBodies) {
  if (!snakeBody.length) return null;

  const directions = [
    { x: 0, y: -box },
    { x: 0, y: box },
    { x: -box, y: 0 },
    { x: box, y: 0 },
  ];

  const visited = new Set();
  const queue = [{ pos: snakeBody[0], path: [] }];
  const key = p => `${p.x},${p.y}`;

  const isSafe = p =>
    p.x >= 0 && p.x < canvas.width &&
    p.y >= 0 && p.y < canvas.height &&
    !allBodies.some(s => s.x === p.x && s.y === p.y);

  while (queue.length) {
    let { pos, path } = queue.shift();
    if (!pos) continue;

    for (let foodItem of foods) {
      if (pos.x === foodItem.x && pos.y === foodItem.y) {
        return path[0];
      }
    }

    for (let dir of directions) {
      let next = { x: pos.x + dir.x, y: pos.y + dir.y };
      if (isSafe(next) && !visited.has(key(next))) {
        visited.add(key(next));
        queue.push({ pos: next, path: [...path, dir] });
      }
    }
  }

  for (let dir of directions) {
    let test = { x: snakeBody[0].x + dir.x, y: snakeBody[0].y + dir.y };
    if (isSafe(test)) return dir;
  }

  return null;
}

function resetGame() {
  obstacles = spawnObstacles(Math.floor(Math.random() * 10) + 5);
  speed = initialSpeed;
  foods = spawnFood(10);

  snakes = [
    "lime", "cyan", "magenta", "yellow", "orange", "purple", "blue", "red", "green", "pink", "brown", "white"
  ].map(color => ({
    color,
    body: [{
      x: Math.floor(Math.random() * rows) * box,
      y: Math.floor(Math.random() * rows) * box,
    }],
    alive: true,
    score: 0
  }));

  restartGameLoop();
}

function showResults(winner) {
  let message = "";
  if (winner) {
    message += `🏆 ${winner.color.toUpperCase()} WINS!\n\n`;
  } else {
    message += "🪦 Draw — no survivors.\n\n";
  }

  message += "🍎 Final Scores:\n";
  for (let s of snakes) {
    message += `${s.color}: ${s.score}\n`;
  }

  alert(message);

  setTimeout(resetGame, 1000); // wait 1 second before restarting
}


function restartGameLoop() {
  clearInterval(game);
  game = setInterval(draw, speed);
}

restartGameLoop();
