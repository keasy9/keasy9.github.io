import {Input, InputEvent} from "./Input.ts";
import {Sound} from "./Sound.ts";
import {Vector2d} from "./utils.ts";
import {Screen} from "./Screen.ts";

const uiContainer: HTMLDivElement = document.querySelector('.ui-full')!;
const overlay: HTMLDivElement = uiContainer.querySelector('.overlay')!;

window.addEventListener("contextmenu", e => e.preventDefault());

function playSound() {
    return Sound.play(`menuElementFlip${Math.round(Math.random() * 2)}`);
}

export enum TouchScreenElementPosition {
    TopRight = 'top-right',
    BottomRight = 'bottom-right',
    TopLeft = 'top-left',
    BottomLeft = 'bottom-left',
    TopCenter = 'top-center',
    BottomCenter = 'bottom-center',
    CenterCenter = 'center-center',
    LeftCenter = 'left-center',
    RightCenter = 'right-center',
}

export class Ui {
    public static readonly touchScreen = new class {
        private elements: Map<string, TouchScreenUiElement> = new Map();

        public get dPad(): TouchScreenDPad {
            if (!this.elements.has('d-pad')) {
                const elem = document.createElement('div');
                elem.classList.add('d-pad');
                elem.id = 'd-pad';
                elem.insertAdjacentHTML(
                    'beforeend',
                    `<button><img src="${new URL('../assets/img/dPadArrow.png', import.meta.url).href}"/></button>`.repeat(4)
                );

                uiContainer.appendChild(elem);

                this.elements.set('d-pad', new TouchScreenDPad(elem))
            }

            return (<TouchScreenDPad>this.elements.get('d-pad'));
        }

        public button(name: string, sprite?: string): TouchScreenButton {
            name = `${name}-button`;
            if (!this.elements.has(name)) {
                if (!sprite) {
                    throw new TypeError('Ui.button expects 2 arguments when creating new button but got 1')
                }
                const elem = document.createElement('button');
                elem.insertAdjacentHTML('beforeend', `<img src="${new URL(`../assets/img/${sprite}`, import.meta.url).href}" />`);
                elem.classList.add(TouchScreenElementPosition.TopRight);
                elem.id = name;

                uiContainer.appendChild(elem);

                this.elements.set(name, new TouchScreenButton(elem, name));
            }

            return (<TouchScreenButton>this.elements.get(name));
        }

        public removeElem(name: string) {
            if (this.elements.has(name)) {
                this.elements.get(name)!.remove();
                this.elements.delete(name);
            }
        }
    };

    public static menu(name: string): Menu {
        return Menu.get(name);
    }
}

export enum MenuElementType {
    Label = 'label',
    Button = 'button',
    Switch = 'switch',
    Selection = 'selection',
    Slider = 'slider',
    Line = 'line',
    Space = 'space',
}

class Menu {
    private static menus: Map<string, Menu> = new Map();
    private elements: Map<string, MenuElement> = new Map();
    private static openedMenu?: Menu;
    private readonly name: string;
    private readonly htmlElement: HTMLDivElement;

    constructor(name: string) {
        this.name = name;

        this.htmlElement = document.createElement('div');
        this.htmlElement.classList.add('menu');
        this.htmlElement.classList.add('hidden');
        this.htmlElement.id = `menu_${name}`;
        this.htmlElement.insertAdjacentHTML('beforeend', '<div class="container"></div>')

        uiContainer.appendChild(this.htmlElement);
    }

    public static get(name: string): Menu {
        if (!this.menus.has(name)) {
            this.menus.set(name, new Menu(name));
        }

        return this.menus.get(name)!;
    }

    public open(): this {
        Menu.openedMenu?.close(false);
        Menu.openedMenu = this;
        overlay.classList.remove('hidden');
        this.htmlElement.classList.remove('hidden');
        return this;
    }

    public close(hideOverlay: boolean = true): this {
        if (Menu.openedMenu === this) {
            delete Menu.openedMenu;
        }

        this.htmlElement.classList.add('hidden');
        if (hideOverlay) {
            overlay.classList.add('hidden');
        }
        return this;
    }

    public get opened(): boolean {
        return Menu.openedMenu === this;
    }

    public toggle(): this {
        if (this.opened) {
            this.close();
        } else {
            this.open();
        }

        return this;
    }

