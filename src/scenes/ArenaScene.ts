interface btn {
    RU?: Phaser.GameObjects.Image;
    LU?: Phaser.GameObjects.Image;
    U?: Phaser.GameObjects.Image;
    RD?: Phaser.GameObjects.Image;
    LD?: Phaser.GameObjects.Image;
    BC?: Phaser.GameObjects.Image;
    SC?: Phaser.GameObjects.Image;
    x: number;
    y: number;
}

interface point {
    RP?: Phaser.Input.Pointer;
    LP?: Phaser.Input.Pointer;
    RisD?: boolean;
    LisD?: boolean;
}

interface SpeedSetting {
    LR: number;
    U: number;
    B: number;
    BU: number;
    S: number;
    c1: number;
    c2: number;
    c3: number;
}


export class ArenaScene extends Phaser.Scene {

    public handlePauseAction: Function = (action: string) => {
        switch (action) {

            case 'reset':
                this.scene.restart();
                break;

            case 'resume':
                this.scene.resume()
                break;

            case 'home':
                this.scene.start("MENU")
                break;
        }
    }

    private score!: Phaser.GameObjects.Text;
    private killCountR!: Phaser.GameObjects.Text;
    private killCountB!: Phaser.GameObjects.Text;
    private arrow!: Phaser.GameObjects.Image;
    private ground!: Phaser.Physics.Matter.Image;
    private net!: Phaser.Physics.Matter.Image;

    private playerB!: Phaser.Physics.Matter.Sprite;
    private playerR!: Phaser.Physics.Matter.Sprite;
    private ball!: Phaser.Physics.Matter.Sprite;

    private keys!: { w: Phaser.Input.Keyboard.Key; a: Phaser.Input.Keyboard.Key; s: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; };
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private pointData: point = {};

    private scoreB: number = 0;
    private scoreR: number = 0;
    private isGameResetting: boolean = false;
    private isFirst: boolean = true;
    private isDesktop!: boolean;
    private mode: string = "";


    private btnR: btn = { x: 0, y: 0 };
    private btnL: btn = { x: 0, y: 0 };
    private SpeedSetting: SpeedSetting = { LR: 4, U: 7.8, B: 11, BU: 8, S: 0.8, c1: 5, c2: 23, c3: 10 };

