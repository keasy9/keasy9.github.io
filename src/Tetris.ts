import {Game} from "./core/Game.ts";
import {Input} from "./core/Input.ts";
import {Ui} from "./core/Ui.ts";
import {Screen} from "./core/Screen.ts";
import {Vector2d} from "./core/Vector2d.ts";
import {Physics, ScreenEdges} from "./core/Physics.ts";

type Figure = {
    map: Vector2d[],
    name: string,
    height: number,
    rotatable: boolean,
    center?: Vector2d,
};

export class Tetris extends Game {
    private static score: number = 0;
    private static throwTimer?: number;
    private static currentFigure?: Figure;
    private static colors: {[index: string]: string} = {
        I: '#1be1ca',
        J: '#dc0085',
        L: '#96001e',
        O: '#e7bb00',
        S: '#26da07',
        T: '#ff4400',
        Z: '#003edc',
    }
    private static figuresRemaining: number[] = [];
    protected static speed = 0;
    private static figures: Figure[] = [
        {
            map: [
                new Vector2d(0, 0),
                new Vector2d(0, 1),
                new Vector2d(0, 2),
                new Vector2d(0, 3),
            ],
            name: 'I',
            height: 4,
            rotatable: true,
            center: new Vector2d(0, 2),
        },
        {
            map: [
                new Vector2d(1, 0),
                new Vector2d(1, 1),
                new Vector2d(1, 2),
                new Vector2d(0, 2),
            ],
            name: 'J',
            height: 3,
            rotatable: true,
            center: new Vector2d(1, 1),
        },
        {
            map: [
                new Vector2d(0, 0),
                new Vector2d(0, 1),
                new Vector2d(0, 2),
                new Vector2d(1, 2),
            ],
            name: 'L',
            height: 3,
            rotatable: true,
            center: new Vector2d(0, 1),
        },
        {
            map: [
                new Vector2d(0, 0),
                new Vector2d(0, 1),
                new Vector2d(1, 0),
                new Vector2d(1, 1),
            ],
            name: 'O',
            height: 2,
            rotatable: false,
        },
        {
            map: [
                new Vector2d(0, 0),
                new Vector2d(1, 0),
                new Vector2d(1, 1),
                new Vector2d(2, 1),
            ],
            name: 'S',
            height: 2,
            rotatable: true,
            center: new Vector2d(1, 0),
        },
        {
            map: [
                new Vector2d(0, 0),
                new Vector2d(1, 0),
                new Vector2d(2, 0),
                new Vector2d(1, 1),
            ],
            name: 'T',
            height: 2,
            rotatable: true,
            center: new Vector2d(1, 0),
        },
        {
            map: [
                new Vector2d(1, 0),
                new Vector2d(2, 0),
                new Vector2d(0, 1),
                new Vector2d(1, 1),
            ],
            name: 'Z',
            height: 2,
            rotatable: true,
            center: new Vector2d(2, 0),
        },
    ];

    protected static _resize() {
        Screen.size = new Vector2d(15, 20);
        Screen.autoFit(100, 500).fill();
        Ui.on(new Vector2d(innerWidth - 100, 20), false).button('pause', 'pauseButton.png').event = Input.keyboard.key('escape');
        Ui.button('pause', 'pauseButton.png').scale = 2;
        Ui.on(new Vector2d(0, 0)).label('score').content = `score: ${this.score}`;

        Physics.collider('throwed').screenMap.forEach(v => Screen.pixel(v).paint('gray'));
    }

    public static begin() {
        super.begin();

        Ui.menu('main').button('continue').text = 'continue';
        Ui.menu('main').button('continue').onclick = () => {
            this.togglePause();
        };
        Ui.menu('main').button('restart').text = 'restart';
        Ui.menu('main').button('restart').onclick = () => this.end() && this.begin();
        Ui.menu('main').button('exit').text = 'exit';
        Ui.menu('main').button('exit').onclick = () => document.location.hash = 'home';

        Physics.collider('throwed');
        this.throwFigure();

        Input.listen(Input.keyboard.key('escape'), () => {
            this.togglePause();
        });

        // @ts-ignore
        Input.listen(Input.keyboard.left, () => {
            if (this.continue) {
                this.moveFigure(new Vector2d(-1, 0));
            }
        });

        // @ts-ignore
        Input.listen(Input.keyboard.right, () => {
            if (this.continue) {
                this.moveFigure(new Vector2d(1, 0));
            }
        });

        // @ts-ignore
        Input.listen(Input.keyboard.down, () => {
            if (this.continue && this.currentFigure) {
                if (!this.moveFigure(new Vector2d(0, 1))) {
                    this.freezeFigure();
                    this.throwFigure();
                } else {
                    this.addScore(1);
                    Ui.label('score').content = `score: ${this.score}`;
                }
            }
        });

        // @ts-ignore
        Input.listen(Input.keyboard.up, () => {
            if (this.continue) {
                this.rotateFigure();
            }
        });

        Input.listen(Input.touchScreen.swipeLeft, () => {
            if (this.continue) {
                this.moveFigure(new Vector2d(-1, 0));
            }
        }, {continueOnHold: true, continueInterval: 200});

        Input.listen(Input.touchScreen.swipeRight, () => {
            if (this.continue) {
                this.moveFigure(new Vector2d(1, 0));
            }
        }, {continueOnHold: true, continueInterval: 200});

        Input.listen(Input.touchScreen.touch, () => {
            if (this.currentFigure && this.continue) {
                this.rotateFigure();
            }
        });

        this.throwTimer = setTimeout(Tetris.moveFigureDown, 500 / (1 + Tetris.speed));

        return this;
    }

