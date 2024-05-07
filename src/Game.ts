import {Grid} from "./Grid.ts";
import {Input} from "./Input.ts";
import {Ui} from "./Ui.ts";

export abstract class Game {
    protected grid: Grid;
    protected input: Input;
    protected ui: Ui;
    protected continue: boolean = false;
    protected speed: number = 1;

    constructor(canvas: HTMLCanvasElement) {
        this.grid = new Grid(canvas).resize();
        this.input = new Input();
        this.ui = new Ui();
    }

    public abstract begin(): this;
    public abstract togglePause(): this;
    public abstract end(): this;
}
