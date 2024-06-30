import {Game} from "./core/Game.ts";
import {Screen} from "./core/Screen.ts";
import {Ui} from "./core/Ui.ts";
import {Vector2d} from "./core/utils.ts";
import {Input} from "./core/Input.ts";

export class MainMenu extends Game {
    private static centerX: number = 0;
    private static centerY: number = 0;
    private static frames: (string | null)[][][] = [];
    private static frame: number = 0;
    private static intervalId?: number;

    public static resize() {
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
        }

        this.resizeTimer = setTimeout(() => { this._resize() }, 100);
        return this;
    }

    public static _resize() {
        Screen.autoFit(3000, 30000);
        if (Screen.width < 30) {
            Screen.size = new Vector2d(30, 30);
        }
        Screen.autoScale();

        this.centerX = Math.round(Screen.width/2);
        this.centerY = Math.round(Screen.height/2);
        this.drawFrame();

        Ui.on(new Vector2d(Screen.width - 8, 1)).button('pause', 'pauseButton.png');

        const gray1 = '#1E90FF';

        Screen.matrix(
            new Vector2d(this.centerX - 11, this.centerY + 10),
            [
                [gray1, gray1, null , null , gray1, null , null , null, gray1, null , gray1, null, gray1, gray1, gray1, null, gray1, gray1, gray1, null , gray1, null , gray1],
                [gray1, null , gray1, null , gray1, null , null , null, gray1, null , gray1, null, gray1, null , null , null, gray1, null , null , null , gray1, null , gray1],
                [gray1, gray1, null , null , gray1, null , null , null, gray1, null , gray1, null, gray1, gray1, gray1, null, gray1, gray1, gray1, null , gray1, null , gray1],
                [gray1, null , gray1, null , gray1, null , null , null, gray1, null , gray1, null, null , null , gray1, null, null , null , gray1, null , null , gray1, null ],
                [gray1, gray1, null , null , gray1, gray1, gray1, null, gray1, gray1, gray1, null, gray1, gray1, gray1, null, gray1, gray1, gray1, null , null , gray1, null ],
            ]
        ).paint();

        return this;
    }

    public static begin() {
        super.begin();

        const black = '#0B1B5E';
        const gray1 = '#1E90FF';
        const gray2 = '#74B9FF';
        const gray3 = '#122B99';

        this.frames = [
            [
                [null,  null,  null,  black, null,  null,  null,  null,  null,  null,  null,  null,  null,  black, null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null ],
                [null,  null,  black, gray3, black, null,  null,  null,  null,  null,  null,  null,  black, gray3, black, null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null ],
                [null,  null,  black, gray2, black, null,  null,  null,  null,  null,  null,  null,  black, gray2, black, null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null ],
                [null,  black, gray1, gray2, gray3, black, black, black, black, black, black, black, gray1, gray2, gray3, black, null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null ],
                [null,  black, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray3, black, black, black, black, black, black, black, null,  null,  null,  null,  null ],
                [null,  black, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray3, black, black, null,  null,  null ],
                [null,  black, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray3, gray3, black, null,  null ],
                [null,  black, gray1, black, gray1, gray1, black, gray1, gray1, gray1, black, gray1, gray1, black, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray3, black, null,  null ],
                [null,  black, gray1, gray1, black, black, gray1, gray1, gray1, gray1, gray1, black, black, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray3, black, null,  null ],
                [black, black, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, black, black, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray3, black, null ],
                [null,  black, gray1, gray1, gray1, gray1, gray1, gray1, black, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray3, black],
                [black, black, gray1, gray1, gray1, gray1, gray1, black, gray1, black, gray1, gray1, gray1, gray1, black, black, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray3, black],
                [null,  black, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, black, black, black, black, gray1, gray3, black],
                [null,  black, black, gray1, gray1, gray1, gray1, gray2, gray2, gray2, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, black, gray1, gray1, gray1, gray1, gray1, gray3, black],
                [null,  null,  black, gray1, gray1, gray1, gray2, gray2, gray2, gray2, gray2, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, black, gray1, gray1, gray1, gray1, gray1, gray1, gray3, black],
                [null,  null,  null,  black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, null ],
            ],
            [
                [null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null ],
                [null,  null,  null,  black, null,  null,  null,  null,  null,  null,  null,  null,  null,  black, null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null ],
                [null,  null,  black, gray3, black, null,  null,  null,  null,  null,  null,  null,  black, gray3, black, null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null ],
                [null,  null,  black, gray2, black, null,  null,  null,  null,  null,  null,  null,  black, gray2, black, null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null ],
                [null,  black, gray1, gray2, gray3, black, black, black, black, black, black, black, gray1, gray2, gray3, black, null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null,  null ],
                [null,  black, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray3, black, black, black, black, black, black, black, null,  null,  null,  null,  null ],
                [null,  black, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray3, black, black, null,  null,  null ],
                [null,  black, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray3, gray3, black, null,  null ],
                [null,  black, gray1, black, gray1, gray1, black, gray1, gray1, gray1, black, gray1, gray1, black, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray3, black, null,  null ],
                [null,  black, gray1, gray1, black, black, gray1, gray1, gray1, gray1, gray1, black, black, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray3, black, null ],
                [black, black, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, black, black, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray3, black, null ],
                [null,  black, gray1, gray1, gray1, gray1, gray1, gray1, black, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray3, black],
                [black, black, gray1, gray1, gray1, gray1, gray1, black, gray1, black, gray1, gray1, gray1, gray1, black, black, gray1, gray1, gray1, gray1, gray1, black, black, black, black, gray1, gray3, black],
                [null,  black, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, black, gray1, gray1, gray1, gray1, gray1, gray3, black],
                [null,  black, black, gray1, gray1, gray1, gray1, gray2, gray2, gray2, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, gray1, black, gray1, gray1, gray1, gray1, gray1, gray1, gray3, black],
                [null,  null,  null,  black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, black, null ],
            ]
        ];

        this.resize();

        Ui.on(new Vector2d(Screen.width - 8, 1)).button('pause', 'pauseButton.png').event = Input.keyboard.key('escape');
        Ui.button('pause').scale = 2;

        Ui.menu('games').button('snake').text = 'snake';
        Ui.menu('games').button('snake').onclick = () => {
            document.location.hash = 'snake';
        }
        Ui.menu('games').line('sep');
        Ui.menu('games').button('back').text = 'back';
        Ui.menu('games').button('back').onclick = () => {
            Ui.menu('games').toggle();
        };

        Input.listen(Input.keyboard.key('escape'), () => {
            Ui.menu('games').toggle();
        });

        this.continue = true;
        this.go();

        return MainMenu;
    }

    public static end() {
        Input.deaf();
        Ui.clear();
        this.continue = false;
        clearInterval(this.intervalId);
        return MainMenu;
    }

    private static go() {
        this.intervalId = setInterval(() => {
            if (this.continue) {
                this.frame++;
                if (this.frame >= this.frames.length) {
                    this.frame = 0;
                }
                this.drawFrame();
            }
        }, 1000 / MainMenu.speed);
    }

    private static drawFrame() {
        Screen.matrix(
            new Vector2d(this.centerX - 14, this.centerY - 8),
            this.frames[this.frame],
        ).paint();
    }
}
