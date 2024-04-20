import './style.css'
import {HeartBeatAnimation} from "./HeartBeatAnimation.ts";

const canvas: HTMLCanvasElement| null = document.querySelector('canvas');
if (canvas === null) throw 'canvas not exists';
new HeartBeatAnimation(canvas).begin();
