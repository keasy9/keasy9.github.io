import {Game} from "./core/Game.ts";
import {Input, InputEvent} from "./core/Input.ts";
import {Screen} from "./core/Screen.ts";
import {Vector2d} from "./core/Vector2d.ts";
import {Ui} from "./core/Ui.ts";
import {Sound} from "./core/Sound.ts";

export class Snake extends Game {
    private static direction: string = 'up';
    private static nextDirection: string = 'up';
    private static body: Vector2d[] = []
    private static apple?: Vector2d;
    private static score: number = 0;
    private static edgeDeath: boolean = false;
    private static loopDeath: boolean = false;
    private static prevMenu?: string | null;
    private static readonly directions: {[index: string]: {vector: Vector2d, opposite: string}} = {
        up: {
            vector: new Vector2d(0, -1),
            opposite: 'down',
        },
        right: {
            vector: new Vector2d(1, 0),
            opposite: 'left',
        },
        down: {
            vector: new Vector2d(0, 1),
            opposite: 'up',
        },
        left: {
            vector: new Vector2d(-1, 0),
            opposite: 'right',
        },
    };

    protected static _resize() {
        const oldSize = Screen.size;

        Screen.autoFit(4000, 5000).autoScale().fill();

        if (this.apple) {
            this.placeApple(this.apple.multiply(Screen.size).divide(oldSize).round().maxLimit(Screen.size));
        }

        if (this.body.length > 1) {
            const head = this.body.shift();

            let newBody: Vector2d[] = [
                head!.multiply(Screen.size).divide(oldSize).round().maxLimit(Screen.size)
            ];

            this.body.forEach((point) => {
                newBody.push(newBody[0].substract(head!.substract(point)));
            });

            this.body = newBody;

            this.drawBody();
        }

        Ui.on(new Vector2d(Screen.width - 4, 1)).button('pause', 'pauseButton.png').event = Input.keyboard.key('escape');
        Ui.button('pause').scale = 2;
        Ui.on(new Vector2d(1, 1)).label('score').content = `score ${this.score}`;

        if (window.TouchEvent) {
            Ui.on(new Vector2d(Screen.width - 10, Screen.height - 10)).dPad().link().link(true).scale = 2;
        }
    }

    public static begin() {
        super.begin();

        for (const [dirName, dir] of Object.entries(this.directions)) {
            Input.listen((<InputEvent>Input.keyboard[dirName]), () => {
                if (this.continue && this.direction !== dir.opposite) {
                    this.nextDirection = dirName;
                }
            });
        }

        Input.listen(Input.keyboard.key('escape'), () => {
            if (this.prevMenu) {
                Ui.menu(this.prevMenu).open();
                this.prevMenu = null;
            } else {
                Ui.menu('main').toggle();
                this.togglePause();
            }
        });

        Ui.menu('rules').switch('edge-death').onchange = (val: boolean) => this.edgeDeath = val;
        Ui.menu('rules').switch('edge-death').text = 'death from edge';
        Ui.menu('rules').switch('loop-death').onchange = (val: boolean) => this.loopDeath = val;
        Ui.menu('rules').switch('loop-death').text = 'death from loop';
        Ui.menu('rules').button('back').onclick = () => {
            if (this.prevMenu) {
                Ui.menu(this.prevMenu).open();
                this.prevMenu = null;
            } else {
                Ui.menu('rules').close();
                this.togglePause();
            }
        }
        Ui.menu('rules').button('back').text = 'back';

        Ui.menu('main').button('continue').onclick = () => {
            this.prevMenu = null;
            this.togglePause();
            Ui.menu('main').toggle();
        };
        Ui.menu('main').button('continue').text = 'continue';
        Ui.menu('main').button('restart').onclick = () => this.end() && this.begin();
        Ui.menu('main').button('restart').text = 'restart';
        Ui.menu('main').button('game-rules').onclick = () => {
            this.prevMenu = 'main';
            Ui.menu('rules').open();
        };
        Ui.menu('main').button('game-rules').text = 'game rules'
        Ui.menu('main').button('exit').onclick = () => document.location.hash = 'home';
        Ui.menu('main').button('exit').text = 'exit';

        const centerX: number = Math.round(Screen.width/2);
        const centerY: number = Math.round(Screen.height/2);

        this.body = [
            new Vector2d(centerX, centerY - 2),
            new Vector2d(centerX, centerY - 1),
            new Vector2d(centerX, centerY),
            new Vector2d(centerX, centerY + 1),
            new Vector2d(centerX, centerY + 2),
        ];

        this.drawBody();

        this.placeApple();
        this.go();

        return this;
    }