    private graphics?: Phaser.GameObjects.Graphics
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
    }

    create() {

        this.isGameResetting = true

        this.ball = this.matter.add.sprite(475, -2000, "ball", undefined, { restitution: 0.95 }).setDepth(1).setScale(0.65);
        this.ball.setCircle(this.ball.width / 2 * 0.65);
        this.ball.setBounce(0.95);
        this.ball.setFriction(0)
        this.ball.setFrictionAir(0.012);
        this.ball.setFixedRotation();

        this.add.image(-2.5, -17.5, "bgImg2").setOrigin(0).setDepth(0);

        const points = [
            { x: 60, y: 60 },
            { x: 85, y: -70 },
            // { x: 55, y: -100 },
            { x: 20, y: -120 },
            { x: -35, y: -120 },
            // { x: -30, y: -120 },
            { x: -95, y: -100 },
            { x: -122, y: -30 },
            { x: -118, y: 170 },
            { x: 95, y: 170 }
        ];

        this.playerB = this.matter.add.sprite(250, 250, "playerB").setDepth(1).setScale(0.62);
        this.playerB.setBounce(0.4);
        this.playerB.setFriction(0)
        this.playerB.setBody({
            type: 'fromVerts',
            verts: points.map(e => ({ x: e.x * 0.475, y: e.y * 0.475 }))
        });
        this.playerB.setFixedRotation();

        this.playerR = this.matter.add.sprite(700, 250, "playerR").setDepth(1).setScale(0.62);
        this.playerR.setBounce(0.4);
        this.playerR.setFriction(0)
        this.playerR.setBody({
            type: 'fromVerts',
            verts: points.map(e => ({ x: -0.475 * e.x, y: e.y * 0.475 })),

        });
        this.playerR.setFixedRotation();


        this.ground = this.matter.add.image(475, 491, 'ground', undefined, { restitution: 0.4, isStatic: true }).setDepth(0);

        this.net = this.matter.add.image(475, 392.5, 'net', undefined, { restitution: 0.4, isStatic: true }).setDepth(0).setScale(0.7);
        this.net.setBody({
            type: "rectangle",
            width: this.net.width * 0.58,
            height: this.net.height * 0.73
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
            this.addBtn()
            this.addTouchControls()
        } else {
            this.addBtn()
            this.addTouchControls()
            // private SpeedSetting: SpeedSetting = { LR: 4, U: 7.8, B: 11, BU: 8, S: 0.8, c1: 5, c2: 23 };

            this.matter.world.setGravity(0, 1.8);
            this.SpeedSetting.LR = 10
            this.SpeedSetting.U = 13.6
            this.SpeedSetting.B = 10
            this.SpeedSetting.BU = 14
            this.SpeedSetting.S = 1.4
            this.SpeedSetting.c1 = 2
            this.SpeedSetting.c2 = 13
            this.SpeedSetting.c3 = 18
            // this.matter.world.engine.timing.timeScale = 1.5;

        }

        this.arrow = this.add.image(-2.5, 0, "arrow").setOrigin(0).setDepth(0);

        this.score = this.add.text(17.5, 2.5, '0:0', {
            fontFamily: 'Pacifico',
            fontSize: '42px',
            color: '#ffffff'
        }).setDepth(2);

        this.killCountB = this.add.text(15, 436, '', {
            fontFamily: 'Pacifico',
            fontSize: '42px',
            color: '#4d1f1f'
        });

        this.killCountR = this.add.text(945, 502, '', {
            fontFamily: 'Pacifico',
            fontSize: '42px',
            color: '#4d1f1f'
        }).setOrigin(1, 1);

        let homeButton = this.add.image(this.game.renderer.width - 35, 37.5, "pause2").setDepth(1)
        homeButton.setInteractive();

        homeButton.on("pointerover", () => homeButton.setScale(1.05))

        homeButton.on("pointerout", () => homeButton.setScale(1))

        homeButton.on("pointerup", () => {
            // this.matter.world.enabled = false
            this.scene.pause()
            this.scene.launch('PauseScene', { parent: "ARENA" })
        })
        this.addPhysics()
        this.resetGame()

        // this.graphics = this.add.graphics()
        // this.scene.launch('DebugScene')

    }

    landingCheck(): void {
        if (this.ball.x < 475) {
            this.scoreR += 1;
        } else {
            this.scoreB += 1;
        }

        const winScore = 11
        if (this.scoreB >= winScore || this.scoreR >= winScore) {
            let black = this.add.rectangle(0, 0, 950, 500, 0x931515).setAlpha(0).setOrigin(0).setDepth(3);
            let c = 0;

            const countdownInterval = this.time.addEvent({
                delay: 10,
                callback: () => {
                    c += 1

                    black.setAlpha(black.alpha + 0.01)

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

    addPhysics(): void {

        this.matter.world.update60Hz()
        const { width, height } = this.cameras.main;

        const bounds = {
            left: 0,
            right: width,
            top: -1000,
            bottom: height + 500
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
                    this.landingCheck()
                }

                if ((bodyA === this.ground.body && bodyB === this.playerB.body) ||
                    (bodyA === this.playerB.body && bodyB === this.ground.body)) {
                    this.playerB.setData('onGround', true);
                }

                if ((bodyA === this.net.body && bodyB === this.ball.body) ||
                    (bodyA === this.ball.body && bodyB === this.net.body)) {
                    this.ball.setVelocity(this.ball.getVelocity().x + (Math.random() - 0.5) * this.SpeedSetting.B * 0.6, this.ball.getVelocity().y + this.SpeedSetting.B * 0.3)
                }

                if ((bodyA === this.ground.body && bodyB === this.playerR.body) ||
                    (bodyA === this.playerR.body && bodyB === this.ground.body)) {
                    this.playerR.setData('onGround', true);
                }

                if ((bodyA === this.ball.body && bodyB === this.playerB.body) ||
                    (bodyA === this.playerB.body && bodyB === this.ball.body)) {
                    this.playerB.setData('hit', true);
                    pair.isActive = false;
                    this.hitBall(this.ball, this.playerB, Math.abs(this.ball.getVelocity().x));
                }

                if ((bodyA === this.ball.body && bodyB === this.playerR.body) ||
                    (bodyA === this.playerR.body && bodyB === this.ball.body)) {
                    this.playerR.setData('hit', true);
                    pair.isActive = false;
                    this.hitBall(this.ball, this.playerR, Math.abs(this.ball.getVelocity().x));
                }
            });
        });

        this.matter.world.on('collisionend', (event: any) => {
            event.pairs.forEach((pair: any) => {
                const { bodyA, bodyB } = pair;

                if ((bodyA === this.ground.body && bodyB === this.playerB.body) ||
                    (bodyA === this.playerB.body && bodyB === this.ground.body)) {
                    this.playerB.setData('onGround', false);
                }

                if ((bodyA === this.ground.body && bodyB === this.playerR.body) ||
                    (bodyA === this.playerR.body && bodyB === this.ground.body)) {
                    this.playerR.setData('onGround', false);
                }

                if ((bodyA === this.ball.body && bodyB === this.playerR.body) ||
                    (bodyA === this.playerR.body && bodyB === this.ball.body)) {
                    this.playerR.setData('hit', false);
                    this.playerR.setData('kill', false);
                }
                if ((bodyA === this.ball.body && bodyB === this.playerB.body) ||
                    (bodyA === this.playerB.body && bodyB === this.ball.body)) {
                    this.playerB.setData('hit', false);
                    this.playerB.setData('kill', false);
                }
            });
        });
    }

    keyboard(): void {
        if (this.isGameResetting) {
            return
        }
        const speed = this.playerR.y > 325 ? 1 : 0.65;

        if (this.cursors.up.isDown && this.playerR.getData('onGround')) {
            this.playerR.setVelocityY(-this.SpeedSetting.U * speed);
        }
        if (this.cursors.left.isDown) {
            this.playerR.setVelocityX(-this.SpeedSetting.LR * speed);
        } else if (this.cursors.right.isDown) {
            this.playerR.setVelocityX(this.SpeedSetting.LR * speed);
        } else {
            this.playerR.setVelocityX(0);
        }

        if (this.mode == "pvp") {
            if (this.keys.w.isDown && this.playerB.getData('onGround')) {
                this.playerB.setVelocityY(-this.SpeedSetting.U * speed);
            }
            if (this.keys.a.isDown) {
                this.playerB.setVelocityX(-this.SpeedSetting.LR * speed);
            } else if (this.keys.d.isDown) {
                this.playerB.setVelocityX(this.SpeedSetting.LR * speed);
            } else {
                this.playerB.setVelocityX(0);
            }
        }
    }

    addBtn(): void {
        this.btnR.x = 790;
        this.btnR.y = 280;
        // this.btnR.RU = this.add.image(this.btnR.x, this.btnR.y, "btnRU").setDepth(2).setAlpha(0.3).setScale(1.2)
        // this.btnR.LU = this.add.image(this.btnR.x, this.btnR.y, "btnLU").setDepth(2).setAlpha(0.3).setScale(1.2)
        // this.btnR.U = this.add.image(this.btnR.x, this.btnR.y, "btnU").setDepth(2).setAlpha(0.3).setScale(1.2)
        // this.btnR.RD = this.add.image(this.btnR.x, this.btnR.y, "btnRD").setDepth(2).setAlpha(0.3).setScale(1.2)
        // this.btnR.LD = this.add.image(this.btnR.x, this.btnR.y, "btnLD").setDepth(2).setAlpha(0.3).setScale(1.2)

        this.btnR.BC = this.add.image(this.btnR.x, this.btnR.y, "BC").setDepth(2).setAlpha(0.3).setScale(1)
        this.btnR.SC = this.add.image(this.btnR.x, this.btnR.y, "SC").setDepth(2).setAlpha(0.3).setScale(1)

        if (this.mode == "pvc") {
            return
        }

        this.btnL.x = 180;
        this.btnL.y = 280;
        this.btnL.RU = this.add.image(this.btnL.x, this.btnL.y, "btnRU").setDepth(2).setAlpha(0.3).setScale(1.2)
        this.btnL.LU = this.add.image(this.btnL.x, this.btnL.y, "btnLU").setDepth(2).setAlpha(0.3).setScale(1.2)
        this.btnL.U = this.add.image(this.btnL.x, this.btnL.y, "btnU").setDepth(2).setAlpha(0.3).setScale(1.2)
        this.btnL.RD = this.add.image(this.btnL.x, this.btnL.y, "btnRD").setDepth(2).setAlpha(0.3).setScale(1.2)
        this.btnL.LD = this.add.image(this.btnL.x, this.btnL.y, "btnLD").setDepth(2).setAlpha(0.3).setScale(1.2)

    }

    moveByPoint(pointer: Phaser.Input.Pointer, isDown: boolean): void {
        const speed = this.playerR.y > 325 ? 1 : 1 / 2;

        const player = pointer.x < 475 ? (this.mode == "pvp" ? this.playerB : null) : this.playerR;
        const btn = pointer.x < 475 ? this.btnL : this.btnR;
        let angle = Phaser.Math.Angle.Between(pointer.x, pointer.y, btn.x, btn.y);

        btn.U?.setScale(1)
        btn.RU?.setScale(1)
        btn.LU?.setScale(1)
        btn.RD?.setScale(1)
        btn.LD?.setScale(1)

        if (!player || this.isGameResetting) {
            return
        }

        if (pointer.x < 475) {
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
                player.setVelocityY(-this.SpeedSetting.U * speed);
            }

            if (angle > 2.2 || angle < -3) {
                player.setVelocityX(this.SpeedSetting.LR * speed);
                btn.RU?.setScale(1.15)

            } else if (angle < 0.95) {
                player.setVelocityX(-this.SpeedSetting.LR * speed);
                btn.LU?.setScale(1.15)

            } else {
                player.setVelocityX(0);
                btn.U?.setScale(1.15)
            }
        }

        if (angle > -1.5 && angle < -0.1) {
            player.setVelocityX(-this.SpeedSetting.LR * speed);
            btn.LD?.setScale(1.15)

        } else if (angle < -1.5 && angle > -3) {
            player.setVelocityX(this.SpeedSetting.LR * speed);
            btn.RD?.setScale(1.15)
        }

    };

    addTouchControls(): void {

        const handlePointer = (pointer: Phaser.Input.Pointer, isDown: boolean, up: boolean = false) => {
            this.moveByPoint(pointer, isDown);
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
            handlePointer(pointer, false, true);
        });

        this.input.on('pointerout', (pointer: Phaser.Input.Pointer) => {
            handlePointer(pointer, false);
        });

        this.input.addPointer(1);
    }

    robot(): void {
        if (this.isGameResetting) {
            return
        }

        const speed = this.playerB.y > 300 ? 1 : 0.65;
        let s = this.SpeedSetting.S

        if (this.playerR.getData('killCount') > 4) {
            s = s * 0.2
        }

        const ballV = this.ball.getVelocity()
        let vy = ballV.y == 0 ? 1 : ballV.y
        vy = ballV.y < 0 ? -6 * vy : vy
        vy = Math.max(vy, 1)

        let b0 = Math.min((Math.max(0, 280 - this.ball.y) * 1.4), 160)
        const b1 = Math.min((Math.max(0, 180 - this.ball.y) * 1.4), 80)

        if (Math.abs(this.ball.x - 330) < 40) {
            b0 = b0 * 0.5
        }

        let target0 = this.ball.x + (ballV.x / vy * Math.min(200, Math.max(0, 280 - this.ball.y))) - b0
        let target1 = this.ball.x + (ballV.x / vy * Math.min(200, Math.max(0, 180 - this.ball.y))) - b1
        let target2 =
        {
            x: this.ball.x + ballV.x * this.SpeedSetting.c1,
            y: this.ball.y + (ballV.y > -1.5 ? ballV.y + 2 : ballV.y) * this.SpeedSetting.c2
        }

        if (target0 < 0) {
            target0 = target0 * -0.4 - b0 * 0.9
        }

        if (this.playerR.getData('killCount') < 5 && target2.y < 220 && target2.y > 170 && this.playerB.getData("onGround") && Math.abs(this.playerB.x + 90 - target2.x) < 40) {
            this.playerB.setVelocityY(-this.SpeedSetting.U * speed);
        }

        if (Math.abs(ballV.x) > this.SpeedSetting.c3 && Math.abs(this.playerB.x - this.ball.x) < 50 && Math.abs(this.playerB.y - this.ball.y - 150) < 30 && this.playerB.getData("onGround")) {
            this.playerB.setVelocityY(-this.SpeedSetting.U * speed);
        }

        if (!this.playerB.getData("onGround")) {
            target0 = target1
        }

        if (this.graphics) {
            this.graphics.clear();
            this.graphics.fillStyle(0x00ff00, 1);
            this.graphics.fillCircle(Math.max(10, Math.min(940, target0)), 280, 5);
            this.graphics.fillStyle(0xff0000, 1);
            this.graphics.fillCircle(Math.max(10, Math.min(940, target1)), 180, 5);
            this.graphics.fillStyle(0x0000ff, 1);
            this.graphics.fillCircle(target2.x, target2.y, 5);
        }

        if (this.playerB.x < target0 - 10 || (Math.abs(this.playerB.x - this.ball.x) < 40 && Math.abs(this.playerB.y - this.ball.y - 115) < 15)) {
            this.playerB.setVelocityX(Math.min(this.playerB.getVelocity().x + s, this.SpeedSetting.LR * speed));

        } else if (this.playerB.x > target0 + 10 && this.playerB.x > 35) {
            this.playerB.setVelocityX(Math.max(this.playerB.getVelocity().x - s, -this.SpeedSetting.LR * speed));

        } else {
            this.playerB.setVelocityX(this.playerB.getVelocity().x * 0.85);
        }

    }

    update(time: number, delta: number): void {
        if (this.ball.y < -40 && !this.isGameResetting) {
            this.arrow.setVisible(true)
            this.arrow.setX(this.ball.x)
        } else {
            this.arrow.setVisible(false)
        }

        if (this.isDesktop) {
            this.keyboard()
        } else {
            if (this.pointData.LP) {
                this.moveByPoint(this.pointData.LP, this.pointData.LisD!)
            }
            if (this.pointData.RP) {
                this.moveByPoint(this.pointData.RP, this.pointData.RisD!)
            }
            // this.addTouchControls()
        }
        if (this.mode !== "pvp") {
            this.robot()
        }

        this.ball.setVelocityX(this.ball.getVelocity().x * 0.997);

    }

    hitBall(ball: Phaser.Physics.Matter.Sprite, player: Phaser.Physics.Matter.Sprite, v0: number) {
        let speed = this.SpeedSetting.B;
        const angle = Phaser.Math.Angle.Between(player.x, player.y, ball.x, ball.y);

        ball.setVelocity(
            Math.cos(angle) * this.SpeedSetting.B,
            Math.sin(angle) * this.SpeedSetting.BU,
        );

        if (this.playerR.getData('hit') && this.playerB.getData('hit')) {
            ball.setY(ball.y - 60);
            ball.setVelocityX(ball.getVelocity().x * 0.3);
            ball.setVelocityY(-10);
        }

        const ballV = ball.getVelocity()
        const playerV = player.getVelocity()

        if (player.y < 290 && !this.isFirst && player.getData('kill') == false) {

            if (Math.abs(ballV.x + playerV.x * 4 * (v0 > 2 ? 1.5 : 1)) > this.SpeedSetting.B * 1.2) {
                player.setData('killCount', player.getData('killCount') + 1);
                this.killCountB.setText(". ".repeat(this.playerB.getData("killCount")))
                this.killCountR.setText(". ".repeat(this.playerR.getData("killCount")))
            }

            player.setData('kill', true)
            ball.setVelocityX(ballV.x + playerV.x * 4 * (v0 > 2 ? 1.5 : 1));
            ball.setVelocityY(ballV.y + this.SpeedSetting.B * 1);

        } else {
            ball.setVelocityX(ballV.x + playerV.x * 1.5 + (playerV.y < -0.5 ? playerV.x * 0.7 : 0));
            ball.setVelocityY(ballV.y + (playerV.y < -0.5 ? playerV.y * 1 : this.SpeedSetting.BU / -5.4));
        }
    }

    resetGame() {
        this.isFirst = true
        this.playerB.setData('killCount', 0);
        this.playerR.setData('killCount', 0);
        this.playerB.setVelocity(0, 0);
        this.playerR.setVelocity(0, 0);

        let countdownText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 150, '3', {
            fontFamily: 'Pacifico',
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(2);

        let countdown = 3;

        const countdownInterval = this.time.addEvent({
            delay: 800,
            callback: () => {
                countdown--;
                countdownText.setText(countdown.toString());

                if (countdown == 2) {
                    this.playerB.setPosition(250, 390);
                    this.playerR.setPosition(700, 390);
                    this.ball.setPosition(475, -1000);
                    this.ball.setVelocity(0, -250);
                    this.ball.setVisible(false);
                    this.killCountB.setText(". ".repeat(this.playerB.getData("killCount")))
                    this.killCountR.setText(". ".repeat(this.playerR.getData("killCount")))

                } else if (countdown == 0) {
                    countdownText.destroy();
                    this.ball.setVisible(true);
                    this.ball.setPosition(475, 0);
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