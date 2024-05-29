
export class Ui {
    public info: Info;
    public readonly ui: HTMLElement;

    constructor() {
        this.ui = document.querySelector('.ui-full')!;
        this.info = new Info(document.querySelector('.ui-top .info')!);
    }

    public menu(name: string): Menu {
        return Menu.getInstance(name, this);
    }

    public enableUiButtons(buttonsForce: boolean = false): this {
        if (window.TouchEvent || buttonsForce) {
            const btns: HTMLElement | null = document.querySelector('.ui-buttons');
            if (btns !== null) {
                btns.classList.remove('hidden');

                const buttons: NodeListOf<HTMLButtonElement> = btns.querySelectorAll('.buttons-container > div');
                buttons.forEach(btn => {
                    let code: string = 'ArrowUp';
                    if (btn.classList.contains('button-down')) {
                        code = 'ArrowDown';
                    } else if (btn.classList.contains('button-left')) {
                        code = 'ArrowLeft';
                    } else if (btn.classList.contains('button-right')) {
                        code = 'ArrowRight';
                    }

                    btn.onmousedown = () => window.dispatchEvent(new KeyboardEvent('keydown',  {'code': code}))
                    btn.onmouseup = () => window.dispatchEvent(new KeyboardEvent('keyup',  {'code': code}))
                });
            }
        }

        const pauseBtn: HTMLElement | null = document.querySelector('.pause-button');
        if (pauseBtn !== null) {
            pauseBtn.classList.remove('hidden');
            pauseBtn.onclick = () => window.dispatchEvent(new KeyboardEvent('keydown',  {'code': 'Escape'}));
        }

        return this;
    }

    public disableUiButtons(): this {
        const btns: HTMLElement | null = document.querySelector('.ui-buttons');
        if (btns !== null) {
            btns.classList.add('hidden');
        }

        const pauseBtn: HTMLElement | null = document.querySelector('.pause-button');
        if (pauseBtn !== null) {
            pauseBtn.classList.add('hidden');
        }

        return this;
    }

    public clear() {
        Menu.removeAll();
        this.disableUiButtons().info.clear();
    }
}

class Menu {
    private static instances: Map<string, Menu> = new Map();
    private elems: Array<string> = [];
    private readonly element: HTMLElement;

    constructor(private name: string, ui: Ui) {
        this.element = document.createElement('div');
        this.element.classList.add('menu');
        this.element.classList.add('hidden');
        ui.ui.appendChild(this.element);
    }

    public static getInstance(instanceName: string, ui: Ui): Menu {
        if (!this.instances.has(instanceName)) {
            this.instances.set(instanceName, new Menu(instanceName, ui))
        }
        return this.instances.get(instanceName)!;
    }

    public addButton(name: string, onclick: (this: GlobalEventHandlers, ev: MouseEvent) => any): this {
        if (this.addElem(`${name}_btn`)) {
            const btn = document.createElement('button');
            btn.id = btn.innerText = name;
            btn.onclick = onclick;
            this.element.appendChild(btn);
        }

        return this;
    }

    public removeButton(name: string): this {
        if (this.removeElem(`${name}_btn`)) {
            this.element.querySelector(`button#${name}}`)!.remove();
        }

        return this;
    }

    public addSwitch(name: string, onchange: (enabled: boolean) => any, defaultValue: boolean = false): this {
        if (this.addElem(`${name}_swh`)) {
            const checked: string = defaultValue ? 'checked=checked' : '';
            const swh = document.createElement('label');
            swh.insertAdjacentHTML(
                'beforeend',
                `<input type="checkbox" ${checked}> ${name}`
                );
            swh.id = name;
            swh.onchange = () => onchange((<HTMLInputElement>swh.firstElementChild!).checked);
            this.element.appendChild(swh);
        }

        return this;
    }

    public removeSwitch(name: string): this {
        if (this.removeElem(`${name}_swh`)) {
            this.element.querySelector(`label#${name}}`)!.remove();
        }

        return this;
    }

    public hide(): this {
        this.element.classList.add('hidden');
        return this;
    }

    public show(): this {
        Menu.instances.forEach(menu => menu.hide());
        this.element.classList.remove('hidden');
        return this;
    }

    public remove() {
        this.element.remove();
        Menu.instances.delete(this.name);
    }

    public static removeAll() {
        Menu.instances.forEach(menu => menu.remove());
    }

    private addElem(name: string): boolean {
        if (this.elems.indexOf(name) === -1) {
            this.elems.push(name);
            return true;
        } else {
            return false;
        }
    }

    private removeElem(name: string): boolean {
        const indexOf = this.elems.indexOf(name);
        if (indexOf === -1) {
            return false;
        } else {
            this.elems.splice(indexOf, 1);
            return true;
        }
    }

}

class Info {
    constructor(private readonly element: HTMLElement) {}

    set(html: string | HTMLElement): this {
        this.clear();

        if (html instanceof HTMLElement) {
            this.element.appendChild(html);
        } else {
            this.element.insertAdjacentHTML('beforeend', html);
        }

        return this;
    }

    clear(): this {
        this.element.innerHTML = '';
        return this;
    }

    hide(): this {
        this.element.classList.add('hidden');
        return this;
    }

    show(): this {
        this.element.classList.remove('hidden');
        return this;
    }
}