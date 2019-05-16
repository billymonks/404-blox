var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var gems = [];

var game = new Phaser.Game(config);

function preload ()
{
    this.load.spritesheet("gems", "assets/gems.png", {
        frameWidth: 100,
        frameHeight: 100
    });
}

function create ()
{
  for (var i=0; i<8; i++) {
    gems[i] = [];
    for (var j=0; j<8; j++) {
      gems[i][j] = this.add.sprite(i*100+50, j*100+50 , "gems");
      gems[i][j].setFrame(Math.floor(Math.random()*6));
    }
  }
}

function update ()
{
  for (var i=0; i<8; i++) {
    for (var j=0; j<8; j++) {
      // gems[i][j].setFrame(Math.floor(Math.random()*6));
    }
  }
}