    public remove(hideOverlayIfOpened: boolean = true): boolean {
        this.close(hideOverlayIfOpened);
        this.htmlElement.remove();
        return Menu.menus.delete(this.name);
    }

    public elem(elemType: MenuElementType, name: string): MenuElement {
        name = `${elemType}_${name}`
        if (!this.elements.has(name)) {
            let elem: HTMLElement;
            switch (elemType) {
                case MenuElementType.Label:
                    elem = document.createElement('label');
                    this.elements.set(name, new LabelMenuElement(elem, this, name));
                    break;
                case MenuElementType.Button:
                    elem = document.createElement('button');
                    this.elements.set(name, new ButtonMenuElement(elem, this, name));
                    break;
                case MenuElementType.Switch:
                    elem = document.createElement('label');
                    this.elements.set(name, new SwitchMenuElement(elem, this, name));
                    break;
                case MenuElementType.Line:
                    elem = document.createElement('span');
                    this.elements.set(name, new LineMenuElement(elem, this, name));
                    break;
                case MenuElementType.Slider:
                    elem = document.createElement('div');
                    this.elements.set(name, new SliderMenuElement(elem, this, name));
                    break;
                case MenuElementType.Selection:
                    elem = document.createElement('div');
                    this.elements.set(name, new SelectionMenuElement(elem, this, name));
                    break;
                case MenuElementType.Space:
                    elem = document.createElement('span');
                    this.elements.set(name, new SpaceMenuElement(elem, this, name));
                    break;
            }
            elem!.classList.add(elemType);
            elem!.id = `menu_${this.name}_${name}`;
            this.htmlElement.firstElementChild!.appendChild(elem!);
        }
        return this.elements.get(name)!;
    }

    public removeElem(elemType: MenuElementType | string, name?: string): this {
        if (name !== undefined) {
            name = `${elemType}_${name}`;
        } else {
            name = elemType;
        }

        if (this.elements.has(name)) {
            this.elements.delete(name);
            this.htmlElement.querySelector(`#menu_${this.name}_${name}`)?.remove();
        }

        return this;
    }

    public label(name: string): LabelMenuElement {
        return <LabelMenuElement>this.elem(MenuElementType.Label, name);
    }

    public button(name: string): ButtonMenuElement {
        return <ButtonMenuElement>this.elem(MenuElementType.Button, name);
    }

    public switch(name: string): SwitchMenuElement {
        return <SwitchMenuElement>this.elem(MenuElementType.Switch, name);
    }

    public line(name: string): LineMenuElement {
        return <LineMenuElement>this.elem(MenuElementType.Line, name);
    }

    public slider(name: string): SliderMenuElement {
        return <SliderMenuElement>this.elem(MenuElementType.Slider, name);
    }

    public selection(name: string): SelectionMenuElement {
        return <SelectionMenuElement>this.elem(MenuElementType.Selection, name);
    }

    public space(name: string): SpaceMenuElement {
        return <SpaceMenuElement>this.elem(MenuElementType.Space, name);
    }

}

abstract class MenuElement {
    constructor(protected readonly htmlElement: HTMLElement, protected readonly menu: Menu, protected readonly name: string) {}

    public remove() {
        this.menu.removeElem(this.name);
    }
}

class SpaceMenuElement extends MenuElement {
    public set height(height: number) {
        this.htmlElement.style.height = `${height}px`;
    }

    public get height(): number {
        return parseInt(this.htmlElement.style.height);
    }
}

class LineMenuElement extends MenuElement {}

class LabelMenuElement extends MenuElement {
    public set text(text: string) {
        this.htmlElement.innerText = text.trim();
    }

    public get text(): string {
        return this.htmlElement.innerText;
    }
}

class NavigationMenuElement extends LabelMenuElement {
    constructor(protected readonly htmlElement: HTMLElement, protected readonly menu: Menu, protected readonly name: string) {
        super(htmlElement, menu, name);

        if (window.TouchEvent === undefined) {
            this.htmlElement.tabIndex = -1;
            this.htmlElement.onmousemove = () => {
                this.htmlElement.focus();
            }
            this.htmlElement.onkeydown = (event) => { this.onkeydown(event) };
            this.htmlElement.onfocus = () => { playSound() }
        }
    }

