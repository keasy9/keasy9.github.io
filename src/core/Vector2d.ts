// TODO: vector2d array type

export class Vector2d {
    constructor(public x: number, public y: number) {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
    }

    public add(vector: Vector2d): Vector2d {
        return new Vector2d(this.x + vector.x, this.y + vector.y);
    }

    public substract(vector: Vector2d): Vector2d {
        return new Vector2d(this.x - vector.x, this.y - vector.y);
    }

    public multiply(vector: Vector2d | number): Vector2d {
        if (typeof vector === 'number') {
            return new Vector2d(this.x * vector, this.y * vector);
        } else {
            return new Vector2d(this.x * vector.x, this.y * vector.y);
        }
    }

    public divide(vector: Vector2d): Vector2d {
        return new Vector2d(this.x / vector.x, this.y / vector.y);
    }

    public round(): Vector2d {
        return new Vector2d(Math.round(this.x), Math.round(this.y));
    }

    public maxLimit(vector: Vector2d): Vector2d {
        return new Vector2d(Math.min(this.x, vector.x), Math.min(this.y, vector.y));
    }

    public equal(vector: Vector2d): boolean {
        return this.x === vector.x && this.y === vector.y;
    }

    public negate(): Vector2d {
        return new Vector2d(-this.x, -this.y);
    }

    public rotate(angle: number, point: Vector2d = new Vector2d(0 ,0)): Vector2d {
        if (angle === 0) {
            return this;
        }
        angle = angle * Math.PI / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const deltaX = this.x - point.x;
        const deltaY = this.y - point.y;

        const x = Math.round(point.x + (deltaX * cos) - (deltaY * sin));
        const y = Math.round(point.y + (deltaX * sin) + (deltaY * cos));

        return new Vector2d(x, y);
    }
}
