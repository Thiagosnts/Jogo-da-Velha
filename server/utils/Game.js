class Game {
  constructor(id) {
    this.id = id;
    this.open = true;
    this.draw = false;
    this.users = [];
    this.playerX;
    this.playerO;
    this.playerWinner;
    this.playerTurn = "X";
    this.movements = 9;
    this.board = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
  }

  checkReadyToInitGame() {
    if (this.playerX && this.playerO) {
      this.open = false;
    } else {
      this.open = true;
    }
  }

  checkDraw() {
    if (this.movements <= 0) {
      this.draw = true;
    }
  }

  checkWinner() {
    if (
      (this.board[1][1] &&
        this.board[0][0] === this.board[1][1] &&
        this.board[1][1] === this.board[2][2]) ||
      (this.board[1][1] &&
        this.board[0][2] === this.board[1][1] &&
        this.board[1][1] === this.board[2][0])
    ) {
      this.playerWinner = this.board[1][1];
    }
    for (let index = 0; index < 3; index++) {
      if (
        this.board[index][0] &&
        this.board[index][0] === this.board[index][1] &&
        this.board[index][0] === this.board[index][2]
      ) {
        this.playerWinner = this.board[index][0];
      }
      if (
        this.board[0][index] &&
        this.board[0][index] === this.board[1][index] &&
        this.board[0][index] === this.board[2][index]
      ) {
        this.playerWinner = this.board[0][index];
      }
    }
  }

  turnPlayer() {
    this.playerTurn = this.playerTurn === "X" ? "O" : "X";
  }

  addNewPlayer(playerId) {
    if (!this.playerX) {
      this.playerX = playerId;
      this.checkReadyToInitGame();
      return "X";
    }

    if (!this.playerO) {
      this.playerO = playerId;
      this.checkReadyToInitGame();
      return "O";
    }
  }

  clear() {
    this.users = [];
    this.open = true;
    this.draw = false;
    this.movements = 9;
    this.playerTurn = "X";
    this.playerX = undefined;
    this.playerO = undefined;
    this.playerWinner = undefined;
    this.board = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
  }

  markBoard(player, line, column) {
    if (!this.board[line][column]) {
      this.board[line][column] = player;
      this.movements -= 1;
      this.turnPlayer();
      return true;
    }
    return false;
  }
}

module.exports = { Game };
