export class MenuScene extends Phaser.Scene {
    private titleImg!: Phaser.GameObjects.Image;
    constructor() {
        super({
            key: "MENU",
        });
    }
    init() {
    }
    create() {
        //create images (z order)

        this.add.image(0, 0, "bgImg").setOrigin(0).setDepth(0);

        this.titleImg = this.add.image(this.game.renderer.width / 2, 123, "Title").setDepth(1);
        this.titleImg.setInteractive()
        let count = 0
        this.titleImg.on("pointerup", () => {
            count += 1
            if (count > 4 && !window.drawDebug) {
                alert("d")
                window.drawDebug = true;
            }
        })

        let playButton1 = this.add.image(this.game.renderer.width / 2, 260, "PVP").setDepth(1)

        let playButton2 = this.add.image(this.game.renderer.width / 2, 375, "PVC").setDepth(1)

        /* 
            PointerEvents:
                pointerover - hovering
                pointerout - not hovering
                pointerup - click and release
                pointerdown - just click
        */

        playButton1.setInteractive();

        playButton1.on("pointerover", () => {
            playButton1.setScale(1.05)
        })

        playButton1.on("pointerout", () => {
            playButton1.setScale(1)
        })

        playButton1.on("pointerup", () => {
            this.scene.start("ARENA", { mode: "pvp" })
        })


        playButton2.setInteractive();

        playButton2.on("pointerover", () => {
            playButton2.setScale(1.05)
        })

        playButton2.on("pointerout", () => {
            playButton2.setScale(1)
        })

        playButton2.on("pointerup", () => {
            this.scene.start("ARENA", { mode: "pvc" })
        })

        // this.scene.launch('PauseScene');
    }
    update(time: number, delta: number): void {
        const scale = 1 + Math.sin(time / 200) * 0.05;
        this.titleImg.setScale(scale);
    }

}