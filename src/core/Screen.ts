import {PaintMatrix} from "../types.tp.ts";
import {Vector2d} from "./utils.ts";

const canvas = document.querySelector('canvas')!;

export class Screen {
    private static readonly _ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
    private static _width: number = 0;
    private static _height: number = 0;
    public static backgroundColor: string = 'black';
    private static _scale: number = 1;

    public static set size(size: Vector2d) {
        canvas.width = size.x;
        this._width = canvas.width - 1;
        canvas.height = size.y;
        this._height = canvas.height - 1;
    }

    public static autoScale(): typeof Screen {
        if (innerWidth < innerHeight) {
            canvas.style.width = `${(innerWidth).toString()}px`;
            this._scale = innerWidth / canvas.width;
            canvas.style.height = `${(this._height * this._scale).toString()}px`;
        } else {
            canvas.style.height = `${(innerHeight).toString()}px`;
            this._scale = innerHeight / canvas.height;
            canvas.style.width = `${(this._width * this._scale).toString()}px`;
        }

        return this;
    }

    public static resetScale(): typeof Screen {
        canvas.style.removeProperty('width');
        canvas.style.removeProperty('height');
        this._scale = 1;

        return this;
    }

    public static autoFit(minSquare: number, maxSquare: number, step: number = 10): typeof Screen {
        let pixelSize = step;
        let width = innerWidth / pixelSize;
        let height = innerHeight / pixelSize;

        while(width * height < minSquare) {
            pixelSize -= step;
            width = innerWidth / pixelSize;
            height = innerHeight / pixelSize;
        }

        while(width * height > maxSquare) {
            pixelSize += step;
            width = innerWidth / pixelSize;
            height = innerHeight / pixelSize;
        }

        this.size = new Vector2d(Math.floor(width), Math.floor(height));
        this._scale = pixelSize;

        return this;
    }

    public static fill(clr?: string): typeof Screen {
        this.ctx.beginPath();
        this.ctx.fillStyle = clr ?? this.backgroundColor;
        this.ctx.clearRect(0, 0, this._width, this._height);
        this.ctx.fillRect(0, 0, this._width, this._height);
        this.ctx.closePath();

        return this;
    }

    public static pixel(position: Vector2d): typeof Pixel {
        Pixel.x = position.x;
        Pixel.y = position.y;

        return Pixel;
    }

    public static get width(): number {
        return this._width;
    }

    public static get size(): Vector2d {
        return new Vector2d(this._width, this._height);
    }

    public static get height(): number {
        return this._height;
    }

    public static get ctx(): CanvasRenderingContext2D {
        return this._ctx
    }


    public static matrix(startPosition: Vector2d, matrix: (string | null)[][]): typeof Matrix {
        Matrix.matrix = matrix;
        Matrix.startPosition = startPosition;

        return Matrix;
    }

    public static get scale(): number {
        return this._scale;
    }
}

class Pixel {
    public static x: number = 0;
    public static y: number = 0;

    private static getXStart(x?: number): number {
        return (x ?? this.x);
    }

    private static getYStart(y?: number): number {
        return (y ?? this.y);
    }

    public static paint(color: string | number, g?: number, b?: number, a?: number): Pixel {
        Screen.ctx.beginPath();
        if (typeof color === 'number') {
            color = `rgba(${color}, ${g}, ${b}, ${a ?? 255})`
        }
        Screen.ctx.fillStyle = color;

        Screen.ctx.clearRect(this.getXStart(), this.getYStart(), 1, 1);
        Screen.ctx.fillRect(this.getXStart(), this.getYStart(), 1, 1);
        Screen.ctx.closePath();

        return this;
    }

    public static move(x: number, y:number): Pixel {
        const currentColor: Uint8ClampedArray = Screen.ctx.getImageData(this.getXStart() + 1, this.getXStart() + 1, 1, 1).data;
        this.clear();
        this.x = x;
        this.y = y;
        return this.paint(currentColor[0], currentColor[1], currentColor[2], currentColor[3])
    }

    public static swap(x: number, y: number): Pixel {
        const selfColor: Uint8ClampedArray = Screen.ctx.getImageData(this.getXStart() + 1, this.getXStart() + 1, 1, 1).data;
        const targetColor: Uint8ClampedArray = Screen.ctx.getImageData(this.getXStart(x) + 1, this.getYStart(y) + 1, 1, 1).data;

        this.paint(targetColor[0], targetColor[1], targetColor[2], targetColor[3]);
        this.x = x;
        this.y = y;
        return this.paint(selfColor[0], selfColor[1], selfColor[2], selfColor[3]);
    }

    public static clear(): Pixel {
        return this.paint(Screen.backgroundColor);
    }
}


class Matrix {
    public static matrix?: PaintMatrix;
    public static startPosition?: Vector2d;

    public static paint(): Matrix {
        if (this.matrix && this.startPosition) {
            const startPosition = this.startPosition;
            const startX = this.startPosition.x;

            this.matrix.forEach(row => {
                row.forEach(cell => {
                    if (cell === null) {
                        Screen.pixel(startPosition).clear();
                    } else {
                        Screen.pixel(startPosition).paint(cell);
                    }

                    startPosition.x++;
                });

                startPosition.x = startX;
                startPosition.y++;
            });
        }

        return this;
    }

    public static get array(): {v: Vector2d, color: string | null}[] {
        if (this.matrix && this.startPosition) {
            const pixels: {v: Vector2d, color: string | null}[]  = [];
            const startPosition = this.startPosition;
            const startX = this.startPosition.x;

            this.matrix.forEach(row => {
                row.forEach(cell => {
                    pixels.push({v:Object.assign({}, startPosition), color: cell});
                    startPosition.x++;
                });

                startPosition.x = startX;
                startPosition.y++;
            });

            return pixels

        }
        return [];
    }
}