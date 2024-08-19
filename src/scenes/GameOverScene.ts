export class GameOverScene extends Phaser.Scene {
    public handlePauseAction: Function = (action: string) => {
        switch (action) {
            case 'reset':
                this.scene.start("ARENA")
                break;
            case 'resume':
                this.scene.start("ARENA", { mode: this.mode })
                break;
            case 'home':
                this.scene.start("MENU", { mode: this.mode })
                break;
        }
    }

    private mode: string = "";
    private info: string = "";
    private score: string = "";
    private bg!: Phaser.GameObjects.Image;
    private titleImg!: Phaser.GameObjects.Image;

    constructor() {
        super({
            key: "GAMEOVER",
        });
    }

    init(data: any) {
        this.mode = data.mode
        this.info = data.info
        this.score = data.score
    }

    create() {
        this.bg = this.add.image(0, 0, "bgImg").setOrigin(0).setDepth(0).setAlpha(0);
        this.titleImg = this.add.image(this.game.renderer.width / 2 -10, 200, this.info).setDepth(1).setScale(1.4).setAlpha(0)
        this.time.addEvent({
            delay: 300,
            callback: () => {
                this.scene.launch('PauseScene', { parent: "GAMEOVER" })
                this.scene.bringToTop('PauseScene');
                this.add.text(17.5, 2.5, this.score, {
                    fontFamily: 'Pacifico',
                    fontSize: '42px',
                    color: '#ffffff'
                }).setDepth(2);
            }
        });



    }
    update(time: number, delta: number): void {
        // const scale = 1.4 + Math.sin(time / 200) * 0.05;
        const angle = -0.5 + Math.sin(time / 150) * 1;
        // this.titleImg.setScale(scale);
        this.titleImg.setAngle(angle);
        this.bg.setAlpha(this.bg.alpha + 0.02)
        this.titleImg.setAlpha(this.titleImg.alpha + 0.02)
    }

}