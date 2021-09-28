const socketClient = io();

let idGame;
let board = [];
let player = "";
let draw = false;
let ready = false;
let playerTurn = "";
let playerWinner = "";
let showDisconnectOpponent = true;

const playerEl = document.getElementById("player");
const cellsEl = document.querySelectorAll(".cell");
const idGameEl = document.getElementById("id-game");
const playerTurnEl = document.getElementById("player-turn");

const backHome = function (message) {
  alert(message);
  window.location.href = "index.html";
};

const readyGame = function () {
  if (ready) {
    cellsEl.forEach(function (cell) {
      cell.addEventListener("click", function (event) {
        event.preventDefault();

        const pos = cell.id.split("-");
        pos.splice(0, 1);

        if (player && player === playerTurn) {
          socketClient.emit(
            "markBoard",
            { idGame: idGame, player: player, line: pos[0], column: pos[1] },
            function (err) {
              console.log(err.message);
            }
          );
        }
      });
    });
  }
};

const winner = function () {
  if (playerWinner && player === playerWinner) {
    showDisconnectOpponent = false;
    backHome(`Parabéns ${params.nickname}, você ganhou =)`);
  } else if (playerWinner && player !== playerWinner) {
    showDisconnectOpponent = false;
    backHome(`Que pena ${params.nickname}, você perdeu =(`);
  } else if (draw) {
    showDisconnectOpponent = false;
    backHome(`Empate =|`);
  }
};

const updateScreen = function () {
  idGameEl.innerHTML = "ID Partida: " + idGame;
  playerEl.innerHTML = "Seu jogador: " + player;
  playerTurnEl.innerHTML = "Jogador da vez: " + playerTurn;

  cellsEl.forEach((cell) => {
    const pos = cell.id.split("-");
    pos.splice(0, 1);

    cell.innerHTML = board[pos[0]][pos[1]];
  });
};

const params = JSON.parse(
  '{"' +
    decodeURI(window.location.search.substring(1))
      .replace(/&/g, '","')
      .replace(/\+/g, " ")
      .replace(/=/g, '":"') +
    '"}'
);

document.getElementById("btn-home").addEventListener("click", function (event) {
  event.preventDefault();

  window.location.href = "index.html";
});

socketClient.on("connect", function () {
  socketClient.emit(
    "playGame",
    { nickname: params.nickname, idGame: idGame },
    function (err) {
      if (err.status) {
        alert(err.message);
      }
    }
  );
});

socketClient.on("disconnect", function () {
  if (showDisconnectOpponent) {
    backHome(
      "Seu oponente foi desconectado, você será redirecionado para a tela inicial!"
    );
  }
});

// socketClient.on("updatePlayer", function (data) {
//   console.log(data.ready);
//   board = data.board;
//   ready = data.ready;
//   idGame = data.idGame;
//   player = data.player;
//   playerTurn = data.playerTurn;
//   updateScreen();
//   readyGame();
//   winner();
// });

socketClient.on("updateGame", function (data) {
  draw = data.draw;
  ready = data.ready;
  board = data.board;
  idGame = data.idGame;
  playerTurn = data.playerTurn;
  playerWinner = data.playerWinner;
  if (data.playerX === params.nickname) {
    player = "X";
  } else {
    player = "O";
  }
  updateScreen();
  readyGame();
  winner();
});
