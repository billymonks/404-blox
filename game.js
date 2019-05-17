const config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 800,
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let gems = [];

const colors = {
  0: 'red',
  1: 'yellow',
  2: 'navy',
  3: 'aqua',
  4: 'aaa',
  5: 'www',
};

const boardWidth = 8;
const boardHeight = 8;
const removeSingles = false;
const colorCount = 4;

let score = 0;

let game = new Phaser.Game(config);
let gameInit = null;

let scoreDisplay = null;
let resetButton = null;
let messageBox = null;

let deadGems = [];

let littlePoppa = null;
let bigPoppa = null;

function preload ()
{
  this.load.audio('littlePop', 'assets/littlePop.mp3');
  this.load.audio('bigPop', 'assets/bigPop.mp3');
  this.load.audio('squish', 'assets/squish.mp3');
  this.load.spritesheet("gems", "assets/gems.png", {
    frameWidth: 100,
    frameHeight: 100
  });
}

function create ()
{
  gameInit = this;
  createSolvableBoard(this);
  scoreDisplay = this.add.text(820, 20, 'Score\n0', { fontFamily: '"Roboto Slab"', color: "white", fontSize: 36 });
  resetButton = this.add.text(820, 160, 'Reset Game', { fontFamily: '"Roboto Slab"', color: "#111", fontSize: 24, backgroundColor: '#ddd', padding: 10 });
  resetButton.setInteractive().on('pointerdown', function (pointer) {
    resetGame();
  });
  messageBox = this.add.text(400, 300, '', { fontFamily: '"Roboto Slab"', color: "white", fontSize: 36 });

  littlePoppa = this.sound.add('littlePop');
  bigPoppa = this.sound.add('bigPop');
}

function update ()
{
  animateSprites();
  animateDeadGems();
}

function createSolvableBoard() {
  for (var i = 0; i < boardWidth; i++) {
    gems[i] = [];
    for (var j = 0; j < boardHeight; j++) {
      const colorIndex = Math.floor(Math.random() * colorCount);
      gems[i][j] =
        {
          sprite: gameInit.add.sprite(i * 100 + 50, j * 100 - 1000, "gems").setInteractive(), // -1000 on initial y position so the gems slide in at start
          color: colors[colorIndex],
          colorIndex: colorIndex, // remove when each gem has its own sprite/no longer using setframe
          x: i,
          y: j,
        };
      let gem = gems[i][j];
      gems[i][j].sprite.setFrame(gems[i][j].colorIndex);
      gems[i][j].sprite.on('pointerdown', function (pointer) {
        clickGem(gem);
      });
    }
  }

  if (!solvable()) {
    resetGame();
  }
}

function resetGame() {
  score = 0;
  scoreDisplay.text = 'Score\n' + score;
  resetBoard();
}

function resetBoard() {
  for(let i=0; i < boardWidth; i++) {
    if (gems[i]) {
      for (let j = 0; j < boardHeight; j++) {
        if (gems[i][j]) {
          gems[i][j].sprite.destroy();
        }
      }
    }
  }

  messageBox.setText('');
  createSolvableBoard();
}

function checkForClear() {
  return gems[0][boardHeight - 1] === null;
}

function animateDeadGems() {
  for (let i = 0; i < deadGems.length; i++) {
    deadGems[i].sprite.angle += 36;
    deadGems[i].sprite.scaleX *= 0.85;
    deadGems[i].sprite.scaleY *= 0.85;
  }
}

function animateSprites() {
  for (var i=0; i < boardWidth; i++) {
    for (var j=0; j < boardHeight; j++) {

      let gem = gems[i][j];

      if(!gem)
        continue;

      gem.sprite.x = Phaser.Math.Interpolation.Bezier([gem.sprite.x, i*100+50], .175);
      gem.sprite.y = Phaser.Math.Interpolation.Bezier([gem.sprite.y, j*100+50], .175);
    }
  }
}

function clickGem(gem) {
  removeGems(gem);
  if (solvable()===false && !checkForClear()) {
    messageBox.setText('Game Over');
  }
}

