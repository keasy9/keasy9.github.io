export class Ui {
    public info: Info;
    private readonly ui: HTMLElement;
    private menus: Map<string, Menu> = new Map();

    constructor() {
        this.ui = document.querySelector('.ui-full')!;
        this.info = new Info(document.querySelector('.ui-top .info')!);
    }

    public menu(name: string): Menu {
        if (!this.menus.has(name)) this.menus.set(name, new Menu(this.ui));
        return this.menus.get(name)!;
    }

    public removeMenu(name: string): this {
        if (this.menus.has(name)) {
            this.menus.get(name)!.remove();
            this.menus.delete(name);
        }
        return this;
    }
}

class Menu {
    private buttons: Map<string, Function> = new Map();
    private readonly element: HTMLElement;

    constructor(private readonly ui: HTMLElement) {
        this.element = document.createElement('div');
        this.element.classList.add('hidden');
        ui.appendChild(this.element);
    }

    addButton(name: string, onclick: (this: GlobalEventHandlers, ev: MouseEvent) => any): this {
        this.buttons.set(name, onclick);

        const btn = document.createElement('button');
        btn.id = btn.innerText = name;
        btn.onclick = onclick;
        this.element.appendChild(btn);

        return this;
    }

    removeButton(name: string): this {
        if (this.buttons.has(name)) {
            this.buttons.delete(name);
            this.element.querySelector(`button#${name}}`)!.remove();
        }

        return this;
    }

    hide(): this {
        this.element.classList.add('hidden');
        this.ui.classList.add('hidden');
        return this;
    }

    show(): this {
        this.element.classList.remove('hidden');
        this.ui.classList.remove('hidden');
        return this;
    }

    remove() {
        this.element.remove();
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