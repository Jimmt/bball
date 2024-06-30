import Phaser from 'phaser';

export default class UiScene extends Phaser.Scene {

  constructor() {
    super({ key: 'UiScene', active: true })
  }

  create() {
    const text = this.add.text(10, 10, 'Power: 0', { font: '24px Arial', fill: '#FFFFFF' })
    const mainScene = this.scene.get('GameScene');

    //  Listen for events from it
    mainScene.events.on('charge', function (power) {
      text.setText(`Power: ${power}`);

    }, this);
  }
}