    public static end(gameover: boolean = false) {
        super.end();
        Input.deaf();
        Physics.clear();

        if (gameover) {
            Ui.menu('gameover').label('score').text = `score: ${this.score}`;
            Ui.menu('gameover').line('score');
            Ui.menu('gameover').button('restart').text = 'restart';
            Ui.menu('gameover').button('restart').onclick = () => this.end() && this.begin();
            Ui.menu('gameover').button('exit').text = 'exit';
            Ui.menu('gameover').button('exit').onclick = () => document.location.hash = 'home';
            Ui.menu('gameover').open();
        } else {
            Ui.clear();
        }

        return this;
    }

    private static moveFigure(vector: Vector2d): boolean {
        this.eraseFigure();

        Physics.collider('currentFigure').position = Physics.collider('currentFigure').position.add(vector);
        if (
            Physics.collider('currentFigure').collidesToEdge(ScreenEdges.Bottom)
            || Physics.collider('currentFigure').collidesToEdge(ScreenEdges.Left)
            || Physics.collider('currentFigure').collidesToEdge(ScreenEdges.Right)
            || Physics.collider('currentFigure').collides(Physics.collider('throwed'))
        ) {
            Physics.collider('currentFigure').position = Physics.collider('currentFigure').position.substract(vector);
            this.drawFigure();
            return false;
        }

        this.drawFigure();
        return true;
    }

    private static throwFigure() {
        this.currentFigure = this.getRandomFigure();
        Physics.collider('currentFigure').map = this.currentFigure.map;
        Physics.collider('currentFigure').position = new Vector2d(Screen.width / 2, -this.currentFigure.height);
        if (this.currentFigure.center) {
            Physics.collider('currentFigure').center = this.currentFigure.center;
        }

        if (Physics.collider('currentFigure').collides(Physics.collider('throwed'))) {
            this.end(true);
        }
    }

    private static freezeFigure() {
        Physics.collider('throwed').add(Physics.collider('currentFigure'));
        Physics.collider('currentFigure').screenMap.forEach(v => {
            this.checkRow(v.y);
        });
        Physics.collider('currentFigure').remove();
        clearTimeout(this.throwTimer);
    }

    private static checkRow(y: number) {
        for (let x = 0; x <= Screen.width; x++) {
            if (!Physics.collider('throwed').contains(new Vector2d(x, y))) {
                return;
            }
        }

        for (let x = 0; x <= Screen.width; x++) {
            Screen.pixel(new Vector2d(x, y)).clear();
        }

        const map = Physics.collider('throwed').screenMap;
        map.sort((a, b) => {
            return b.y - a.y;
        });

        const newMap: Vector2d[] = [];
        map.forEach(v => {
            if (v.y > y) {
                newMap.push(v);
                Screen.pixel(v).paint('gray');
            } else if (v.y < y) {
                const newV = v.add(new Vector2d(0 ,1));
                newMap.push(newV);
                Screen.pixel(v).move(newV).paint('gray');
            }
        });

        Physics.collider('throwed').screenMap = newMap;

        this.addScore(Screen.width * 2);
        Ui.label('score').content = `score: ${this.score}`;
    }

    private static drawFigure() {
        Physics.collider('currentFigure').screenMap.forEach(v => Screen.pixel(v).paint(this.colors[this.currentFigure!.name]));
    }

    private static eraseFigure() {
        Physics.collider('currentFigure').screenMap.forEach(v => Screen.pixel(v).clear());
    }

    private static rotateFigure() {
        if (this.currentFigure && this.currentFigure.rotatable) {
            this.eraseFigure();
            Physics.collider('currentFigure').angle += 90;
            if (
                Physics.collider('currentFigure').collidesToEdge(ScreenEdges.Bottom)
                || Physics.collider('currentFigure').collides(Physics.collider('throwed'))
            ) {
                Physics.collider('currentFigure').angle -= 90;
            }

            while(Physics.collider('currentFigure').collidesToEdge(ScreenEdges.Left)) {
                Physics.collider('currentFigure').position = Physics.collider('currentFigure').position.add(new Vector2d(1, 0));

            }

            while(Physics.collider('currentFigure').collidesToEdge(ScreenEdges.Right)) {
                Physics.collider('currentFigure').position = Physics.collider('currentFigure').position.add(new Vector2d(-1, 0));
            }

            if (Physics.collider('currentFigure').angle >= 360) {
                Physics.collider('currentFigure').angle -= 360;
            }
            this.drawFigure();
        }
    }
    
    private static getRandomFigure(): Figure {
        // TODO такой рандом должен поддерживаться на уровне ядра
        if (!this.figuresRemaining.length) {
            this.figuresRemaining = Array.from({length: this.figures.length}, (_, i) => i);
        }

        const randomIndex = Math.floor(Math.random() * this.figuresRemaining.length);
        const figureIndex = this.figuresRemaining[randomIndex];
        this.figuresRemaining.splice(randomIndex, 1);

        return this.figures[figureIndex];
    }

    private static moveFigureDown() {
        if (Tetris.continue) {
            if (!Tetris.moveFigure(new Vector2d(0, 1))) {
                Tetris.freezeFigure();
                Tetris.throwFigure();
            }
            this.throwTimer = setTimeout(Tetris.moveFigureDown, 500 / (1 + Tetris.speed));
        }
    }

    private static addScore(score: number) {
        this.score += score;
        this.speed = Math.round(score / 1000);
    }

    public static togglePause() {
        super.togglePause();
        Ui.menu('main').toggle();
        if (this.continue) {
            if (this.currentFigure) {
                this.moveFigureDown();
            } else {
                this.throwFigure();
            }
        }
        return this;
    }
}
