import './style.css'
import {Snake} from "./Snake.ts";

const canvas: HTMLCanvasElement| null = document.querySelector('canvas');
if (canvas === null) throw 'canvas not exists';
new Snake(canvas).begin();
