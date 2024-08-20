export class DebugScene extends Phaser.Scene {
    constructor() {
        super({
            key: "DebugScene",
        })
    }
    private coordsText!: Phaser.GameObjects.Text
    create() {
        // 創建半透明網格背景

        const cellSize = 50;
        const width = 950;
        const height = 500;

        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x000000, 0.1);

        for (let x = 0; x < width; x += cellSize) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, height);
        }

        for (let y = 0; y < height; y += cellSize) {
            graphics.moveTo(0, y);
            graphics.lineTo(width, y);
        }

        graphics.strokePath();

        // 創建右上角座標顯示文本
        this.coordsText = this.add.text(width - 100, 10, '', {
            font: '24px Arial',
            color: '#ffffff'
        }).setOrigin(1, 0);

        // 更新滑鼠座標
        this.input.on('pointermove', (pointer: any) => {
            this.coordsText.setText(`X: ${Math.floor(pointer.x)}, Y: ${Math.floor(pointer.y)}`);
        });
    }
}