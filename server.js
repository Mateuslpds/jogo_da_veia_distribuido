const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let board = Array(9).fill(null);
let currentPlayer = 'X';
let isGameOver = false; // Defina isGameOver aqui no escopo global

const playerSockets = {}; // Objeto para rastrear jogadores associados a sockets

io.on('connection', (socket) => {
    // Associe o jogador X ou O ao socket com base na disponibilidade
    if (!playerSockets['X']) {
        playerSockets['X'] = socket;
        socket.emit('initialState', { board, currentPlayer: 'X' });
    } else if (!playerSockets['O']) {
        playerSockets['O'] = socket;
        socket.emit('initialState', { board, currentPlayer: 'O' });
    } else {
        // Caso ambos os jogadores já estejam conectados, rejeite a conexão
        socket.disconnect();
        return;
    }

    socket.on('playMove', ({ cellIndex }) => {
        if (isGameOver) {
            return;
        }

        const player = Object.keys(playerSockets).find((key) => playerSockets[key] === socket);

        if (player === currentPlayer && board[cellIndex] === null) {
            board[cellIndex] = player;
            io.emit('initialState', { board, currentPlayer });

            if (checkWinner() || board.every((cell) => cell !== null)) {
                io.emit('gameOver', `Resultado: ${checkWinner() ? `VITÓRIA DO JOGADOR ${currentPlayer}` : 'EMPATE'}`);
                isGameOver = true;
            } else {
                // Alternar para o próximo jogador
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            }
        }
    });

    socket.on('restartGame', () => {
        board = Array(9).fill(null);
        currentPlayer = 'X';
        isGameOver = false;
        io.emit('restartGame');
    });

    socket.on('disconnect', () => {
        // Ao desconectar, remova a associação do jogador ao socket
        const player = Object.keys(playerSockets).find((key) => playerSockets[key] === socket);
        if (player) {
            delete playerSockets[player];
        }
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/client.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'client.js'));
});

const port = process.env.PORT || 3000;

server.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});

// Mova checkWinner para o escopo global
function checkWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return true;
        }
    }

    return false;
}
