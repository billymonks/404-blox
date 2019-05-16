const rowMaxLen = 8;
const colMaxLen = 8;
let colorBoard;

const colors = [rgb(255, 0, 0), rgb(0, 255, 0), rgb(0, 0, 255), rgb(0, 0, 0)];

const createColorBoard = () => {
  if (!colorBoard) {
    for (row = 0; row < rowMaxLen; row = row+1) {
      for (col = 0; col < colMaxLen; col = col+1) {
        colorBoard[row][col] = colors[Math.floor(Math.random() * 4)];
      }
    }
  }
};

const deleteBlocks = (row, col) => {
  if (row < 0 || row > rowMaxLen || col < 0 || col > colMaxLen) {
    return;
  }
  let count = -1;
  const currentColor = colorBoard[row][col];
  if (
    (row - 1 >= 0 && colorBoard[row - 1][col] === currentColor) ||
    (row + 1 < rowMaxLen && colorBoard[row + 1][col] === currentColor) ||
    (col - 1 >= 0 && colorBoard[row][col - 1] === currentColor) ||
    (col + 1 < colMaxLen && colorBoard[row][col + 1] === currentColor)
  ) {
    count = count + deleteNeighbors(row - 1, col, currentColor, DOWN);
    count = count + deleteNeighbors(row + 1, col, currentColor, UP);
    count = count + deleteNeighbors(row, col - 1, currentColor, RIGHT);
    count = count + deleteNeighbors(row, col + 1, currentColor, LEFT);
    newRefreshedBoard();
  }
  return count;
}

const deleteNeighbors = (row, col, color, direction) => {
  if (row < 0 || row >= rowMaxLen || col < 0 || col >= colMaxLen) {
    return 0;
  }
  if (colorBoard[row][col] != color) {
    return 0;
  }
  let count = 1;
  colorBoard[row][col] = 0;
  if (direction != UP) {
    count = count + deleteNeighbors(row - 1, col, color, DOWN);
  }
  if (direction != DOWN) {
    count = count + deleteNeighbors(row + 1, col, color, UP);
  }
  if (direction != LEFT) {
    count = count + deleteNeighbors(row, col - 1, color, RIGHT);
  }
  if (direction != RIGHT) {
    count = count + deleteNeighbors(row, col + 1, color, LEFT);
  }
  return count;
}

const newRefreshedBoard = () => {
  for(col = 0; col < colMaxLen; col = col+1) {
    let nextEmptyRow = rowMaxLen - 1;
    let nextOccupiedRow = nextEmptyRow;
    while (nextOccupiedRow >= 0 && nextEmptyRow >= 0) {
      while (nextEmptyRow >= 0 && colorBoard[nextEmptyRow][col] !== 0) {
        nextEmptyRow = nextEmptyRow - 1;
      }
      if (nextEmptyRow >= 0) {
        nextOccupiedRow = nextEmptyRow - 1;
        while (nextOccupiedRow >= 0 && colorBoard[nextOccupiedRow][col] === 0) {
          nextOccupiedRow = nextOccupiedRow - 1;
        }
        if (nextOccupiedRow >= 0) {
          colorBoard[nextEmptyRow][col] = colorBoard[nextOccupiedRow][col];
          colorBoard[nextOccupiedRow][col] = 0;
        }
      }
    }
  }
  let nextEmptyCol = 0;
  let nextOccupiedCol = nextEmptyCol;
  while (nextEmptyCol < colMaxLen && nextOccupiedCol < colMaxLen) {
    while (nextEmptyCol < colMaxLen  && colorBoard[rowMaxLen - 1][nextEmptyCol] != 0) {
      nextEmptyCol = nextEmptyCol + 1;
    }
    if (nextEmptyCol < colMaxLen) {
      nextOccupiedCol = nextEmptyCol + 1;
      while (nextOccupiedCol < colMaxLen && colorBoard[rowMaxLen - 1][nextOccupiedCol] === 0) {
        nextOccupiedCol = nextOccupiedCol + 1;
      }
      if (nextOccupiedCol < colMaxLen) {
        for (row = 0; row < rowMaxLen; row = row+1) {
          colorBoard[row][nextEmptyCol] = colorBoard[row][nextOccupiedCol];
          colorBoard[row][nextOccupiedCol] = 0;
        }
      }
    }
  }
}

const gameCompletionCheck = () => {
  for (col = 0; col < colMaxLen; col++) {
    for (row = rowMaxLen - 1; row >= 0; row --) {
      const currentColor = colorBoard[row][col];
      if (currentColor === 0) {
        break;
      } else {
        if (row - 1 >= 0 && colorBoard[row - 1][col] === currentColor) {
          return false;
        } else if (col + 1 < colMaxLen && colorBoard[row][col + 1] === currentColor) {
          return false;
        }
      }
    }
  }
  return true;
}