    protected onkeydown(event: KeyboardEvent) {
        let elem: HTMLElement = this.htmlElement,
            upDirection = false;

        if (Input.keyboard.up(event)) {
            upDirection = true;
        } else if (!Input.keyboard.down(event)) {
            return;
        }

        do {
            if (upDirection) {
                if (elem.previousElementSibling) {
                    elem = (<HTMLElement>elem.previousElementSibling);
                } else {
                    elem = (<HTMLElement>elem.parentElement!.lastElementChild);
                }

            } else {
                if (elem.nextElementSibling) {
                    elem = (<HTMLElement>elem.nextElementSibling);
                } else {
                    elem = (<HTMLElement>elem.parentElement!.firstElementChild);
                }
            }
            if (elem.hasAttribute('tabIndex')) {
                elem.focus();
                return;
            }
        } while(elem && elem !== this.htmlElement);
    }
}

class ButtonMenuElement extends NavigationMenuElement {
    public set onclick(callback: () => any | null) {
        this.htmlElement.onclick = () => {
            if (callback !== null) {
                playSound();
                callback();
            }
        }
    }

    protected onkeydown(event: KeyboardEvent) {
        if (Input.keyboard.key('enter')(event) || Input.keyboard.key('space')(event)) {
            this.htmlElement.click();
        } else {
            super.onkeydown(event);
        }
    }
}

class SwitchMenuElement extends NavigationMenuElement {
    public onchange?: (state: boolean) => any;
    private _state: boolean = false;

    constructor(protected readonly htmlElement: HTMLElement, protected readonly menu: Menu, protected readonly name: string) {
        super(htmlElement, menu, name);
        htmlElement.insertAdjacentHTML(
        'beforeend',
            '<input type="checkbox" class="hidden"/><span></span><span></span>'
        );

        (<HTMLInputElement>this.htmlElement.firstElementChild).onchange = () => {
            this.state = (<HTMLInputElement>this.htmlElement.firstElementChild).checked;
            if (this.onchange !== undefined) {
                playSound();
                this.onchange(this.state);
            }
        };
    }

    public set text(text: string) {
        (<HTMLLabelElement>this.htmlElement.children[1]).innerText = `${text.trim()}: `;
    }

    public get text(): string {
        return (<HTMLLabelElement>this.htmlElement.lastElementChild).innerText;
    }

    public get state(): boolean {
        return this._state;
    }

    public set state(state: boolean) {
        (<HTMLInputElement>this.htmlElement.firstElementChild).checked = state;
        this._state = state;
    }

    protected onkeydown(event: KeyboardEvent) {
        if (Input.keyboard.key('enter')(event) || Input.keyboard.key('space')(event)) {
            playSound();
            this.state = !this._state;
        } else {
            super.onkeydown(event);
        }
    }
}

class SliderMenuElement extends NavigationMenuElement {
    public onchange?: (value: number) => any;
    private _value: number = 0.5;
    private rect?: DOMRect;

    constructor(protected readonly htmlElement: HTMLElement, protected readonly menu: Menu, protected readonly name: string) {
        super(htmlElement, menu, name);
        htmlElement.insertAdjacentHTML(
            'beforeend',
            `<span></span><div><span>< </span><div>${'<span></span>'.repeat(20)}</div><span> ></span></div>`
        );

        this.value = this._value;

        const onMouseUp = () => {
            (<HTMLDivElement>htmlElement.lastElementChild!.children[1]).onmousemove = null;
            document.removeEventListener('mouseup', onMouseUp, false);
            if (this.onchange !== undefined) {
                playSound();
                this.onchange(this.value);
            }
        }

        (<HTMLDivElement>htmlElement.lastElementChild!.children[1]).onmousedown = (event: MouseEvent) => {
            this.trackMouse(event);
            (<HTMLDivElement>htmlElement.lastElementChild!.children[1]).onmousemove = (event: MouseEvent) => { this.trackMouse(event) };
            document.addEventListener('mouseup', onMouseUp, false);
        };

        (<HTMLSpanElement>this.htmlElement.lastElementChild!.firstElementChild).onclick = () => {
            this.value = (this._value ?? 0) - 0.05;
            if (this.onchange !== undefined) {
                playSound();
                this.onchange(this.value);
            }
        }
        (<HTMLSpanElement>this.htmlElement.lastElementChild!.lastElementChild).onclick = () => {
            this.value = (this._value ?? 0) + 0.05;
            if (this.onchange !== undefined) {
                playSound();
                this.onchange(this.value);
            }
        }
    }

