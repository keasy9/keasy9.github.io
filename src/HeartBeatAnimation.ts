import {Game} from "./Game.ts";

export class HeartBeatAnimation extends Game {
    private centerX: number = 0;
    private centerY: number = 0;
    public speed: number = 1;

    public begin(): this {
        this.grid.resize(20);
        const size: {x: number, y: number} = this.grid.getSize();
        this.centerX = Math.round(size.x/2);
        this.centerY = Math.round(size.y/2);

        this.grid.cell(this.centerX, this.centerY).paint('red');

        for (let i = 0; i <= 5; i++) {
            this.grid.cell(this.centerX, this.centerY - i).paint('red');
            for (let j = 0; j <= i; j++) {
                this.grid.cell(this.centerX - j, this.centerY - i).paint('red');
                this.grid.cell(this.centerX + j, this.centerY - i).paint('red');
            }
        }

        this.grid.cell(this.centerX - 5, this.centerY - 5).clear();
        this.grid.cell(this.centerX + 5, this.centerY - 5).clear();

        for (let i = 1; i <= 3; i++) {
            this.grid.cell(this.centerX - i, this.centerY - 6).paint('red');
            this.grid.cell(this.centerX + i, this.centerY - 6).paint('red');
        }

        this.continue = true;
        this.go();

        return this;
    }

    public end(): this {
        this.continue = false;
        return this;
    }

    private go() {
        if (this.continue) {
            this.step();
            setTimeout(() => {
                this.step(false)
            }, 700 / this.speed);

            setTimeout(() => this.go(), 2000 / this.speed);
        }
    }

    private mutateCell(x: number, y: number, paint: boolean): void {
        this.grid.cell(x, y)[paint ? 'paint' : 'clear']('red');
    }

    private step(side: boolean = true, paint: boolean = true): void {
        for (let i: number = 2; i <= 4; i++) {
            this.mutateCell(side ? (this.centerX + i) : (this.centerX - i), this.centerY - 7, paint);
        }

        for (let i: number = 4; i <= 5; i++) {
            this.mutateCell(side ? (this.centerX + i) : (this.centerX - i), this.centerY - 6, paint);
        }

        this.mutateCell(side ? (this.centerX + 5) : (this.centerX - 5), this.centerY - 5, paint);

        for (let i = 0; i <= 4; i++) {
            this.mutateCell(side ? (this.centerX + i + 1) : (this.centerX - i - 1), this.centerY - i, paint);
        }

        if (paint) {
            setTimeout((s: boolean, p: boolean) => this.step(s, p), 400 / this.speed, side, false);
        }
    }

    public setSpeed(speed: number): this {
        this.speed = speed;
        return this;
    }

}