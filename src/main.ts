import Phaser from "phaser";

import { LoadScene } from "./scenes/LoadScene";
import { MenuScene } from "./scenes/MenuScene";
import { ArenaScene } from "./scenes/ArenaScene";
import { PauseScene } from "./scenes/PauseScene";
import { GameOverScene } from "./scenes/GameOverScene";

const config = {
    type: Phaser.AUTO,
    width: 1900,
    height: 1000,
    parent: 'game-container',
    backgroundColor: '#931515',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1, x: 0 },
            debug: true
        }
    },
    scene: [
        LoadScene,
        MenuScene,
        ArenaScene,
        PauseScene,
        GameOverScene
    ]
};

export default new Phaser.Game(config);