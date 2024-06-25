import {v4 as uuidv4} from 'uuid';
import {Vector2d} from "./utils.ts";

export type InputEvent = (event: Event) => boolean

export class Input {
    public static keyboard: {[index: string]: Function, key: Function} = {
        any: (event: Event) => event instanceof KeyboardEvent,
        up: (event: Event) => event instanceof KeyboardEvent && (['ArrowUp', 'KeyW'].indexOf(event.code) !== -1),
        down: (event: Event) => event instanceof KeyboardEvent && (['ArrowDown', 'KeyS'].indexOf(event.code) !== -1),
        left: (event: Event) => event instanceof KeyboardEvent && (['ArrowLeft', 'KeyA'].indexOf(event.code) !== -1),
        right: (event: Event) => event instanceof KeyboardEvent && (['ArrowRight', 'KeyD'].indexOf(event.code) !== -1),
        key: (key: string): InputEvent => { return (event: Event) => {
            return event instanceof KeyboardEvent && (event.code.toLowerCase() === key || (<KeyboardEvent>event).key.toLowerCase() === key)
        }}
    }
    public static mouse: {[index: string]: InputEvent} = {
        click: (event: Event) => event instanceof MouseEvent,
        left: (event: Event) => event instanceof MouseEvent && event.button === 1,
        right: (event: Event) => event instanceof MouseEvent && event.button === 2,
        wheelClick: (event: Event) => event instanceof MouseEvent && event.button === 3,
        scroll: (event: Event) => event instanceof WheelEvent,
        scrollUp: (event: Event) => event instanceof WheelEvent && event.deltaY < 0,
        scrollDown: (event: Event) => event instanceof WheelEvent && event.deltaY > 0,
    }
    public static touchScreen: {[index: string]: InputEvent} = {
        touch: (event: Event) => this.mouse.click(event) || window.TouchEvent && event instanceof TouchEvent,
        swipe: (event: Event) => {
            const result: boolean = Boolean(
                window.TouchEvent
                && event instanceof TouchEvent
                && Input.touchStart
                && (
                    Input.touchStart.x - event.touches[0].clientX != 0
                    || Input.touchStart.y - event.touches[0].clientY != 0
                )
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
    private static touchStart: Vector2d | null = null;
    private static bindings: Map<Function, Map<string, Function>> = new Map();
    private static preventUnload: boolean = false;

    public static init? = (): void => {
        window.addEventListener('keydown', e => this.handle(e));
        window.addEventListener('click', e => this.handle(e));
        document.addEventListener('touchstart', e => {
            this.touchStart = new Vector2d(
                e.touches[0].clientX,
                e.touches[0].clientY
            );
        });
        window.addEventListener('touchmove', e => this.handle(e), false);
        window.addEventListener('beforeunload', e => this.handleUnload(e));
        delete Input.init;
    }

    private static handleUnload(event: BeforeUnloadEvent) {
        if (this.preventUnload) {
            event.preventDefault();
        }
    }

    private static handle(event: Event) {
        this.bindings.forEach((callbacks, checkEvent) => {
            if (checkEvent(event)) {
                callbacks.forEach(callback => callback(event));
            }
        });
    }

    public static trigger(event: Function) {
        this.bindings.forEach((callbacks, checkEvent) => {
            if (checkEvent.toString() === event.toString()) {
                callbacks.forEach(callback => callback());
            }
        });
    }

    public static listen(event: InputEvent, callback: Function): string  {
        if (event === Input.touchScreen.swipeDown) this.preventUnload = true;
        if (!this.bindings.has(event)) this.bindings.set(event, new Map());

        const uuid = uuidv4();
        this.bindings.get(event)!.set(uuid, callback);

        return uuid;
    }

    public static stopListen(event: InputEvent, uuid: string): Function | null {
        if (event === Input.touchScreen.swipeDown) this.preventUnload = false;
        if (!this.bindings.has(event)) return null;

        const func = this.bindings.get(event)!.get(uuid) ?? null;
        this.bindings.get(event)!.delete(uuid);

        return func;
    }

    public static deaf(): Input {
        this.bindings = new Map();
        return this;
    }
}

if (Input.init) {
    Input.init();
}