    public static end(gameover: boolean = false) {
        this.continue = false;
        delete this.apple;
        this.body = [];
        Input.deaf();

        if (gameover) {
            Ui.menu('gameover').label('score').text = `score: ${this.score}`;
            Ui.menu('gameover').line('score');
            Ui.menu('gameover').button('restart').onclick = () => {
                Ui.menu('restart').close();
                this.begin();
            }
            Ui.menu('gameover').button('restart').text = 'restart';
            Ui.menu('gameover').button('game-rules').onclick = () => {
                this.prevMenu = 'gameover';
                Ui.menu('rules').open();
            };
            Ui.menu('gameover').button('game-rules').text = 'game-rules';
            Ui.menu('gameover').button('exit').onclick = () => document.location.hash = 'home';
            Ui.menu('gameover').button('exit').text = 'exit';
            Ui.menu('gameover').open();

            Ui.dPad().remove();
        } else {
            Ui.clear();
        }

        return this;
    }

    private static go(): void {
        if (this.continue) {
            this.move();
            setTimeout(() => this.go(), 300);
        }
    }

    private static move(): void {
        const head = this.body[0];
        const newHead: Vector2d = head.add(this.directions[this.nextDirection].vector);

        if (this.apple && this.apple.x === newHead.x && this.apple.y === newHead.y) {
            Sound.play(`scoreUp1`);
            this.placeApple();
            this.score++;
            Ui.label('score').content = `score ${this.score}`;
        } else {
            const tail = this.body[this.body.length - 1];
            this.body.pop();
            Screen.pixel(tail).clear();
        }

        if (newHead.x < 0) {
            if (this.edgeDeath) {
                this.end(true);
            } else {
                newHead.x = Screen.width;
            }
        } else if (newHead.x > Screen.width) {
            if (this.edgeDeath) {
                this.end(true);
            } else {
                newHead.x = 0;
            }
        } else if (newHead.y < 0) {
            if (this.edgeDeath) {
                this.end(true);
            } else {
                newHead.y = Screen.height;
            }
        } else if (newHead.y > Screen.height) {
            if (this.edgeDeath) {
                this.end(true);
            } else {
                newHead.y = 0;
            }
        }

        if (this.loopDeath) {
            this.body.forEach((point: Vector2d) => {
                if (point.x === newHead.x && point.y === newHead.y) {
                    this.end(true);
                }
            })
        }

        this.body.unshift(newHead);

        this.drawBody();

        this.direction = this.nextDirection;
    }

    private static drawBody(): void {
        this.body.forEach((point: Vector2d) => {
            Screen.pixel(point).paint('#1e90ff');
        });
    }

    private static placeApple(position?: Vector2d): void {
        if (position) {
            Screen.pixel(this.apple!).clear();
            this.apple = position;
        } else {
            this.apple = new Vector2d(
                Math.floor(Math.random() * Screen.width),
                Math.floor(Math.random() * Screen.height)
            );

            for (const point of this.body) {
                if (point.x === this.apple.x && point.y === this.apple.y) {
                    this.placeApple();
                    return;
                }
            }
        }

        Screen.pixel(this.apple).paint('#ff4500');
    }

    public static togglePause() {
        super.togglePause();
        if (this.continue) {
            this.go();
        }

        return this;
    }
}
