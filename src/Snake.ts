import {Game} from "./Game.ts";
import {Direction, Point} from "./types.tp.ts";

export class Snake extends Game {
    private direction: Direction = Direction.Up;
    private nextDirection: Direction = Direction.Up;
    private body: Point[] = []
    private apple?: Point;
    private gridSize: Point = {x: 0, y: 0};

    private touchStart?: Point;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        window.addEventListener('keydown', (event) => {
            if (event.repeat) return;

            if (this.continue) {
                if (this.direction !== Direction.Down && (event.code === 'ArrowUp' || event.code === 'KeyW')) {
                    this.nextDirection = Direction.Up;
                } else if (this.direction !== Direction.Up && (event.code === 'ArrowDown' || event.code === 'KeyS')) {
                    this.nextDirection = Direction.Down;
                } else if (this.direction !== Direction.Right && (event.code === 'ArrowLeft' || event.code === 'KeyA')) {
                    this.nextDirection = Direction.Left;
                } else if (this.direction !== Direction.Left && (event.code === 'ArrowRight' || event.code === 'KeyD')) {
                    this.nextDirection = Direction.Right;
                }
            }

            if (event.code === 'Space') {
                this.togglePause();
            }
        });

        window.addEventListener('click', () => {
            this.togglePause();
        });

        document.addEventListener('touchstart', (event) => {
            this.touchStart = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY,
            };
        });

        document.addEventListener('touchmove', (event) => {
            if (!this.touchStart) return;

            const touch: Touch = event.touches[0];

            const xDiff = this.touchStart.x - touch.clientX;
            const yDiff = this.touchStart.y - touch.clientY;


            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                if (xDiff > 0 && this.direction !== Direction.Right) {
                    this.nextDirection = Direction.Left;
                } else if (this.direction !== Direction.Left) {
                    this.nextDirection = Direction.Right;
                }
            } else {
                if (yDiff > 0 && this.direction !== Direction.Down) {
                    this.nextDirection = Direction.Up;
                } else if (this.direction !== Direction.Up) {
                    this.nextDirection = Direction.Down;
                }
            }

            this.touchStart = undefined;
        });
    }

    private togglePause() {
        this.continue = !this.continue;
        if (this.continue) {
            this.go();
        }
    }

    public begin(): this {
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
