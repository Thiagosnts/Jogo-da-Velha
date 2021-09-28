const path = require("path");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const express = require("express");
const socketIO = require("socket.io");

const port = process.env.PORT || 80;
const app = express();
const serverHTTP = http.createServer(app);
const serverSocket = socketIO(serverHTTP);

const { Game } = require("./utils/Game");
const games = [new Game(uuidv4()), new Game(uuidv4())];

app.use(express.static(path.join(__dirname, "/../public")));

const updatePlayer = (player, game, socketId) => {
  serverSocket.to(socketId).emit("updatePlayer", {
    player,
    idGame: game.id,
    ready: !game.open,
    board: game.board,
    playerTurn: game.playerTurn,
  });
};

const updateGame = (game) => {
  game.users.forEach((user) => {
    serverSocket.to(user.id).emit("updateGame", {
      draw: game.draw,
      playerX: game.playerX,
      playerO: game.playerO,
      idGame: game.id,
      board: game.board,
      ready: !game.open,
      playerTurn: game.playerTurn,
      playerWinner: game.playerWinner,
    });
  });
};

serverSocket.on("connection", (socketConn) => {
  socketConn.on("playGame", (params, callback) => {
    if (params.idGame) {
      const game = games.find((elem) => elem.id === params.idGame);
      if (game) {
        if (game.playerX === params.nickname) {
          callback({
            status: false,
            message: "Jogador já registrado na partida!",
          });
          game.users.forEach((elem) => {
            if (elem.nickname === params.nickname) {
              elem[params.nickname] = socketConn.id;
            }
          });
          // updatePlayer("X", game, socketConn.id);
          // updateGame(game);
        } else if (game.playerO === params.nickname) {
          callback({
            status: false,
            message: "Jogador já registrado na partida!",
          });
          game.users.forEach((elem) => {
            if (elem.nickname === params.nickname) {
              elem[params.nickname] = socketConn.id;
            }
          });
          // updatePlayer("O", game, socketConn.id);
          // updateGame(game);
        }
      }
    } else {
      const game = games.find((elem) => elem.open);
      if (game) {
        const player = game.addNewPlayer(params.nickname);
        game.users.push({ nickname: params.nickname, id: socketConn.id });
        callback({
          status: false,
          message: "Jogador já registrado na partida!",
        });
        // updatePlayer(player, game, socketConn.id);
        updateGame(game);
      }
    }
  });

  socketConn.on("markBoard", (params, callback) => {
    const game = games.find((elem) => elem.id === params.idGame);

    if (game) {
      const ret = game.markBoard(params.player, params.line, params.column);

      if (ret) {
        callback({ status: false, message: "Jogada marcada com sucesso!" });
        game.checkDraw();
        game.checkWinner();
        updateGame(game);
      }
    }
  });

  socketConn.on("disconnect", () => {
    games.forEach((game) => {
      if (game.users.find((user) => user.id === socketConn.id)) {
        game.users.forEach((user) => {
          serverSocket.to(user.id).emit("disconnect", {});
        });
        game.clear();
      }
    });
  });
});

serverHTTP.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
