const config = {
  type: Phaser.AUTO,
  width: 800,
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

const game = new Phaser.Game(config);

function preload ()
{
  this.load.spritesheet("gems", "assets/gems.png", {
    frameWidth: 100,
    frameHeight: 100
  });
}

function create ()
{
  for (var i=0; i < boardWidth; i++) {
    gems[i] = [];
    for (var j=0; j < boardHeight; j++) {
      const colorIndex = Math.floor(Math.random()*colorCount);
      gems[i][j] =
        {
          sprite: this.add.sprite(i*100+50, j*100-1000 , "gems").setInteractive(), // -1000 on initial y position so the gems slide in at start
          color: colors[colorIndex],
          colorIndex: colorIndex, // remove when each gem has its own sprite/no longer using setframe
          x: i,
          y: j,
        };
      let gem = gems[i][j];
      gems[i][j].sprite.setFrame(gems[i][j].colorIndex);
      gems[i][j].sprite.on('pointerdown', function(pointer) {
        clickGem(gem);
      });
    }
  }
}

function update ()
{
  animateSprites();
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
}

function removeGems(gem) {
  const color = gem.color;
  let markedGems = [];
  checkNeighbors(gem, color, markedGems);
  //console.log(markedGems);
  if((!removeSingles && markedGems.length > 1) || (removeSingles)) {
    score += Math.pow(2, markedGems.length);
    for (let i = 0; i < markedGems.length; i++) {
      removeGem(markedGems[i]);
    }
  }
  dropGems();
  slideGems();
  console.log(score);
}

function removeGem(gem) {
  gem.sprite.destroy();
  gems[gem.x][gem.y] = null;
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
        console.log(slideGem);
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


