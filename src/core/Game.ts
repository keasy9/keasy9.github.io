import {Screen} from "./Screen.ts";
import {Vector2d} from "./utils.ts";

export abstract class Game {
    protected static continue: boolean = false;
    protected static speed: number = 1;
    protected static resizeTimer?: number;

    public static resize() {
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
        }

        this.resizeTimer = setTimeout(() => { this._resize() }, 100);
        return this;
    }

    protected static _resize() {}

    public static begin() {
        Screen.size = new Vector2d(100, 100);
        this.continue = true;
        return this;
    }

    public static togglePause() {
        this.continue = !this.continue;
        return this;
    }

    public static end() {
        this.continue = !this.continue;
        return this;
    }
}
