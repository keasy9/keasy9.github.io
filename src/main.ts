import './assets/css/style.css';
import {Snake} from "./Snake.ts";
import {MainMenu} from "./MainMenu.ts";
import {Game} from "./core/Game.ts";
import {Tetris} from "./Tetris.ts";

const gamesContainer: HTMLElement | null = document.querySelector('.ui-top .games-container');

let currGame: typeof Game;

function startGame() {
    if (currGame) currGame.end();
    if (gamesContainer) gamesContainer.classList.add('hidden');
    switch (window.location.hash) {
        case '#snake':
            currGame = Snake.begin();
            break;
        case '#tetris':
            currGame = Tetris.begin();
            break;
        default:
            if (gamesContainer) gamesContainer.classList.remove('hidden');
            currGame = MainMenu.begin();
            break;
    }
}

window.addEventListener('hashchange', startGame);

window.addEventListener('resize', () => {
    if (currGame) {
        currGame.resize();
    }
});

screen.orientation.addEventListener('change', () => {
    currGame.resize();
});

window.addEventListener('load' ,() => {
    startGame();
});
