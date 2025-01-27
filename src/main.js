import './style.css'
import Phaser from 'phaser'

const sizes ={
  width:500,
  height:500,
}

const speedDown = 350

class FinalScoreScene extends Phaser.Scene {
  constructor() {
    super("scene-final-score");
  }

  create(data) {
    // Display the final score
    this.add.text(130, 200, `You got: ${data.points} Apples!`, {
      font: "32px Arial",
      fill: "red",
    });

    // Add a restart button
    const restartText = this.add.text(150, 300, "Restart Game", {
      font: "28px Arial",
      fill: "#ff0000",
      backgroundColor: "#ffffff",
      padding: { x: 10, y: 5 },
    });
    restartText.setInteractive();

    // Restart the game when the button is clicked
    restartText.on("pointerdown", () => {
      this.scene.start("scene-game"); // Go back to the Game Scene
    });
  }
}


class GameScene extends Phaser.Scene{
  constructor(){
    super("scene-game")
    this.player
    this.cursor
    this.playerSpeed = speedDown + 50
    this.apple
    this.points = 0
    this.textScore
    this.textTime
    this.timedEvent
    this.remainingTime
    this.coinMusic
    this.bgMusic
    this.emitter
    this.finalScore
  }
  preload(){
    this.load.image("bg", "/assets/bg.png")
    this.load.image("basket", "/assets/basket.png")
    this.load.image("apple", "/assets/apple.png")
    this.load.image("money", "/assets/money.png")
    this.load.audio("coin", "/assets/coin.mp3")
    this.load.audio("bgMusic", "/assets/Caketown.mp3")
  }

  create(){

    this.scene.pause("scene")

    // Can also do this.add.image(0, 0, "bg").setOrigins(0,0)
    this.add.image(250, 250, "bg")
    this.player = this.physics.add.image(50, 450, "basket")
    this.player.setImmovable(true)
    this.player.body.allowGravity = false
    this.player.setCollideWorldBounds(true)
    this.player.setSize(80,15).setOffset(10,70)

    this.apple = this.physics.add.image(0, 0, "apple").setOrigin(0,0)
    this.apple.setMaxVelocity(0, speedDown);

    this.physics.add.overlap(this.apple, this.player, this.targetHit, null, this)

    this.cursor = this.input.keyboard.createCursorKeys()

    this.textScore = this.add.text(sizes.width - 120, 10, "Score: 0", {
      font: "25px Arial",
      fill: "#000000"
    });
    this.textTime = this.add.text(10, 10, "Time Left: 00", {
      font: "25px Arial",
      fill: "#000000"
    });

    this.timedEvent = this.time.delayedCall(30000, this.gameOver, [], this)

    this.emitter = this.add.particles(0, 0, "money", {
      speed: 100,
      gravityY:speedDown - 300,
      scale:0.04,
      duration:200,
      emitting: false
    })

    this.emitter.startFollow(this.player, this.player.width / 5, this.player.height / 5, true)

    this.coinMusic = this.sound.add("coin")
    this.bgMusic = this.sound.add("bgMusic")
    this.bgMusic.play()
  }

  update(){
    
    this.remainingTime = this.timedEvent.getRemainingSeconds()
    this.textTime.setText(`Time Left: ${Math.round(this.remainingTime).toString()} `)

    if (this.apple.y >= sizes.height) {
      this.apple.setY(0);
      this.apple.setX(this.getRandomX())
    }

    const {left, right} = this.cursor

    if (left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (right.isDown){
      this.player.setVelocityX(this.playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }
  }

getRandomX () {
  return Phaser.Math.Between(0, 460);
};

targetHit() {
  this.coinMusic.play()
  this.emitter.start()
  this.apple.disableBody(true, true);
  
  this.points++;
  this.textScore.setText(`Score: ${this.points}`)
  this.time.delayedCall(100, () => {
    const randomSpeed = Phaser.Math.Between(speedDown, speedDown + 800); // Random speed
    this.apple.setVelocityY(randomSpeed); // Apply the speed
    this.apple.enableBody(true, this.getRandomX(), 0, true, true);
  });
}

gameOver() {
  this.scene.pause()
  // this.sys.game.destroy(true)
  this.scene.start("scene-final-score", { points: this.points });
  
  // finalScoreSpan.textContent = `You got ${this.points} Apples`
  // gameEndDiv.style.display = "flex"
}

}

const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas:gameCanvas,
  physics:{
    default:"arcade",
    arcade:{
      gravity:{y:speedDown},
      debug:false
    }
  },
  scene:[GameScene, FinalScoreScene]
  
}

const game = new Phaser.Game(config)

