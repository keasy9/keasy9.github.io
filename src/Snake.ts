import {Game} from "./Game.ts";
import {Direction, Point} from "./types.tp.ts";
import {Input} from "./Input.ts";

export class Snake extends Game {
    private direction: Direction = Direction.Up;
    private nextDirection: Direction = Direction.Up;
    private body: Point[] = []
    private apple?: Point;
    private gridSize: Point = {x: 0, y: 0};
    private score: number = 0;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.input.listen(Input.keyboard.up, () => {
            if (this.continue && this.direction !== Direction.Down) {
                this.nextDirection = Direction.Up;
            }
        });

        this.input.listen(Input.keyboard.down, () => {
            if (this.continue && this.direction !== Direction.Up) {
                this.nextDirection = Direction.Down;
            }
        });

        this.input.listen(Input.keyboard.left, () => {
            if (this.continue && this.direction !== Direction.Right) {
                this.nextDirection = Direction.Left;
            }
        });

        this.input.listen(Input.keyboard.right, () => {
            if (this.continue && this.direction !== Direction.Left) {
                this.nextDirection = Direction.Right;
            }
        });

        this.input.listen(Input.keyboard.space, () => {
            this.togglePause();
        });

        this.input.listen(Input.keyboard.escape, () => {
            this.togglePause();
        });

        this.input.listen(Input.mouse.click, () => {
            this.togglePause();
        });

        this.input.listen(Input.touchScreen.swipeUp, () => {
            if (this.continue && this.direction !== Direction.Down) {
                this.nextDirection = Direction.Up;
            }
        });

        this.input.listen(Input.touchScreen.swipeDown, () => {
            if (this.continue && this.direction !== Direction.Up) {
                this.nextDirection = Direction.Down;
            }
        });

        this.input.listen(Input.touchScreen.swipeLeft, () => {
            if (this.continue && this.direction !== Direction.Right) {
                this.nextDirection = Direction.Left;
            }
        });

        this.input.listen(Input.touchScreen.swipeRight, () => {
            if (this.continue && this.direction !== Direction.Left) {
                this.nextDirection = Direction.Right;
            }
        });

        this.ui.menu('main').addButton('exit', () => document.location.hash = 'home');
    }

    public togglePause(): this {
        this.continue = !this.continue;
        if (this.continue) {
            this.ui.menu('main').hide();
            this.go();
        } else {
            this.ui.menu('main').show();
        }
        return this;
    }

    public begin(): this {
        this.ui.info.set(`<span>score: ${this.score}</span>`).show();
        this.grid.resize(20);
        this.gridSize = this.grid.getSize();

        const centerX: number = Math.round(this.gridSize.x/2);
        const centerY: number = Math.round(this.gridSize.y/2);

        this.body = [
            {x: centerX, y: centerY - 2},
            {x: centerX, y: centerY - 1},
            {x: centerX, y: centerY},
            {x: centerX, y: centerY + 1},
            {x: centerX, y: centerY + 2},
        ];

        this.drawBody();

        this.continue = true;
        this.placeApple();
        this.go();

        return this;
    }

    public end(): this {
        this.continue = false;
        this.input.deaf();
        this.ui.removeMenu('main');
        this.ui.info.clear().hide();
        return this;
    }

    private go(): void {
        if (this.continue) {
            this.move();
            setTimeout(() => this.go(), 300);
        }
    }

    private move(): void {
        const head = this.body[0];
        const newHead: Point = {...head};

        if (this.nextDirection === Direction.Up) {
            newHead.y--;
        } else if (this.nextDirection === Direction.Down) {
            newHead.y++;
        } else if (this.nextDirection === Direction.Left) {
            newHead.x--;
        } else if (this.nextDirection === Direction.Right) {
            newHead.x++;
        }

        if (newHead.x < 0) {
            newHead.x = this.gridSize.x;
        } else if (newHead.x > this.gridSize.x) {
            newHead.x = 0;
        } else if (newHead.y < 0) {
            newHead.y = this.gridSize.y;
        } else if (newHead.y > this.gridSize.y) {
            newHead.y = 0;
        }

        if (this.apple && this.apple.x === newHead.x && this.apple.y === newHead.y) {
            this.grid.cell(this.apple.x, this.apple.y).paint('green');
            this.placeApple();
            this.score++;
            this.ui.info.set(`<span>score: ${this.score}</span>`);
        } else {
            const tail = this.body[this.body.length - 1];
            this.body.pop();
            this.grid.cell(tail.x, tail.y).clear();
        }

        this.body.unshift(newHead);

        this.drawBody();

        this.direction = this.nextDirection;
    }

    private drawBody() {
        this.body.forEach((point: Point) => {
            this.grid.cell(point.x, point.y).paint('green');
        });
    }

    private placeApple() {
        this.apple = {
            x: Math.floor(Math.random() * this.gridSize.x),
            y: Math.floor(Math.random() * this.gridSize.y)
        };

        for (const point of this.body) {
            if (point.x === this.apple.x && point.y === this.apple.y) {
                this.placeApple();
                return;
            }
        }

        this.grid.cell(this.apple.x, this.apple.y).paint('red');
    }

}