function removeGems(gem) {
  const color = gem.color;
  let markedGems = [];
  checkNeighbors(gem, color, markedGems);
  //console.log(markedGems);
  if((!removeSingles && markedGems.length > 1) || (removeSingles)) {

    if (markedGems.length < 4) {
      littlePoppa.play();
    } else {
      bigPoppa.play();
    }

    score += Math.pow(2, markedGems.length);
    scoreDisplay.text = 'Score\n' + score;
    for (let i = 0; i < markedGems.length; i++) {
      removeGem(markedGems[i]);
    }
  }

  setTimeout(function() {
    dropGems();
    slideGems();
    if (checkForClear()) {
      messageBox.setText('Stage Cleared!');
      setTimeout(function() {
        resetBoard();
      }, 3000);
    }
  }, 400);

}

function removeGem(gem) {

  gems[gem.x][gem.y] = null;
  gem.sprite.input.enable = false;
  deadGems.push(gem);
  const deadGemIndex = deadGems.length - 1;


  setTimeout(function(){
    deadGemIndex.splice(deadGemIndex, 1);
    gem.sprite.destroy();
  }, 400);

}



function moveGem(gem, x, y) {
  gems[gem.x][gem.y] = null;
  gem.x = x;
  gem.y = y;
  gems[x][y] = gem;
}

function dropGems() {
  for (let i = boardWidth - 1; i >= 0; i--) {
    for (let j = boardHeight - 1; j >= 0; j--) {
      if (gems[i][j] == null) {
        let dropGem = getLowestGemInColumnFromCurentPoint(i, j);
        if(dropGem) {
          moveGem(dropGem, i, j);
        }
      }
    }
  }
}

function moveColumn(start, end) {
  for (let i = 0; i < boardHeight; i++) {
    if (gems[start][i]) {
      gems[end][i] = gems[start][i];
      gems[end][i].x = end;
      gems[start][i] = null;
    }
  }
}

function slideGems() {
  for (let i = 0; i < boardWidth; i++) {
    if (gems[i][boardHeight - 1] == null) {
      if(!getLowestGemInColumnFromCurentPoint(i, boardHeight - 1)) {
        let slideGem = getLeftMostGemInRowFromCurrentXPositionInBottomRow(i);
        if(slideGem) {
          moveColumn(slideGem.x, i);
        }
      }
    }
  }
}

function getLowestGemInColumnFromCurentPoint(x, y) {
  for (let j = y; j >= 0; j--) {
    if (gems[x][j])
      return gems[x][j];
  }
  return null;
}

function getLeftMostGemInRowFromCurrentXPositionInBottomRow(x) {
  for (let i = x; i < boardWidth; i++) {
    if (gems[i][boardHeight-1]) {
      return gems[i][boardHeight - 1];
    }
  }
  return null;
}


function checkNeighbors(gem, color, markedGems) {
  if(!gem)
    return;

  if (gem.color === color && !markedGems.includes(gem)) {

    markedGems.push(gem);

    if (gem.x > 0) {
      checkNeighbors(gems[gem.x - 1][gem.y], color, markedGems);
    }
    if (gem.y > 0) {
      checkNeighbors(gems[gem.x][gem.y - 1], color, markedGems);
    }
    if (gem.x < boardWidth - 1) {
      checkNeighbors(gems[gem.x + 1][gem.y], color, markedGems);
    }
    if (gem.y < boardHeight - 1) {
      checkNeighbors(gems[gem.x][gem.y + 1], color, markedGems);
    }
  }
}

// Uses the glogal gems array, so no parameter passed in
function solvable() {
  // Scan rows left to right (from bottom rows to top rows) and for adjacent colors

  var row = boardHeight - 1;
  var previous;
  var currentPos;
  var current;

  while (row >= 0) {
    previous = null;
    currentPos = 0;
    while (currentPos < boardWidth) {
      current = gems[currentPos][row];
      if (previous != null && current != null && previous.colorIndex === current.colorIndex) {
        return true;
      } else {
        previous = current;
        currentPos++;
      }
    }
    row--;
  }

  // Scan columns from bottom to top (from left cols to right cols) for adjacent colors
  // We can bail when we encounter the first null in the column
  var column = 0;

  while (column < boardWidth) {
    previous = null;
    currentPos = boardHeight-1;
    while (currentPos >= 0) {
      current = gems[column][currentPos];
      if (previous != null && current != null && previous.colorIndex === current.colorIndex) {
        console.log("Vertical: col="+ column + " row=" + currentPos);
        return true;
      } else {
        previous = current;
        currentPos--;
      }
    }
    column++;
  }

  // No adjacent colors in rows or columns, so not solvable
  return false;
}
