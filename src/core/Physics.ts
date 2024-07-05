import {Vector2d} from "./Vector2d.ts";
import {Screen} from "./Screen.ts";

let colliderPool: Map<string, Collider> = new Map();

export enum ScreenEdges {
    Bottom,
    Left,
    Top,
    Right
}
export class Physics {
    public static collider(name: string): Collider {
        if (!colliderPool.has(name)) {
            colliderPool.set(name, new Collider(name));
        }
        return colliderPool.get(name)!;
    }

    public static clear(): Physics {
        colliderPool = new Map();
        return this;
    }
}

class Collider {
    private _position: Vector2d = new Vector2d(0, 0);
    private _angle: number = 0;
    private _map: Vector2d[] = [];
    private _screenMap: Vector2d[] = [];
    private _center: Vector2d = new Vector2d(0 ,0);
    constructor(private name: string) {}

    public set angle(angle: number) {
        if (this._angle !== angle) {
            this._screenMap = [];
            this._angle = angle;
        }
    }

    public get angle(): number {
        return this._angle;
    }

    public set position(position: Vector2d) {
        if (!this._position.equal(position)) {
            this._screenMap = [];
            this._position = position;
        }
    }

    public get position(): Vector2d {
        return this._position;
    }

    public set center(center: Vector2d) {
        if (!this._center.equal(center)) {
            this._screenMap = [];
            this._center = center;
        }
    }

    public get center(): Vector2d {
        return this._center;
    }

    public get map(): Vector2d[] {
        return this._map;
    }

    public set map(map: Vector2d[]) {
        this._screenMap = [];
        this._map = map;
    }

    public collides(collider: Collider): boolean {
        if (!collider._map.length || !this._map.length) {
            return false;
        }

        for (let i = 0; i < collider._map.length; i++) {
            for (let j = 0; j < this._map.length; j++) {
                if (collider.screenMap[i].equal(this.screenMap[j])) {
                    return true;
                }
            }
        }

        return false;
    }

    public get screenMap(): Vector2d[] {
        if (!this._screenMap.length && this._map.length) {
            this._map.forEach(v => {
                if (this._angle !== 0) {
                    v = v.rotate(this._angle, this._center);
                }
                this._screenMap.push(v.add(this._position));
            });
        }
        return this._screenMap;
    }

    public set screenMap(map: Vector2d[])  {
        this._screenMap = map;
        this._map = [];
        map.forEach(v => {
            if (this._angle !== 0) {
                v = v.rotate(-this._angle, this._center);
            }
            this._map.push(v.substract(this._position));
        });
        this.filterMap();
    }

    public remove() {
        this._angle = 0;
        this._position = new Vector2d(0, 0);
        this._map = this._screenMap = [];
        colliderPool.delete(this.name);
    }

    public add(collider: Collider) {
        this._screenMap = [];
        const deltaPosition = collider._position.substract(this._position);
        const deltaAngle = collider._angle - this._angle;
        collider._map.forEach(v => this._map.push(v.rotate(deltaAngle, collider._center).add(deltaPosition)));
        this.filterMap();
    }

    public collidesToEdge(edge?: ScreenEdges): boolean {
        const isNoEdge = edge === undefined;
        for (let i = 0; i < this.screenMap.length; i++) {
            if ((isNoEdge || edge === ScreenEdges.Bottom) && this.screenMap[i].y > Screen.height) {
                return true;
            }
            if ((isNoEdge || edge === ScreenEdges.Top) && this.screenMap[i].y < 0) {
                return true;
            }
            if ((isNoEdge || edge === ScreenEdges.Left) && this.screenMap[i].x < 0) {
                return true;
            }
            if ((isNoEdge || edge === ScreenEdges.Right) && this.screenMap[i].x > Screen.width) {
                return true;
            }
        }

        return false;
    }

    public contains(vector: Vector2d) {
        for (let i = 0; i < this._map.length; i++) {
            if (this.screenMap[i].equal(vector)) {
                return true;
            }
        }
        return false;
    }

    private filterMap() {
        this._map = this._map.filter((value, index, array) => array.indexOf(value) === index);
    }
}
