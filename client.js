const socket = io('http://10.35.5.15:3000');

let currentPlayer;
let isGameOver = false;

socket.on('initialState', (initialState) => {
  currentPlayer = initialState.currentPlayer;
  renderBoard(initialState.board);
});

socket.on('gameOver', (result) => {
    // Manipule o evento de jogo terminado (vitória, derrota, empate)
    isGameOver = true;
    alert(result);
});

socket.on('restartGame', () => {
    // Reinicie o jogo
    isGameOver = false;
    // Lógica para limpar o tabuleiro ou redefinir o estado do jogo
});

function renderBoard(board) {
  const boardElement = document.getElementById('board');
  boardElement.innerHTML = '';

  board.forEach((cell, index) => {
      const cellElement = document.createElement('div');
      cellElement.classList.add('cell');
      cellElement.textContent = cell || ''; // Exibe X ou O na célula

      cellElement.addEventListener('click', () => {
          playMove(index);
      });

      boardElement.appendChild(cellElement);
  });
}

function playMove(cellIndex) {
    if (isGameOver) {
        alert("O jogo já terminou. Reinicie para jogar novamente.");
        return;
    }

    // Implemente a lógica para garantir que a jogada seja válida
    // Envie a jogada para o servidor
    socket.emit('playMove', { cellIndex, currentPlayer });
}

function restartGame() {
    // Solicite ao servidor para reiniciar o jogo
    socket.emit('restartGame');
}
