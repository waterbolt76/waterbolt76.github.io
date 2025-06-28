const weightedSymbols = [
  "💎", "💎",
  "🍒", "🍒", "🍒", "🍒", "🍒", "🍒",
  "🔔", "🔔", "🔔", "🔔",
  "7️⃣",
  "🍋", "🍋", "🍋", "🍋", "🍋",
  "⭐"
];

const grid = document.getElementById("grid");
let balance = 10;

function initGrid() {
  grid.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = "❔";
    grid.appendChild(cell);
  }
  updateBalanceUI();
  updateWinUI(0);
  setMessage("Welcome! Spin to win!");
}

function normalizeSymbol(sym) {
  return sym.normalize('NFC');
}

function spin() {
  const powerPlay = document.getElementById("powerPlay").checked;
  const spinCost = powerPlay ? 1 : 0.5;

  if (balance < spinCost) {
    setMessage("💸 Not enough funds!");
    return;
  }

  const cells = document.querySelectorAll(".cell");
  let result = [];

  for (let i = 0; i < 9; i++) {
    let sym = weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)];
    if (powerPlay && sym === "💎") sym = "⭐"; // PowerPlay turns diamonds into wild stars
    result.push(sym);
    cells[i].textContent = sym;
  }

  balance -= spinCost;

  let win = checkWin(result);

  if (powerPlay) {
    win *= 1.5; // PowerPlay pays 1.5x more
  }

  balance += win;

  updateBalanceUI();
  updateWinUI(win);
}

function checkWin(result) {
  const winLines = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 4, 8], // Diagonal TL-BR
    [2, 4, 6]  // Diagonal TR-BL
  ];

  let totalWin = 0;
  let winningSymbols = [];

  for (let line of winLines) {
    const [i, j, k] = line;
    const a = result[i];
    const b = result[j];
    const c = result[k];

    if (
      normalizeSymbol(a) === normalizeSymbol(b) &&
      normalizeSymbol(b) === normalizeSymbol(c)
    ) {
      const winAmount = getWinAmount(a);
      if (winAmount > 0) {
        totalWin += winAmount;
        winningSymbols.push(a);
      }
    }
  }

  if (totalWin > 0) {
    const uniqueSymbols = [...new Set(winningSymbols)].join(", ");
    setMessage(`🎉 You won £${totalWin.toFixed(2)} on ${winningSymbols.length} line(s)! Symbols: ${uniqueSymbols}`);
  } else {
    setMessage("No win – try again!");
  }

  return totalWin;
}

function getWinAmount(symbol) {
  switch (symbol) {
    case "⭐": return 10;
    case "💎": return 7;
    case "7️⃣": return 5;
    case "🔔": return 3;
    case "🍒": return 2;
    case "🍋": return 1;
    default: return 0;
  }
}

function topUp() {
  const input = document.getElementById("topupAmount");
  const amount = parseFloat(input.value);

  if (!amount || amount <= 0) {
    setMessage("Please enter a valid amount.");
    return;
  }

  balance += amount;
  updateBalanceUI();
  setMessage(`💳 Added £${amount.toFixed(2)} to your balance.`);
  input.value = '';
}

function updateBalanceUI() {
  document.getElementById("balance").textContent = balance.toFixed(2);
}

function updateWinUI(win) {
  document.getElementById("win").textContent = win.toFixed(2);
}

function setMessage(msg) {
  document.getElementById("message").textContent = msg;
}

window.onload = initGrid;
