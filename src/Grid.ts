type Cell =  {
    x: number,
    y: number,
    data?: any,
}

interface CellList<T> {
    [key: string]: T;
}

export class Grid {
    private readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;
    private scale: number = 30;
    private cells: CellSingletone = new CellSingletone(this);
    private sizeX: number = 0;
    private sizeY: number = 0;
    private width: number = 0;
    private height: number = 0;
    readonly backgroundColor: string = '#2b2a33';

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
        if (ctx === null) throw 'canvas.getContext(2d) is null';
        this.ctx = ctx;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize(scale?: number): Grid {
        this.scale = scale ?? this.scale;
        this.width = this.canvas.width = innerWidth - (innerWidth % this.scale);
        this.height = this.canvas.height = innerHeight - (innerHeight % this.scale);

        this.sizeX = this.width / this.scale;
        this.sizeY = this.height / this.scale;

        return this.redraw();
    }

    redraw(): Grid {
        for (let x: number = 0; x <= this.width / this.scale; x ++) {
            for (let y: number = 0; y <= this.height / this.scale; y ++) {
                this.cell(x, y).paint(this.backgroundColor);
            }
        }

        return this;
    }

    cell(x: number, y: number): CellSingletone {
        return this.cells.get(x, y);
    }

    getScale(): number {
        return this.scale;
    }

    getSize(): {x: number, y: number} {
        return {
            x: this.sizeX,
            y: this.sizeY,
        };
    }
}

class CellSingletone {
    private cells: CellList<Cell> = {};
    private data: Cell;

    constructor(private grid: Grid) {
        this.data = this.cells['0_0'];
    }

    get(x: number, y: number): CellSingletone {
        const cellKey = `${x.toString()}_${y.toString()}`;
        this.cells[cellKey] ??= {x: x, y: y};
        this.data = this.cells[cellKey];
        return this;
    }

    private getX(x?: number): number {
        return (x ?? this.data.x) * this.grid.getScale();
    }

    private getY(y?: number): number {
        return (y ?? this.data.y) * this.grid.getScale();
    }

    paint(color: string | number, g?: number, b?: number, a?: number): CellSingletone {
        this.grid.ctx.beginPath();
        if (typeof color === 'number') {
            color = `rgba(${color}, ${g}, ${b}, ${a ?? 255})`
        }

        this.grid.ctx.fillStyle = color;

        const x: number = this.getX();
        const y: number = this.getY();
        const w: number = this.grid.getScale() - this.grid.ctx.lineWidth;

        this.grid.ctx.clearRect(x, y, w, w);
        this.grid.ctx.fillRect(x, y, w, w);
        this.grid.ctx.closePath();

        return this;
    }

    move(x: number, y:number) {
        const currentColor: Uint8ClampedArray = this.grid.ctx.getImageData(this.getX() + 1, this.getY() + 1, 1, 1).data;
        this.clear();
        return this.get(x, y).paint(currentColor[0], currentColor[1], currentColor[2], currentColor[3])
    }

    swap(x: number, y: number) {
        const selfColor: Uint8ClampedArray = this.grid.ctx.getImageData(this.getX() + 1, this.getY() + 1, 1, 1).data;
        const targetColor: Uint8ClampedArray = this.grid.ctx.getImageData(this.getX(x) + 1, this.getY(y) + 1, 1, 1).data;

        this.paint(targetColor[0], targetColor[1], targetColor[2], targetColor[3]);
        return this.get(x, y).paint(selfColor[0], selfColor[1], selfColor[2], selfColor[3]);
    }

    clear() {
        return this.paint(this.grid.backgroundColor);
    }
}
