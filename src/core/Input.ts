import {Vector2d} from "./Vector2d.ts";

// TODO
//  мультитач?
//  отслеживание клика по координатам экрана
//  переписать использование системы ввода - сейчас работает как есть, но используется window.addEventListener вместо Input.bind
//  написать интерфейс для Input, чтобы его можно было заменить в будущем

export enum InputType {
    Up = 'up',
    Down = 'down',
    Both = 'both',
}

type dragDirection = (delta: Vector2d, precision: number) => boolean

// TODO диагональные свайпы и свайп в любом направлении для постоянного отслеживания перемещения курсора/пальца
export const drag: {
    up: dragDirection,
    down: dragDirection,
    right: dragDirection,
    left: dragDirection,
} = {
    up: (delta: Vector2d, precision: number = 0) => delta.y < -precision,
    down: (delta: Vector2d, precision: number = 0) => delta.y > precision,
    right: (delta: Vector2d, precision: number = 0) => delta.x > precision,
    left: (delta: Vector2d, precision: number = 0) => delta.x < -precision,
}

type ContinuedInputOptions = {
    interval: number,
    delay?: number,
}

type HoldInputOptions = {
    time: number,
}

type BaseInputOptions = {
    type?: InputType,
}

type InputOptions = BaseInputOptions | HoldInputOptions | ContinuedInputOptions
type PrecisionedInputOptions = {
    precision?: number,
}
type SwipeInputOptions = (PrecisionedInputOptions & ContinuedInputOptions) | PrecisionedInputOptions

export type InputEvent = {
    id: string,
    action: (event: Event, callback: Function) => boolean,
    priority: number,
}

class I {
    private holds: Map<string, number> = new Map();
    private timers: Map<string, number> = new Map();
    private events: Map<string, InputEvent> = new Map();
    private bindings: Map<string, Set<string>> = new Map();
    private triggerBlackList: Set<string> = new Set();
    private callbacks: Map<string, Function> = new Map();
    private dragStart?: Vector2d;
    private eventsSortedByPriority = false;
    private action(isDownEvent: boolean, id: string, callback: Function, options: InputOptions, callbackOnInterval?: Function) {
        if (isDownEvent) {
            if (!this.triggerBlackList.has(id) && 'type' in options && (options.type === InputType.Down || options.type === InputType.Both)) {
                callback();
                return true;
            } else if ('time' in options) {
                this.holds.set(id, Date.now());
            } else if ('interval' in options && !this.triggerBlackList.has(id)) {
                this.timers.set(id, setTimeout(() => {
                    this.timers.set(id, setInterval(() => {
                        (callbackOnInterval ?? callback)();
                    }, options.interval));
                    (callbackOnInterval ?? callback)();
                    this.triggerBlackList.add(id);
                }, options.delay ?? options.interval));
                return true;
            }
        } else {
            if ('interval' in options && this.timers.has(id)) {
                const timer = this.timers.get(id)!;
                clearTimeout(timer);
                clearInterval(timer);
            }
            if (!this.triggerBlackList.has(id) && 'type' in options && (options.type === InputType.Up || options.type === InputType.Both)) {
                callback();
                return true;
            } else if ('time' in options) {
                if (this.holds.has(id)) {
                    if (Date.now() - this.holds.get(id)! >= options.time) {
                        callback();
                    }
                    this.holds.delete(id);
                    return true;
                }
            }
            this.triggerBlackList.delete(id);
        }
        return false;
    }

