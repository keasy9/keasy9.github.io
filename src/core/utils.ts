export class Vector2d {
    constructor(public x: number, public y: number) {}

    public add(vector: Vector2d): this {
        this.x += vector.x;
        this.y += vector.y;

        return this;
    }

    public substract(vector: Vector2d): this {
        this.x -= vector.x;
        this.y -= vector.y;

        return this;
    }

    public multiply(vector: Vector2d | number): this {
        if (typeof vector === 'number') {
            this.x *= vector;
            this.y *= vector;
        } else {
            this.x *= vector.x;
            this.y *= vector.y;
        }

        return this;
    }

    public divide(vector: Vector2d): this {
        this.x /= vector.x;
        this.y /= vector.y;

        return this;
    }

    public round(): this {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);

        return this;
    }

    public maxLimit(vector: Vector2d): this {
        this.x = Math.min(this.x, vector.x);
        this.y = Math.min(this.y, vector.y);

        return this;
    }

    public clone(): Vector2d {
        return new Vector2d(this.x, this.y)
    }
}
