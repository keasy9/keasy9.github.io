import {Grid} from "./Grid.ts";

export abstract class Game {
    protected grid: Grid;
    protected continue: boolean = false;
    constructor(canvas: HTMLCanvasElement) {
        this.grid = new Grid(canvas).resize();
    }

    public abstract begin(): this;
    public abstract end(): this;
}