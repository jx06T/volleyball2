import Phaser from "phaser";

import { LoadScene } from "./scenes/LoadScene";
import { MenuScene } from "./scenes/MenuScene";
import { ArenaScene } from "./scenes/ArenaScene";
import { PauseScene } from "./scenes/PauseScene";
import { GameOverScene } from "./scenes/GameOverScene";
import { DebugScene } from "./scenes/DeBugScene";
const config = {
    // type: Phaser.AUTO,
    type: Phaser.WEBGL,
    width: 950,
    height: 500,
    parent: 'game-container',
    backgroundColor: '#931515',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 0.5, x: 0 },
            debug: true
        }
    },
    scene: [
        LoadScene,
        MenuScene,
        ArenaScene,
        PauseScene,
        GameOverScene,
        DebugScene
    ]
};

export default new Phaser.Game(config);