    private trackMouse(event: MouseEvent) {
        if (!this.rect) {
            this.rect = (<HTMLDivElement>this.htmlElement.lastElementChild!.children[1]).getBoundingClientRect();
        }
        this.value = Math.round((event.clientX - this.rect!.x)/this.rect!.width * 20) / 20;
    }

    public set text(text: string) {
        (<HTMLSpanElement>this.htmlElement.firstElementChild).innerText = text.trim();
    }

    public get text(): string {
        return (<HTMLSpanElement>this.htmlElement.firstElementChild).innerText;
    }

    public get value(): number {
        return this._value;
    }

    public set value(value: number) {
        value = Math.max(0, value);
        value = Math.min(1, value);
        this._value = value;

        for (let i = 0; i < this.htmlElement.lastElementChild!.children[1].children.length; i++) {
            this.htmlElement.lastElementChild!.children[1].children[i].classList.toggle('enabled', i < this.value * 20);
        }
    }

    protected onkeydown(event: KeyboardEvent) {
        if (Input.keyboard.right(event)) {
            this.value = Math.round((this._value + 0.1) * 10) / 10;
            if (this.onchange !== undefined) {
                playSound();
                this.onchange(this.value);
            }
        } else if (Input.keyboard.left(event)) {
            this.value = Math.round((this._value - 0.1) * 10) / 10;
            if (this.onchange !== undefined) {
                playSound();
                this.onchange(this.value);
            }
        } else {
            super.onkeydown(event);
        }
    }
}

class SelectionMenuElement extends NavigationMenuElement {
    public onchange?: (value: string) => any;
    private _value?: string;
    private _values: string[] = [];

    constructor(protected readonly htmlElement: HTMLElement, protected readonly menu: Menu, protected readonly name: string) {
        super(htmlElement, menu, name);
        this.htmlElement.insertAdjacentHTML(
            'beforeend',
            '<span></span><div><span>< </span><div></div><span> ></span></div>'
        );

        (<HTMLSpanElement>this.htmlElement.lastElementChild!.firstElementChild).onclick = () => {
            this.previousValue();
            if (this.onchange !== undefined) {
                playSound();
                this.onchange(this._value!);
            }
        }

        (<HTMLSpanElement>this.htmlElement.lastElementChild!.lastElementChild).onclick = () => {
            this.nextValue();
            if (this.onchange !== undefined) {
                playSound();
                this.onchange(this._value!);
            }
        }
    }

    public nextValue(): this {
        let index: number;
        if (this._value === undefined) {
            index = 0;
        } else {
            index = this._values.indexOf(this._value) + 1;
            if (index >= this._values.length) {
                index = 0;
            }
        }
        this.value = this._values[index];

        return this;
    }

    public previousValue(): this {
        let index: number;
        if (this._value === undefined) {
            index = 0;
        } else {
            index = this._values.indexOf(this._value) - 1;
            if (index === -1) {
                index = this._values.length - 1;
            }
        }
        this.value = this._values[index];

        return this;
    }

    private showValues() {
        this.htmlElement.lastElementChild!.children[1]!.innerHTML = '';

        this._values.forEach((value) => {
            this.htmlElement.lastElementChild!.children[1]!.insertAdjacentHTML(
                'beforeend',
                `<span id="${this.htmlElement.id}_${value.replace(' ', '_')}">${value}</span>`
            );
        });

        if (this._value !== undefined) {
            this.selectValue();
        }
    }

    private selectValue() {
        this.htmlElement.lastElementChild!.children[1]!.querySelector('.enabled')?.classList.remove('enabled');
        this.htmlElement.lastElementChild!.children[1]!.querySelector(`#${this.htmlElement.id}_${this._value!.replace(' ', '_')}`)?.classList.add('enabled');
    }

    public set text(text: string) {
        (<HTMLSpanElement>this.htmlElement.firstElementChild).innerText = text.trim();
    }

    public get text(): string {
        return (<HTMLSpanElement>this.htmlElement.firstElementChild).innerText;
    }

    public get values(): string[] {
        return this._values;
    }

    public addValue(value: string): this {
        this._values.push(value);
        this.htmlElement.lastElementChild!.children[1]!.insertAdjacentHTML(
            'beforeend',
            `<span id="${this.htmlElement.id}_${value.replace(' ', '_')}">${value}</span>`
        );
        return this;
    }

