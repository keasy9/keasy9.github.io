import './assets/css/style.css'
import {HeartBeatAnimation} from "./HeartBeatAnimation.ts";
import {Snake} from "./Snake.ts";

const canvas: HTMLCanvasElement| null = document.querySelector('canvas');
const gamesContainer: HTMLElement | null = document.querySelector('.ui-top .games-container');

let currGame: Snake | HeartBeatAnimation;

function startGame() {
    if (canvas === null) throw 'canvas not exists';
    if (currGame) currGame.end();
    if (gamesContainer) gamesContainer.classList.add('hidden');
    switch (window.location.hash) {
        case '#snake':
            currGame = new Snake(canvas).begin();
            break;
        default:
            if (gamesContainer) gamesContainer.classList.remove('hidden');
            currGame = new HeartBeatAnimation(canvas).begin();
            break;
    }
}

window.addEventListener('hashchange', startGame);
startGame();
