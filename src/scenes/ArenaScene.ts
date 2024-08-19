interface btn {
    RU?: Phaser.GameObjects.Image;
    LU?: Phaser.GameObjects.Image;
    U?: Phaser.GameObjects.Image;
    RD?: Phaser.GameObjects.Image;
    LD?: Phaser.GameObjects.Image;
    x: number;
    y: number;
}
interface point {
    RP?: Phaser.Input.Pointer;
    LP?: Phaser.Input.Pointer;
    RisD?: boolean;
    LisD?: boolean;
}

export class ArenaScene extends Phaser.Scene {

    public handlePauseAction: Function = (action: string) => {
        switch (action) {
            case 'reset':
                this.scene.restart();
                break;
            case 'resume':
                // this.matter.world.enabled = true
                this.scene.resume()
                // 實現恢復遊戲的邏輯
                break;
            case 'home':
                this.scene.start("MENU")
                break;
        }
    }

    private score!: Phaser.GameObjects.Text;
    private arrow!: Phaser.GameObjects.Image;
    private ground!: Phaser.Physics.Matter.Image;
    private net!: Phaser.Physics.Matter.Image;

    private playerB!: Phaser.Physics.Matter.Sprite;
    private playerR!: Phaser.Physics.Matter.Sprite;
    private ball!: Phaser.Physics.Matter.Sprite;

    private keys!: { w: Phaser.Input.Keyboard.Key; a: Phaser.Input.Keyboard.Key; s: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; };
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    private scoreB: number = 0;  // 蓝队得分
    private scoreR: number = 0;  // 红队得分
    private isGameResetting: boolean = false;
    private isFirst: boolean = true;

    private isDesktop!: boolean;
    private pointData: point = {};
    private timeScale: number = 1;

    private btnR: btn = { x: 0, y: 0 };
    private btnL: btn = { x: 0, y: 0 };

    private mode: string = "";
    constructor() {
        super({
            key: "ARENA",
        });
    }

    init(data: any) {
        this.mode = data.mode
        this.scoreB = 0
        this.scoreR = 0
        this.isDesktop = !('ontouchstart' in window) || navigator.maxTouchPoints <= 1;
        // console.log(this.isDesktop, navigator, navigator.maxTouchPoints)
    }

    create() {
        this.isGameResetting = true

        if (!this.isDesktop) {
            this.timeScale = 2
            this.matter.world.engine.timing.timeScale = 1.5;
        }

        this.add.image(-5, -35, "bgImg2").setOrigin(0).setDepth(0);

        this.ball = this.matter.add.sprite(950, -2000, "ball").setDepth(1).setScale(0.65);
        this.ball.setCircle(this.ball.width / 2 * 0.65);
        this.ball.setBounce(0.95);  // 設置完全反彈
        this.ball.setFrictionAir(0.012);  // 設置空氣阻力為 0
        this.ball.setFixedRotation();

        this.playerB = this.matter.add.sprite(500, 500, "playerB").setDepth(1).setScale(0.62);
        this.playerB.setBounce(0.4);
        this.playerB.setDensity(0.7);
        const points = [
            { x: 60, y: 60 },
            { x: 85, y: -70 },
            { x: 55, y: -100 },
            { x: 15, y: -120 },
            { x: -5, y: -120 },
            { x: -25, y: -120 },
            { x: -65, y: -110 },
            { x: -95, y: -95 },
            { x: -117, y: 0 },
            { x: -125, y: 170 },
            { x: 95, y: 170 }
        ];
        this.playerB.setBody({
            type: 'fromVerts',
            verts: points.map(e => ({ x: e.x * 0.95, y: e.y * 0.95 }))
        });
        this.playerB.setFixedRotation();

        this.playerR = this.matter.add.sprite(1400, 500, "playerR").setDepth(1).setScale(0.62);
        this.playerR.setBounce(0.4);
        this.playerR.setDensity(0.7);
        this.playerR.setBody({
            type: 'fromVerts',
            verts: points.map(e => ({ x: -0.95 * e.x, y: e.y * 0.95 })),

        });
        this.playerR.setFixedRotation();


        this.ground = this.matter.add.image(950, 982, 'ground', undefined, { restitution: 0.4, isStatic: true }).setDepth(0);

        this.net = this.matter.add.image(950, 790, 'net', undefined, { restitution: 0.4, isStatic: true }).setDepth(0).setScale(0.7);
        this.net.setBody({
            type: "rectangle",
            width: this.net.width * 0.58,
            height: this.net.height * 0.75
        })
        this.matter.body.setStatic(this.net.body, true);

        if (this.isDesktop) {
            this.keys = {
                w: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                a: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                s: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                d: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D)
            };
            this.cursors = this.input.keyboard!.createCursorKeys();
            // this.setupTouchControls()
        } else {
            this.addBtn()
            this.setupTouchControls()
        }

