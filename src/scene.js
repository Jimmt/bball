import Phaser from 'phaser';
import createHoop from './hoop';

export default class MyGame extends Phaser.Scene {
  tookShot = false;
  circles = []

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    //  This is an example of loading a static image from the public folder:
    this.load.image('background', 'assets/bg.jpg');
    this.load.image('ground', 'assets/logo.png');
    this.load.image('ball', 'assets/ball_basket1.png');
    this.load.image('pole', 'assets/pole.png');
    this.load.image('backboard', 'assets/backboard.png');
    this.load.image('rim', 'assets/rim.png');
    this.load.image('arrow', 'assets/right-arrow.png');
    this.load.image('net', 'assets/net.png');
    this.load.image('net_horiz', 'assets/net_horiz.png');
  }

  create() {
    this.arrow = this.add.image(0, 0, 'arrow')
    this.arrow.setOrigin(0, this.arrow.displayHeight / 2)
    this.arrow.setVisible(false)
    this.createPlatforms()
    this.setupInput()
  }

  createPlatforms() {
    this.matter.world.setBounds(0, 0, 800, 600, 32, true, false, false, true);

    // todo allow multiple balls
    this.ball = this.matter.add.sprite(100, -200, 'ball');
    this.ball.setCircle().setScale(2);
    this.ball.setBounce(0.5);
    this.ball.setFrictionAir(0);
    const ballCollisionGroup = this.matter.world.nextGroup();
    this.ball.setCollisionGroup(ballCollisionGroup)

    this.holder = this.matter.add.image(0, 0, 'pole').setScale(2, 0.5)
    this.holder.setPosition(50, 600 - this.holder.displayHeight / 2)
    this.holder.setStatic(true)

    this.reset();

    createHoop(this);
  }

  downTime = 0;
  keyMovePoint = Phaser.Math.Vector2.ZERO

  update() {
    const Vector2 = Phaser.Math.Vector2

    var keyObj = this.input.keyboard.addKey('J');  // Get key object
    if (keyObj.isDown && this.tookShot) {
      var delta = this.game.getTime() - this.downTime;
      this.keyMovePoint = new Vector2(-1, 1.5).scale(delta / 10);
      this.addCircles(Vector2.ZERO, this.keyMovePoint)
    }
  }

  setupInput() {
    var spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceBar.on('down', () => {
      this.reset()
    })

    var comma = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    comma.on('down', () => {
      this.downTime = this.game.getTime();
      this.tookShot = true;
    })
    comma.on('up', () => {
      this.tookShot = false;
      this.clearCircles();
      this.launchBall(this.getBallVelocity(Vector2.ZERO, this.keyMovePoint));
    })

    const Vector2 = Phaser.Math.Vector2
    var downPoint = new Vector2(0, 0)
    var pointerdown = false
    this.input.on("pointerdown", function (pointer) {
      pointerdown = true
      if (this.tookShot) {
        return;
      }
      downPoint = new Vector2(pointer.x, pointer.y)
    })

    this.circles = []
    this.input.on("pointermove", (pointer, gameObject, dragX, dragY) => {
      if (!pointerdown) { return; }
      // this.arrow.setVisible(true)
      const movePoint = new Vector2(pointer.x, pointer.y);
      let moveVec = downPoint.clone().subtract(movePoint)
      const charge = moveVec.length()
      this.events.emit('charge', charge);

      this.addCircles(downPoint, movePoint);
    })
    this.input.on("pointerup", (pointer) => {
      pointerdown = false
      if (this.tookShot) {
        return;
      }
      this.clearCircles()
      this.tookShot = true;
      const upPoint = new Vector2(pointer.x, pointer.y);
      let launchVec = this.getBallVelocity(downPoint, upPoint);

      this.launchBall(launchVec);
    })
  }

  launchBall(launchVec) {
    this.ball.setVelocity(launchVec.x, launchVec.y)
    this.ball.setAngularVelocity(-0.03)
    this.arrow.setVisible(false)
  }

  addCircles(downPoint, movePoint) {
    let ballVec = this.getBallVelocity(downPoint, movePoint);
    this.clearCircles()
    for (let i = 5; i < 100; i = i + 5) {
      const exPos = this.extrapolateBallPos(ballVec.x, ballVec.y, i)
      this.circles.push(this.add.circle(exPos.x, exPos.y, this.ball.width, 0x6666ff))
    }
  }

  clearCircles() {
    this.circles.forEach((circle) => { circle.destroy() })
    this.circles.length = 0
  }

  getBallVelocity(downPoint, upPoint) {
    return downPoint.clone().subtract(upPoint).scale(0.1)
  }

  extrapolateBallPos(vx, vy, t) {
    var x = this.ball.x + vx * t;
    // 1 = default gravity
    var y = this.ball.y + vy * t + 0.5 * 0.2825 * t * t;
    return { x: x, y: y };
  }

  reset() {
    this.clearCircles()
    this.ball.setVelocity(0, 0)
    this.ball.setAngularVelocity(0)
    this.ball.setPosition(50, this.holder.y - this.holder.displayHeight / 2 - this.ball.height / 2 - 1)
    this.tookShot = false
  }

  clamp = (val, min, max) => Math.min(Math.max(val, min), max)
}