import bgImg from "../assets/image/bg.png"
import bgImg2 from "../assets/image/bg2.png"
import Title from "../assets/image/titlle.png"
import PVP from "../assets/image/pvp.png"
import PVC from "../assets/image/pvc.png"
import playerB from "../assets/image/pb.png"
import playerR from "../assets/image/pr.png"
import ground from "../assets/image/ground.png"
import net from "../assets/image/net.png"
import ball from "../assets/image/ball.png"
import arrow from "../assets/image/arrow.png"
import home from "../assets/image/pause2.png"
import btnLU from "../assets/image/btnLU.png"
import btnRU from "../assets/image/btnRU.png"
import btnU from "../assets/image/btnU.png"
import btnLD from "../assets/image/btnLD.png"
import btnRD from "../assets/image/btnRD.png"

import reset from "../assets/image/reset.png"
import home2 from "../assets/image/home2.png"
import pause from "../assets/image/pause.png"
import play from "../assets/image/play.png"

import TRW from "../assets/image/TRW.png"
import TBW from "../assets/image/TBW.png"
import TYL from "../assets/image/TYL.png"
import TYW from "../assets/image/TYW.png"

export class LoadScene extends Phaser.Scene {
    constructor() {
        super({
            key: "LOAD"
        })
    }
    init() {

    }
    loadImages() {
        // this.load.setPath("./assets/image");
        // this.load.image(CST.IMAGE[prop], CST.IMAGE[prop]);
        this.load.image("bgImg", bgImg);
        this.load.image("bgImg2", bgImg2);
        this.load.image("Title", Title);
        this.load.image("PVP", PVP);
        this.load.image("PVC", PVC);
        this.load.image("playerB", playerB);
        this.load.image("playerR", playerR);
        this.load.image("ground", ground);
        this.load.image("net", net);
        this.load.image("ball", ball);
        this.load.image("arrow", arrow);
        this.load.image("home", home);
        this.load.image("btnLU", btnLU);
        this.load.image("btnRU", btnRU);
        this.load.image("btnU", btnU);
        this.load.image("btnLD", btnLD);
        this.load.image("btnRD", btnRD);

        this.load.image("reset", reset);
        this.load.image("home2", home2);
        this.load.image("pause", pause);
        this.load.image("play", play);

        this.load.image("TRW", TRW);
        this.load.image("TBW", TBW);
        this.load.image("TYL", TYL);
        this.load.image("TYW", TYW);
    }

    loadSprites(frameConfig?: Phaser.Types.Loader.FileTypes.ImageFrameConfig) {
        // this.load.setPath("./assets/sprite");
        // this.load.spritesheet(CST.SPRITE[prop], CST.SPRITE[prop], frameConfig);
    }

    preload() {
        this.add.text(-50, -50, '3', {
            fontFamily: 'Pacifico',
            fontSize: '1px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(2);

        // this.load.spritesheet("anna", "./assets/sprite/anna.png", { frameHeight: 64, frameWidth: 64 });
        // this.load.atlas("characters", "./assets/sprite/characters.png", "./assets/sprite/characters.json")

        //create loading bar
        this.loadImages()
        let loadingBar = this.add.graphics({
            fillStyle: {
                color: 0xffffff
            }
        })

        this.load.on("progress", (percent: number) => {
            loadingBar.fillRect(0, this.game.renderer.height / 2 - 25, this.game.renderer.height * percent, 50);
        })

        this.load.on("complete", () => {
            loadingBar.destroy()
            //this.scene.start(CST.SCENES.MENU, "hello from LoadScene");
        });

        this.load.on("load", (file: Phaser.Loader.File) => {
            // console.log(file.key)
        })

    }
    create() {
        this.scene.start("MENU");
    }
}