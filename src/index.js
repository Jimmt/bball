import Phaser from 'phaser';
import MyGame from './scene'
import UiScene from './uiscene'

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [MyGame, UiScene],
  physics: {
    default: 'matter',
    matter: {
      debug: false,
      enableSleeping: false
    }
  },
};

const game = new Phaser.Game(config);
