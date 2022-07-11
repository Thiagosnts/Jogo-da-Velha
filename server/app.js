const fs = require('fs');
const path = require("path");
const http = require("http");
const https = require('https');
const { v4: uuidv4 } = require("uuid");
const express = require("express");
const socketIO = require("socket.io");

const privateKey = fs.readFileSync('./certificado/privkey.pem', 'utf8');
const certificate = fs.readFileSync('./certificado/cert.pem', 'utf8');
const ca = fs.readFileSync('./certificado/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

const port = process.env.PORT || 80;
const app = express();
const serverHTTP = http.createServer(app);
// const httpsServer = https.createServer(credentials, app);

const serverSocket = socketIO(serverHTTP);
// const serverSocket = socketIO(httpsServer);


const { Game } = require("./utils/Game");
const games = [new Game(uuidv4()), new Game(uuidv4())];


app.use(function(req, res, next) {
  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains') // 2 years
  }
  next()
})



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
        if (game.playerX === params.nome) {
          callback({
            status: false,
            message: "Jogador já registrado na partida!",
          });
          game.users.forEach((elem) => {
            if (elem.nome === params.nome) {
              elem[params.nome] = socketConn.id;
            }
          });
          // updatePlayer("X", game, socketConn.id);
          // updateGame(game);
        } else if (game.playerO === params.nome) {
          callback({
            status: false,
            message: "Jogador já registrado na partida!",
          });
          game.users.forEach((elem) => {
            if (elem.nome === params.nome) {
              elem[params.nome] = socketConn.id;
            }
          });
          // updatePlayer("O", game, socketConn.id);
          // updateGame(game);
        }
      }
    } else {
      const game = games.find((elem) => elem.open);
      if (game) {
        const player = game.addNewPlayer(params.nome);
        game.users.push({ nome: params.nome, id: socketConn.id });
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


// httpsServer.listen(443, () => {
// 	console.log('HTTPS Server running on port 443');
// });