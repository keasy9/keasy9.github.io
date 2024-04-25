import {Point} from "./types.tp.ts";
import {v4 as uuidv4} from 'uuid';

export class Input {
    public static keyboard = {
        any: (event: Event) => event instanceof KeyboardEvent,
        up: (event: Event) => event instanceof KeyboardEvent && (['ArrowUp', 'KeyW', 'Numpad8'].indexOf(event.code) !== -1),
        down: (event: Event) => event instanceof KeyboardEvent && (['ArrowDown', 'KeyD', 'Numpad2'].indexOf(event.code) !== -1),
        left: (event: Event) => event instanceof KeyboardEvent && (['ArrowLeft', 'KeyA', 'Numpad4'].indexOf(event.code) !== -1),
        right: (event: Event) => event instanceof KeyboardEvent && (['ArrowRight', 'KeyD', 'Numpad6'].indexOf(event.code) !== -1),
        space: (event: Event) => event instanceof KeyboardEvent && (['Space', 'Numpad5'].indexOf(event.code) !== -1),
    }
    public static mouse = {
        click: (event: Event) => event instanceof MouseEvent,
        left: (event: Event) => event instanceof MouseEvent && event.button === 1,
        right: (event: Event) => event instanceof MouseEvent && event.button === 2,
        wheelClick: (event: Event) => event instanceof MouseEvent && event.button === 3,
        scroll: (event: Event) => event instanceof WheelEvent,
        scrollUp: (event: Event) => event instanceof WheelEvent && event.deltaY < 0,
        scrollDown: (event: Event) => event instanceof WheelEvent && event.deltaY > 0,
    }
    public static touchScreen = {
        touch: (event: Event) => this.mouse.click(event) || window.TouchEvent && event instanceof TouchEvent,
        swipe: (event: Event) => {
            const result = window.TouchEvent
            && event instanceof TouchEvent
            && Input.touchStart
            && (
                Input.touchStart.x - event.touches[0].clientX != 0
                || Input.touchStart.y - event.touches[0].clientY != 0
            );

            if (result) Input.touchStart = null;

            return result;
        },
        swipeUp: (event: Event) => {
            if (!(window.TouchEvent && event instanceof TouchEvent && Input.touchStart)) return false;

            const yDiff = Input.touchStart.y - event.touches[0].clientY;
            const result = Math.abs(Input.touchStart.x - event.touches[0].clientX) <= Math.abs(yDiff) && yDiff > 0;

            if (result) Input.touchStart = null;

            return result;
        },
        swipeDown: (event: Event) => {
            if (!(window.TouchEvent && event instanceof TouchEvent && Input.touchStart)) return false;

            const yDiff = Input.touchStart.y - event.touches[0].clientY;
            const result = Math.abs(Input.touchStart.x - event.touches[0].clientX) <= Math.abs(yDiff) && yDiff < 0;

            if (result) Input.touchStart = null;

            return result;
        },
        swipeLeft: (event: Event) => {
            if (!(window.TouchEvent && event instanceof TouchEvent && Input.touchStart)) return false;

            const xDiff = Input.touchStart.x - event.touches[0].clientX;
            const result = Math.abs(xDiff) > Math.abs(Input.touchStart.y - event.touches[0].clientY) && xDiff > 0;

            if (result) Input.touchStart = null;

            return result;
        },
        swipeRight: (event: Event) => {
            if (!(window.TouchEvent && event instanceof TouchEvent && Input.touchStart)) return false;

            const xDiff = Input.touchStart.x - event.touches[0].clientX;
            const result = Math.abs(xDiff) > Math.abs(Input.touchStart.y - event.touches[0].clientY) && xDiff < 0;

            Input.touchStart = null;

            return result;
        },
    }
    private static touchStart: Point | null = null;
    private bindings: Map<Function, Map<string, Function>> = new Map();

    constructor() {
        window.addEventListener('keydown', e => this.handle(e));
        window.addEventListener('click', e => this.handle(e));
        document.addEventListener('touchstart', e => {
            Input.touchStart = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
            };
        });
        window.addEventListener('touchmove', e => this.handle(e), false);
    }

    private handle(event: Event) {
        this.bindings.forEach((callbacks, checkEvent) => {
            if (checkEvent(event)) {
                callbacks.forEach(callback => callback(event));
            }
        });
    }

    public listen(event: Function, callback: Function): string  {
        if (!this.bindings.has(event)) this.bindings.set(event, new Map());

        const uuid = uuidv4();
        this.bindings.get(event)!.set(uuid, callback);

        return uuid;
    }

    public notListen(event: Function, uuid: string): Function | null {
        if (this.bindings.has(event)) return null;

        const func = this.bindings.get(event)!.get(uuid) ?? null;
        this.bindings.get(event)!.delete(uuid);

        return func;
    }
}