import {Grid} from "./Grid.ts";
import {Input} from "./Input.ts";

export abstract class Game {
    protected grid: Grid;
    protected input: Input;
    protected continue: boolean = false;
    constructor(canvas: HTMLCanvasElement) {
        this.grid = new Grid(canvas).resize();
        this.input = new Input();
    }

    public abstract begin(): this;
    public abstract end(): this;
}