    public removeValue(value: string | number): this {
        let index: number;

        if (typeof value === 'number') {
            index = value;
            if (this._values.length >= index) {
                return this;
            }
            value = this._values[index];
        } else {
            index = this._values.indexOf(value);
            if (index === -1) {
                return this;
            }
        }

        if (this._value === value) {
            this.nextValue();
        }

        this._values.splice(index, 1);

        this.htmlElement.lastElementChild!.children[1]!.querySelector(`#${this.htmlElement.id}_${value.replace(' ', '_')}`)?.remove();

        return this;
    }

    public set values(values: string[]) {
        this._values = values;
        this._value = this._values[0];
        this.showValues();
    }

    public get value(): string | null {
        return this._value ?? null;
    }

    public set value(value: string) {
        if (this._values?.indexOf(value) === -1) {
            this.addValue(value);
        }
        this._value = value;
        this.selectValue();
    }

    protected onkeydown(event: KeyboardEvent) {
        if (Input.keyboard.right(event)) {
            this.nextValue();
            if (this.onchange !== undefined) {
                playSound();
                this.onchange(this._value!);
            }
        } else if (Input.keyboard.left(event)) {
            this.previousValue();
            if (this.onchange !== undefined) {
                playSound();
                this.onchange(this._value!);
            }
        } else {
            super.onkeydown(event);
        }
    }
}

class TouchScreenUiElement {
    public readonly allowedPositions: TouchScreenElementPosition[] = Object.values(TouchScreenElementPosition);
    protected name: string = 'element';
    constructor(protected readonly htmlElement: HTMLElement) {}

    public set position(position: Vector2d | TouchScreenElementPosition) {
        if (typeof position === 'string' && this.allowedPositions.indexOf(position) !== -1) {
            this.htmlElement.style.removeProperty('left');
            this.htmlElement.style.removeProperty('top');
            Object.values(TouchScreenElementPosition).forEach(elem => {
                this.htmlElement.classList.toggle(elem, elem === position);
            });
        } else {
            Object.values(TouchScreenElementPosition).forEach(elem => {
                this.htmlElement.classList.remove(elem);
            });
            this.htmlElement.style.left = `${(<Vector2d>position).x}px`
            this.htmlElement.style.top = `${(<Vector2d>position).y}px`
        }
    }

    public set scale(scale: number) {
        this.htmlElement.style.setProperty('--scale', scale.toString());
    }

    public get scale(): number {
        return parseInt(this.htmlElement.style.getPropertyValue('--scale') ?? 1);
    }

    public remove() {
        this.htmlElement.remove();
        Ui.touchScreen.removeElem(this.name);
    }
}

class TouchScreenPositionedUiElement extends TouchScreenUiElement{
    public readonly allowedPositions: TouchScreenElementPosition[] = Object.values(TouchScreenElementPosition);

    public set position(position: TouchScreenElementPosition) {
        if (this.allowedPositions.indexOf(position) !== -1) {
            Object.values(TouchScreenElementPosition).forEach(elem => {
                this.htmlElement.classList.toggle(elem, elem === position);
            });
        }
    }
}

class TouchScreenButton extends TouchScreenUiElement {
    private _event?: ((event: Event) => boolean) | null;

    constructor(protected readonly htmlElement: HTMLElement, protected name: string) {
        super(htmlElement);
    }

    public setPosition(position: Vector2d | TouchScreenElementPosition, global: boolean = true) {
        if (Object.values(TouchScreenElementPosition).includes(position as TouchScreenElementPosition)) {
            this.htmlElement.style.removeProperty('top');
            this.htmlElement.style.removeProperty('left');
            this.htmlElement.classList.add(<string>position);

        } else {
            if (!global) {
                let rect = Screen.boundingRect;
                (<Vector2d>position).x += Math.round(rect.x);
                (<Vector2d>position).y += Math.round(rect.y);
            }

            this.htmlElement.style.left = `${(<Vector2d>position).x}px`;
            this.htmlElement.style.top = `${(<Vector2d>position).y}px`;
        }

        return this;
    }

