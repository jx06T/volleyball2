export class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }
    private parent: string = "";
    init(data: any) {
        this.parent = data.parent
    }
    create() {
        // 創建一個半透明的背景
        if (this.parent == "ARENA") {
            this.add.rectangle(0, 0, 1900, 1000, 0x000000, 0.2).setOrigin(0).setDepth(-1);
        }

        const y = this.parent == "ARENA" ? 450 : 720
        const s = this.parent == "ARENA" ? 1.1 : 0.7
        const s2 = this.parent == "ARENA" ? 0 : 230
        let reset = this.add.image(500 + s2, y, 'reset').setInteractive().setScale(s);
        reset.on('pointerover', () => reset.setScale(s + 0.1));
        reset.on('pointerout', () => reset.setScale(s));
        reset.on('pointerup', () => this.returnToParent('reset'));


        let home = this.add.image(1370 - s2, y, 'home2').setInteractive().setScale(s).setAngle(-1.9);
        home.on('pointerover', () => home.setScale(s + 0.1));
        home.on('pointerout', () => home.setScale(s));
        home.on('pointerup', () => this.returnToParent('home'));

        if (this.parent !== "ARENA") {
            return
        }
        let play = this.add.image(960, y, 'play').setInteractive().setScale(s + 0.2);
        play.on('pointerover', () => play.setScale(s + 0.3));
        play.on('pointerout', () => play.setScale(s + 0.2));
        play.on('pointerup', () => this.returnToParent('resume'));
    }

    returnToParent(action: string) {
        // 停止當前場景
        this.scene.stop();

        // 獲取父場景的鍵（假設PauseScene是作為覆蓋層啟動的）
        const parentScene = this.scene.get(this.parent);

        if (parentScene.handlePauseAction) {
            parentScene.handlePauseAction(action);
        } else {
            console.warn('Parent scene does not have handlePauseAction method');
        }
    }
}