        this.arrow = this.add.image(-5, 0, "arrow").setOrigin(0).setDepth(0);

        this.score = this.add.text(35, 5, '0:0', {
            fontFamily: 'Pacifico',
            fontSize: '84px',
            color: '#ffffff'
        }).setDepth(2);

        let homeButton = this.add.image(this.game.renderer.width - 70, 75, "home").setDepth(1)
        homeButton.setInteractive();

        homeButton.on("pointerover", () => {
            homeButton.setScale(1.05)
        })

        homeButton.on("pointerout", () => {
            homeButton.setScale(1)
        })

        homeButton.on("pointerup", () => {
            // this.scene.start("MENU")
            this.scene.pause()
            // this.matter.world.enabled = false
            this.scene.launch('PauseScene', { parent: "ARENA" })
        })

        this.collisionMonitoring()
        this.resetGame()
    }


    collisionMonitoring(): void {
        const { width, height } = this.cameras.main;

        const bounds = {
            left: 0,
            right: width,
            top: -2000,
            bottom: height
        };

        this.matter.world.setBounds(
            bounds.left,
            bounds.top,
            bounds.right - bounds.left,
            bounds.bottom - bounds.top
        );

        this.matter.world.on('collisionstart', (event: any) => {
            event.pairs.forEach((pair: any) => {
                const { bodyA, bodyB } = pair;

                if (!this.isGameResetting && (bodyA === this.ball.body && bodyB === this.ground.body) ||
                    (bodyA === this.ground.body && bodyB === this.ball.body)) {

                    if (this.ball.x < width / 2) {
                        this.scoreR += 1;
                    } else {
                        this.scoreB += 1;
                    }


                    const winScore = 11
                    if (this.scoreB >= winScore || this.scoreR >= winScore) {
                        let black = this.add.rectangle(0, 0, 1900, 1000, 0x931515).setAlpha(0).setOrigin(0).setDepth(3);
                        let c = 0;
                        const countdownInterval = this.time.addEvent({
                            delay: 5,
                            callback: () => {
                                black.setAlpha(black.alpha + 0.01)
                                c += 1
                                if (c > 50) {
                                    const info = (this.mode == "pvp" ?
                                        (this.scoreB >= winScore ? "TBW" : "TRW") :
                                        (this.scoreB >= winScore ? "TYL" : "TYW"));

                                    this.scene.start("GAMEOVER", { info: info, mode: this.mode, score: `${this.scoreB}:${this.scoreR}` })
                                    countdownInterval.remove();
                                }
                            },
                            callbackScope: this,
                            loop: true
                        });
                    }

                    this.score.setText(`${this.scoreB}:${this.scoreR}`)
                    this.isGameResetting = true;
                    this.resetGame()
                }

                if ((bodyA === this.ground.body && bodyB === this.playerB.body) ||
                    (bodyA === this.playerB.body && bodyB === this.ground.body)) {
                    this.playerB.setData('onGround', true);
                }

                if ((bodyA === this.net.body && bodyB === this.ball.body) ||
                    (bodyA === this.ball.body && bodyB === this.net.body)) {
                    this.ball.setVelocity(this.ball.body!.velocity.x + (Math.random() - 0.5) * 6, this.ball.body!.velocity.y + 2)
                }

                if ((bodyA === this.ground.body && bodyB === this.playerR.body) ||
                    (bodyA === this.playerR.body && bodyB === this.ground.body)) {
                    this.playerR.setData('onGround', true);
                }

                if ((bodyA === this.net.body && bodyB === this.playerR.body) ||
                    (bodyA === this.playerR.body && bodyB === this.net.body)) {
                    this.playerR.setData('onNet', true);
                }
                if ((bodyA === this.net.body && bodyB === this.playerR.body) ||
                    (bodyA === this.playerR.body && bodyB === this.net.body)) {
                    this.playerR.setData('onNet', true);
                }

                if ((bodyA === this.ball.body && bodyB === this.playerB.body) ||
                    (bodyA === this.playerB.body && bodyB === this.ball.body)) {
                    this.playerB.setData('hit', true);
                    pair.isActive = false;
                    this.hitBall(this.ball, this.playerB);
                }

                if ((bodyA === this.ball.body && bodyB === this.playerR.body) ||
                    (bodyA === this.playerR.body && bodyB === this.ball.body)) {
                    this.playerR.setData('hit', true);
                    pair.isActive = false;
                    this.hitBall(this.ball, this.playerR);
                }
            });
        });

        this.matter.world.on('collisionend', (event: any) => {
            event.pairs.forEach((pair: any) => {
                const { bodyA, bodyB } = pair;

                // 检查玩家是否离开地面
                if ((bodyA === this.ground.body && bodyB === this.playerB.body) ||
                    (bodyA === this.playerB.body && bodyB === this.ground.body)) {
                    this.playerB.setData('onGround', false);
                }

                if ((bodyA === this.ground.body && bodyB === this.playerR.body) ||
                    (bodyA === this.playerR.body && bodyB === this.ground.body)) {
                    this.playerR.setData('onGround', false);
                }

                if ((bodyA === this.net.body && bodyB === this.playerB.body) ||
                    (bodyA === this.playerB.body && bodyB === this.net.body)) {
                    this.playerB.setData('onNet', false);
                }

                if ((bodyA === this.net.body && bodyB === this.playerR.body) ||
                    (bodyA === this.playerR.body && bodyB === this.net.body)) {
                    this.playerR.setData('onNet', false);
                }

                if ((bodyA === this.ball.body && bodyB === this.playerR.body) ||
                    (bodyA === this.playerR.body && bodyB === this.ball.body)) {
                    this.playerR.setData('hit', false);
                }
                if ((bodyA === this.ball.body && bodyB === this.playerB.body) ||
                    (bodyA === this.playerB.body && bodyB === this.ball.body)) {
                    this.playerB.setData('hit', false);
                }
            });
        });
    }

    keyboard(): void {
        let speed: number = this.isGameResetting ? 0 : 4;
        speed = this.playerR.y > 650 ? speed : speed / 2;

        if (this.cursors.up.isDown && this.playerR.getData('onGround')) {
            this.playerR.setVelocityY(-4 * speed);
        }
        if (this.cursors.left.isDown) {
            this.playerR.setVelocityX(-2 * speed);
        } else if (this.cursors.right.isDown) {
            this.playerR.setVelocityX(2 * speed);
        } else {
            this.playerR.setVelocityX(0);
        }

        speed = this.mode == "pvp" ? (this.isGameResetting ? 0 : 4) : (this.isGameResetting ? 0 : 3)
        speed = this.playerB.y > 650 ? speed : speed / 2;

        if (this.mode == "pvp") {
            if (this.keys.w.isDown && this.playerB.getData('onGround')) {
                this.playerB.setVelocityY(-4 * speed);
            }
            if (this.keys.a.isDown) {
                this.playerB.setVelocityX(-2 * speed);
            } else if (this.keys.d.isDown) {
                this.playerB.setVelocityX(2 * speed);
            } else {
                this.playerB.setVelocityX(0);
            }
        }
    }

    addBtn(): void {
        this.btnR.x = 1600;
        this.btnR.y = 650;
        this.btnR.RU = this.add.image(this.btnR.x, this.btnR.y, "btnRU").setDepth(2).setAlpha(0.3).setScale(1.2)
        this.btnR.LU = this.add.image(this.btnR.x, this.btnR.y, "btnLU").setDepth(2).setAlpha(0.3).setScale(1.2)
        this.btnR.U = this.add.image(this.btnR.x, this.btnR.y, "btnU").setDepth(2).setAlpha(0.3).setScale(1.2)
        this.btnR.RD = this.add.image(this.btnR.x, this.btnR.y, "btnRD").setDepth(2).setAlpha(0.3).setScale(1.2)
        this.btnR.LD = this.add.image(this.btnR.x, this.btnR.y, "btnLD").setDepth(2).setAlpha(0.3).setScale(1.2)

        if (this.mode == "pvc") {
            return
        }
        this.btnL.x = 300;
        this.btnL.y = 650;
        this.btnL.RU = this.add.image(this.btnL.x, this.btnL.y, "btnRU").setDepth(2).setAlpha(0.3).setScale(1.2)
        this.btnL.LU = this.add.image(this.btnL.x, this.btnL.y, "btnLU").setDepth(2).setAlpha(0.3).setScale(1.2)
        this.btnL.U = this.add.image(this.btnL.x, this.btnL.y, "btnU").setDepth(2).setAlpha(0.3).setScale(1.2)
        this.btnL.RD = this.add.image(this.btnL.x, this.btnL.y, "btnRD").setDepth(2).setAlpha(0.3).setScale(1.2)
        this.btnL.LD = this.add.image(this.btnL.x, this.btnL.y, "btnLD").setDepth(2).setAlpha(0.3).setScale(1.2)

    }

    updatePlayerMovement(pointer: Phaser.Input.Pointer, isDown: boolean): void {
        let speed: number = this.isGameResetting ? 0 : 4;
        speed = this.playerR.y > 600 ? speed : speed / 2;

        const player = pointer.x < 950 ? (this.mode == "pvp" ? this.playerB : null) : this.playerR;
        const btn = pointer.x < 950 ? this.btnL : this.btnR;
        let angle = Phaser.Math.Angle.Between(pointer.x, pointer.y, btn.x, btn.y);

        if (!player) {
            return
        }

        btn.U?.setScale(1)
        btn.RU?.setScale(1)
        btn.LU?.setScale(1)
        btn.RD?.setScale(1)
        btn.LD?.setScale(1)

        if (pointer.x < 950) {
            this.pointData.LP = pointer
            this.pointData.LisD = isDown

        } else {
            this.pointData.RP = pointer
            this.pointData.RisD = isDown
        }

        if (!isDown) {
            player.setVelocityX(0);
            return
        }

        if ((angle < 3.15 && angle > -0.1) || angle < -3) {
            if (player.getData('onGround')) {
                player.setVelocityY(-4 * speed);
            }

            if (angle > 2.2 || angle < -3) {
                player.setVelocityX(2 * speed);
                btn.RU?.setScale(1.15)

            } else if (angle < 0.95) {
                player.setVelocityX(-2 * speed);
                btn.LU?.setScale(1.15)

            } else {
                player.setVelocityX(0);
                btn.U?.setScale(1.15)
            }
        }

        if (angle > -1.5 && angle < -0.1) {
            player.setVelocityX(-2 * speed);
            btn.LD?.setScale(1.15)

        } else if (angle < -1.5 && angle > -3) {
            player.setVelocityX(2 * speed);
            btn.RD?.setScale(1.15)
        }

    };
    setupTouchControls(): void {

        const handlePointer = (pointer: Phaser.Input.Pointer, isDown: boolean) => {
            this.updatePlayerMovement(pointer, isDown);
        };

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            handlePointer(pointer, true);
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (pointer.isDown) {
                handlePointer(pointer, true);
            }
        });

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            handlePointer(pointer, false);
        });

        this.input.on('pointerout', (pointer: Phaser.Input.Pointer) => {
            handlePointer(pointer, false);
        });

        // 處理多點觸控
        this.input.addPointer(1); // 增加一個額外的指針，總共支持兩個
    }

    robot(): void {
        let speed = this.isGameResetting ? 0 : 4
        speed = this.playerB.y > 600 ? speed : speed / 2;

        if (Math.random() < 0.01 && this.playerB.getData('onGround')) {
            this.playerB.setVelocityY(-4 * speed);
        }
        const s = this.isDesktop ? 0.45 : 1.2
        if (this.playerB.x > this.ball.x - 85 && (this.ball.y > -5 || this.ball.y < -400 || this.isFirst)) {
            this.playerB.setVelocityX(Math.max(this.playerB.getVelocity().x - s, -2 * speed));
        } else if (this.playerB.x < this.ball.x - 95 && this.ball.x < 900 && (this.ball.y > -5 || this.ball.y < -400 || this.isFirst)) {
            this.playerB.setVelocityX(Math.min(this.playerB.getVelocity().x + s, 2 * speed));
        } else {
            this.playerB.setVelocityX(this.playerB.getVelocity().x * 0.85);
        }
        if (this.playerB.x < 100) {
            this.playerB.setVelocityX(8);
        }
    }

    update(time: number, delta: number): void {

        if (this.ball.y < -80 && !this.isGameResetting) {
            this.arrow.setVisible(true)
            this.arrow.setX(this.ball.x)
        } else {
            this.arrow.setVisible(false)
        }

        if (this.isDesktop) {
            this.keyboard()
        } else {
            if (this.pointData.LP) {
                this.updatePlayerMovement(this.pointData.LP, this.pointData.LisD!)
            }
            if (this.pointData.RP) {
                this.updatePlayerMovement(this.pointData.RP, this.pointData.RisD!)
            }
            // this.setupTouchControls()
        }
        if (this.mode !== "pvp") {
            this.robot()
        }

        this.ball.setVelocityX(this.ball.body!.velocity.x * 0.997);
    }

    hitBall(ball: Phaser.Physics.Matter.Sprite, player: Phaser.Physics.Matter.Sprite) {
        if (this.playerR.getData('hit') && this.playerB.getData('hit')) {
            ball.setY(ball.y - 80);
            ball.setVelocityX(ball.getVelocity().x * 0.1);
            ball.setVelocityY(-20);
            return
        }
        // 計算擊球角度
        let angle = Phaser.Math.Angle.Between(player.x, player.y, ball.x, ball.y);

        // 設置球的速度
        let speed = 17;  // 調整這個值來改變球的速度

        ball.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) < 0 ? Math.sin(angle) * speed - 5 : 10,
        );

        // 根據玩家的移動添加額外的速度
        if (player.y < 580) {
            if (this.isFirst || player.getData('onNet')) {
                ball.setVelocityY(-20);
                return
            }
            ball.setY(ball.y - 20);
            ball.setVelocityX(ball.body!.velocity.x + player.body!.velocity.x * 4.35);
            ball.setVelocityY(ball.body!.velocity.y + 20);
        } else {
            ball.setVelocityX(ball.body!.velocity.x + player.body!.velocity.x * 1.6 + (player.body!.velocity.y < -1 ? player.body!.velocity.x * 0.5 : 0));
            ball.setVelocityY(ball.body!.velocity.y + (player.body!.velocity.y < -8 ? player.body!.velocity.y * 0.7 : 2));
        }
        // console.log(player.body!.velocity.y)
    }

    resetGame() {
        this.isFirst = true

        let countdownText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 300, '3', {
            fontFamily: 'Pacifico',
            fontSize: '128px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(2);

        let countdown = 3;

        // 每秒减少一次倒计时
        const countdownInterval = this.time.addEvent({
            delay: 800,
            callback: () => {
                countdown--;
                if (countdown > 2) {
                    countdownText.setText(countdown.toString());

                } else if (countdown == 2) {
                    countdownText.setText(countdown.toString());
                    this.playerB.setPosition(500, 779);
                    this.playerR.setPosition(1400, 779);
                    this.ball.setPosition(950, -1000);
                    this.ball.setVelocity(0, -500);
                    this.ball.setVisible(false);

                } else if (countdown == 1) {
                    countdownText.setText(countdown.toString());

                } else {
                    countdownText.destroy();
                    this.ball.setVisible(true);
                    this.ball.setPosition(950, 0);
                    this.ball.setVelocity(0, 0);

                    this.isGameResetting = false;
                    countdownInterval.remove();  // 停止倒计时事件
                }
            },
            callbackScope: this,
            loop: true
        })
        this.time.addEvent({
            delay: 5000,
            callback: () => {
                if (!this.isGameResetting) {
                    this.isFirst = false
                }
            },
            callbackScope: this,
        })
    }
}