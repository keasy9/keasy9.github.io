import './style.css'
import {Grid} from "./Grid.ts";

const canvas: HTMLCanvasElement| null = document.querySelector('canvas');
if (canvas === null) throw 'canvas not exists';
const grid: Grid = new Grid(canvas).resize(20);

const size: {x: number, y: number} = grid.getSize();
const x: number = Math.round(size.x/2);
const y: number = Math.round(size.y/2);

grid.cell(x, y).paint('red');

for (let i = 0; i <= 5; i++) {
    grid.cell(x, y - i).paint('red');
    for (let j = 0; j <= i; j++) {
        grid.cell(x - j, y - i).paint('red');
        grid.cell(x + j, y - i).paint('red');
    }
}

grid.cell(x - 5, y - 5).clear();
grid.cell(x + 5, y - 5).clear();

for (let i = 1; i <= 3; i++) {
    grid.cell(x - i, y - 6).paint('red');
    grid.cell(x + i, y - 6).paint('red');
}

function beat(side: boolean = true) {
    for (let i: number = 2; i <= 4; i++) {
        grid.cell(side ? (x + i) : (x - i), y - 7).paint('red');
    }

    for (let i: number = 4; i <= 5; i++) {
        grid.cell(side ? (x + i) : (x - i), y - 6).paint('red');
    }

    grid.cell(side ? (x + 5) : (x - 5), y - 5).paint('red');

    for (let i = 0; i <= 4; i++) {
        grid.cell(side ? (x + i + 1) : (x - i - 1), y - i).paint('red');
    }

    setTimeout(unBeat, 400, side);
}

function unBeat(side: boolean = true) {
    for (let i: number = 2; i <= 4; i++) {
        grid.cell(side ? (x + i) : (x - i), y - 7).clear();
    }

    for (let i: number = 4; i <= 5; i++) {
        grid.cell(side ? (x + i) : (x - i), y - 6).clear();
    }

    grid.cell(side ? (x + 5) : (x - 5), y - 5).clear();

    for (let i = 0; i <= 4; i++) {
        grid.cell(side ? (x + i + 1) : (x - i - 1), y - i).clear();
    }
}

function animate() {
    beat();
    setTimeout(() => {
        beat(false)
    }, 700);

    setTimeout(animate, 2000);
}

animate();