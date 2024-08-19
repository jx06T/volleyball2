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

        const y = this.parent == "ARENA" ? 450 : 650
        let reset = this.add.image(500, y, 'reset').setInteractive().setScale(1.1);
        reset.on('pointerover', () => reset.setScale(1.2));
        reset.on('pointerout', () => reset.setScale(1.1));
        reset.on('pointerup', () => this.returnToParent('reset'));

        let play = this.add.image(980, y, 'play').setInteractive().setScale(1.3);
        play.on('pointerover', () => play.setScale(1.4));
        play.on('pointerout', () => play.setScale(1.3));
        play.on('pointerup', () => this.returnToParent('resume'));

        let home = this.add.image(1370, y, 'home2').setInteractive().setScale(1.1);
        home.on('pointerover', () => home.setScale(1.2));
        home.on('pointerout', () => home.setScale(1.1));
        home.on('pointerup', () => this.returnToParent('home'));

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