    public keyboard = {
        key: (key: string, options?: InputOptions): InputEvent => {
            key = key.toLowerCase();
            options ??= {type: InputType.Up};
            const id = `keyboard_${key}`;
            return {
                id: `${id}_${JSON.stringify(options)}`,
                action: (event: Event, callback: Function) => {
                    if (!(event instanceof KeyboardEvent && (event.key.toLowerCase() === key || event.code.toLowerCase() === key)) || event.repeat) return false;
                    return this.action(event.type === 'keydown', id, callback, options);
                },
                priority: 100,
            };
        }
    }
    private pointer = {
        position: new Vector2d(0 ,0),
        currentDrag: '',
        pressed: false,
        triggered: false,
        button: (pointerType: string, button: number, options?: InputOptions): InputEvent => {
            options ??= {type: InputType.Up};
            const id = `${pointerType}_${button}`;
            return {
                id: `${id}_${JSON.stringify(options)}`,
                action: (event: Event, callback: Function) => {
                    if (!(event instanceof PointerEvent && event.button === button && event.pointerType === pointerType)) return false;
                    if (event.type === 'pointerdown') {
                        if (!this.pointer.triggered) {
                            if (!this.triggerBlackList.has(id) && 'type' in options && (options.type === InputType.Down || options.type === InputType.Both)) {
                                callback();
                                return true;
                            } else if ('time' in options) {
                                this.holds.set(id, Date.now());
                            } else if ('interval' in options && !this.triggerBlackList.has(id)) {
                                this.timers.set(id, setTimeout(() => {
                                    if (!this.pointer.triggered) {
                                        this.timers.set(id, setInterval(() => {
                                            callback();
                                        }, options.interval));
                                        callback();
                                    }
                                    this.pointer.triggered = true;
                                    this.triggerBlackList.add(id);
                                }, options.delay ?? options.interval));
                                return true;
                            }
                        }
                    } else {
                        if ('interval' in options && this.timers.has(id)) {
                            const timer = this.timers.get(id)!;
                            clearTimeout(timer);
                            clearInterval(timer);
                        }
                        if (!this.pointer.triggered && !this.triggerBlackList.has(id) && 'type' in options && (options.type === InputType.Up || options.type === InputType.Both)) {
                            callback();
                            return true;
                        } else if ('time' in options) {
                            if (this.holds.has(id) && !this.pointer.triggered) {
                                if (Date.now() - this.holds.get(id)! >= options.time) {
                                    callback();
                                }
                                this.holds.delete(id);
                                return true;
                            }
                        }
                        this.triggerBlackList.delete(id);
                    }
                    return false;
                },
                priority: 100,
            };
        },
        drag: (pointerType: string, direction: dragDirection, options?: SwipeInputOptions): InputEvent => {
            const id = `${pointerType}_drag`;
            const dragDirectionString = direction.toString();
            return {
                id: `${id}_${dragDirectionString}_${JSON.stringify(options ?? {})}`,
                action: (event: Event, callback: Function) => {
                    if (!(event instanceof PointerEvent && event.pointerType === pointerType) || this.pointer.currentDrag === dragDirectionString) return false;
                    if (event.type === 'pointermove') {
                        if (this.dragStart && this.pointer.pressed) {
                            if (direction(new Vector2d(event.clientX, event.clientY).substract(this.dragStart), options?.precision ?? 50)) {
                                if (this.triggerBlackList.has(id)) {
                                    if (this.timers.has(id)) {
                                        const timer = this.timers.get(id)!;
                                        clearTimeout(timer);
                                        clearInterval(timer);
                                    }
                                }
                                if (options && 'interval' in options) {
                                    console.log('here');
                                    this.timers.set(id, setTimeout(() => {
                                        this.timers.set(id, setInterval(() => {
                                            callback();
                                        }, options.interval));
                                        callback();
                                    }, options.delay ?? options.interval));
                                }
                                this.pointer.currentDrag = dragDirectionString;
                                this.triggerBlackList.add(id);
                                this.pointer.triggered = true;
                                callback();
                                return true;
                            }
                        }
                    } else if (event.type === 'pointerup') {
                        if (options && 'interval' in options) {
                            const timer = this.timers.get(id)!;
                            clearTimeout(timer);
                            clearInterval(timer);
                        }
                        this.triggerBlackList.delete(id);
                    }
                    return false;
                },
                priority: 10,
            };
        }
    }
    public mouse = {
        getPosition: () => this.pointer.position,
        button: (button: number, options?: InputOptions): InputEvent => {
            return this.pointer.button('mouse', button, options);
        },
        drag: (direction: dragDirection, options?: SwipeInputOptions): InputEvent => {
            return this.pointer.drag('mouse', direction, options);
        }
    }
    public touchScreen = {
        getPosition: () => this.pointer.pressed ? this.pointer.position : null,
        touch: (options?: InputOptions): InputEvent => {
            return this.pointer.button('touch', 0, options);
        },
        swipe: (direction: dragDirection, options?: SwipeInputOptions): InputEvent => {
            return this.pointer.drag('touch', direction, options);
        }
    }

    constructor() {
        const canvas: HTMLCanvasElement = document.querySelector('canvas')!;
        window.addEventListener('keydown', (e) => this.handle(e));
        window.addEventListener('keyup', (e) => this.handle(e));
        canvas.addEventListener('pointerdown', (e) => {
            this.pointer.pressed = true;
            this.dragStart = new Vector2d(e.clientX, e.clientY);
            this.handle(e);
        });
        canvas.addEventListener('pointermove', (e) => {
            this.pointer.position = new Vector2d(e.clientX, e.clientY);
            this.handle(e);
        });
        canvas.addEventListener('pointerup', (e) => {
            delete this.dragStart;
            this.pointer.pressed = false;
            this.pointer.currentDrag = '';
            this.handle(e);
            this.pointer.triggered = false;
        });
    }

    public handle(event: Event) {
        if (!this.eventsSortedByPriority) {
            this.events = new Map([...this.events].sort((a, b) => a[1].priority - b[1].priority));
            this.eventsSortedByPriority = true;
        }
        for (const [eventId, inputEvent] of this.events) {
            if (this.bindings.has(eventId)) {
                inputEvent.action(event, () => {
                    this.trigger(this.bindings.get(eventId)!)
                });
            }
        }
    }

    public bind(event: InputEvent, binding: string): this {
        this.events.set(event.id, event);
        this.eventsSortedByPriority = false;

        if (this.bindings.has(event.id)) {
            this.bindings.get(event.id)!.add(binding);
        } else {
            this.bindings.set(event.id, new Set([binding]));
        }

        return this;
    }

    public unbind(event: InputEvent, binding: string): this {
        if (this.bindings.has(event.id)) {
            this.bindings.get(event.id)!.delete(binding);
        }

        return this;
    }

    public link(binding: string, callback: Function): this  {
        this.callbacks.set(binding, callback);
        return this;
    }

    public unlink(binding: string): this {
        this.callbacks.delete(binding);
        return this;
    }

    public trigger(bindings: string | string[] | Set<string> | InputEvent): this {

        if (typeof bindings === 'string') {
            bindings = [bindings];
        } else if ('id' in bindings) {
            bindings = this.bindings.get(bindings.id) ?? [];
        }

        bindings.forEach(binding => {
            if (this.callbacks.has(binding)) {
                this.callbacks.get(binding)!();
            }
        })

        return this;
    }

    public clear(): this {
        this.timers.forEach(t => {
            clearTimeout(t);
            clearInterval(t);
        });
        
        this.events = new Map();
        this.bindings = new Map();
        this.holds = new Map();
        this.timers = new Map();
        this.triggerBlackList = new Set();
        this.callbacks = new Map();
        delete this.dragStart;

        return this;
    }
}

export const Input: I = new I();
