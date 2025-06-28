const moves = ['rock', 'paper', 'scissors'];
let playerHistory = [];

function aiPredict() {
  if (playerHistory.length === 0) {
    // No data yet, pick randomly
    return moves[Math.floor(Math.random() * moves.length)];
  }
  
  // Count frequencies of last 5 moves (or fewer if not enough history)
  const recent = playerHistory.slice(-5);
  const freq = {rock: 0, paper: 0, scissors: 0};
  recent.forEach(move => freq[move]++);
  
  // Predict player's next move as their most frequent recent move
  let predicted = 'rock';
  let maxCount = freq['rock'];
  for (const move of moves) {
    if (freq[move] > maxCount) {
      predicted = move;
      maxCount = freq[move];
    }
  }
  
  return predicted;
}

function aiMove() {
  const predictedPlayer = aiPredict();
  // AI picks the winning move against the predicted player move
  switch(predictedPlayer) {
    case 'rock': return 'paper';
    case 'paper': return 'scissors';
    case 'scissors': return 'rock';
  }
}

function playerMove(playerChoice) {
  playerHistory.push(playerChoice);
  const aiChoice = aiMove();
  
  let winner = '';
  if (playerChoice === aiChoice) winner = "It's a tie!";
  else if (
    (playerChoice === 'rock' && aiChoice === 'scissors') ||
    (playerChoice === 'paper' && aiChoice === 'rock') ||
    (playerChoice === 'scissors' && aiChoice === 'paper')
  ) winner = 'You win!';
  else winner = 'AI wins!';
  
  document.getElementById('result').innerHTML = `
    You: ${playerChoice} <br />
    AI: ${aiChoice} <br />
    <strong>${winner}</strong>
  `;
}