    public set event(event: InputEvent | null) {
        if (event === null) {
            this.htmlElement.onclick = null;
            window.removeEventListener('keyup', (e) => { this.onKeyDown(e); });
            window.removeEventListener('keydown', (e) => { this.onKeyDown(e); });

        } else {
            this.htmlElement.onclick = () => { Input.trigger(event); }
            window.addEventListener('keyup', (e) => { this.onKeyDown(e); });
            window.addEventListener('keydown', (e) => { this.onKeyDown(e); });
        }
        this._event = event;
    }

    protected onKeyDown(event: KeyboardEvent) {
        if (this._event && this._event(event)) {
            this.htmlElement.classList.toggle('active', event.type === 'keydown');
        }
    }
}

class TouchScreenDPad extends TouchScreenPositionedUiElement {
    public readonly allowedPositions: TouchScreenElementPosition[] = [
        TouchScreenElementPosition.BottomLeft,
        TouchScreenElementPosition.BottomRight,
        TouchScreenElementPosition.BottomCenter,
    ];
    protected name: string = 'd-pad';
    private bindArrows: boolean = false;
    private bindWASD: boolean = false;

    constructor(protected readonly htmlElement: HTMLElement) {
        super(htmlElement);

        this.htmlElement.ontouchstart = this.htmlElement.onpointerdown = (e: Event) => {
            if (e.target !== this.htmlElement) {
                let pressed: number;
                ['Up', 'Left', 'Right', 'Down'].forEach((direction: string, index) => {
                    if (
                        [
                            (<HTMLButtonElement>this.htmlElement.children[index]),
                            (<HTMLElement>this.htmlElement.children[index].firstElementChild)
                        ].indexOf(e.target as HTMLElement) !== -1
                    ) {
                        if (this.bindArrows) {
                            window.dispatchEvent(new KeyboardEvent('keydown', {'code':`Arrow${direction}`}));
                        } else if (this.bindWASD) {
                            window.dispatchEvent(new KeyboardEvent('keyup', {'code': `Key${['W', 'A', 'D', 'S'][index!]}`}));
                        } else {
                            this.onKeyDown(`Arrow${direction}`, 'keydown', true);
                        }
                        pressed = index;
                    }
                });
                this.htmlElement.ontouchend = this.htmlElement.onpointerup = () => {
                    if (this.bindArrows) {
                        window.dispatchEvent(new KeyboardEvent('keyup', {'code': `Arrow${['Up', 'Left', 'Right', 'Down'][pressed!]}`}));
                    } else if (this.bindWASD) {
                        window.dispatchEvent(new KeyboardEvent('keyup', {'code': `Key${['W', 'A', 'D', 'S'][pressed!]}`}));
                    } else {
                        this.onKeyDown(`Arrow${['Up', 'Left', 'Right', 'Down'][pressed!]}`, 'keyup', true);
                    }
                    this.htmlElement.ontouchend = this.htmlElement.onpointerup = null;
                }
            }
        }
        this.position = TouchScreenElementPosition.BottomCenter;
    }

    private onKeyDown(key: string, type: string, force: boolean = false) {
        let indexes: any = {};
        if (this.bindArrows || force) {
            indexes.ArrowUp = 0;
            indexes.ArrowLeft = 1;
            indexes.ArrowRight = 2;
            indexes.ArrowDown = 3;
        }
        if (this.bindWASD) {
            indexes.KeyW = 0;
            indexes.KeyA = 1;
            indexes.KeyD = 2;
            indexes.KeyS = 3;
        }
        if (key in indexes) {
            (<HTMLButtonElement>this.htmlElement.children[indexes[key]]).classList.toggle('active', type === 'keydown');
        }
    }

    public link(useArrows: boolean = false): this {
        if (!(this.bindArrows || this.bindWASD)) {
            window.addEventListener('keyup', (e) => { this.onKeyDown(e.code, e.type) });
            window.addEventListener('keydown', (e) => { this.onKeyDown(e.code, e.type) });
        }

        if (useArrows) {
            this.bindArrows = true;
        } else {
            this.bindWASD = true;
        }

        return this;
    }

    public unlink(useArrows: boolean = false): this {
        if (useArrows) {
            this.bindArrows = false;
        } else {
            this.bindWASD = false;
        }

        if (!(this.bindArrows && this.bindWASD)) {
            window.removeEventListener('keyup', (e) => { this.onKeyDown(e.code, e.type) });
            window.removeEventListener('keydown', (e) => { this.onKeyDown(e.code, e.type) });
        }

        return this;
    }

}