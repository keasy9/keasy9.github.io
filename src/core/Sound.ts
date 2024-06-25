import {v4 as uuidv4} from 'uuid';

export class Sound {
    public static silent: boolean = false;
    private static sounds: Map<string, SoundQueue> = new Map();
    private static _volume: number = 0.5;

    public static play(file: string, volume?: number): SoundQueue {
        const sound = this.get(file);
        sound.volume = volume ?? this._volume;
        return sound.play();
    }

    public static playOnce(file: string, volume?: number): SoundQueue {
        const sound = this.get(file, 'mp3', true);
        sound.volume = volume ?? this._volume;
        return sound.play();
    }

    public static get(file: string, filetype: string = 'mp3', unique: boolean = false): SoundQueue {
        if (!this.sounds.has(file)) {
            const queue = new SoundQueue(file, filetype);
            if (!unique) {
                file = queue.id;
            }
            this.sounds.set(file, queue);
        }
        return this.sounds.get(file)!;
    }

    public static pause(file: string): SoundQueue {
        return this.get(file).pause();
    }

    public static stop(file: string): Sound {
        if (this.sounds.has(file)) {
            this.sounds.get(file)!.pause();
            this.sounds.delete(file);
        }
        return this;
    }

    public static set volume(volume: number) {
        this._volume = volume;
        this.sounds.forEach(sound => sound.volume = volume);
    }

    public static get volume(): number {
        return this._volume;
    }
}

class SoundQueue {
    private queue: ((audio: HTMLAudioElement) => any)[] = [];
    private audio?: HTMLAudioElement;
    private loaded: boolean = false;
    public readonly id: string;

    constructor(private file: string, filetype: string = 'mp3') {
        this.id = uuidv4();
        import(`../assets/sounds/${file}.${filetype}`).then(file => {
            this.audio = new Audio(file.default);
            this.loaded = true;
            this.continueQueue();
        });
    }

    private continueQueue() {
        if (this.loaded && this.queue.length > 0) {
            this.queue.shift()!(this.audio!);
        }
    }

    private addToQueue(fn: (audio: HTMLAudioElement) => any) {
        this.queue.push((audio) => {
            fn(audio);
            this.continueQueue();
        });
        if (this.loaded) {
            this.continueQueue();
        }
    }

    public play(): this {
        this.addToQueue((audio) => {
            audio.pause();
            audio.currentTime = 0;
            audio!.play();
        });
        return this;
    }

    public pause(): this {
        this.addToQueue((audio) => {
            audio!.pause();
        });
        return this;
    }

    public set time(time: number) {
        this.addToQueue((audio) => {
            audio!.currentTime = time;
        });
    }

    public set volume(volume: number) {
        this.addToQueue((audio) => {
            audio.volume = volume;
        });
    }

    public stop() {
        this.pause();
        delete this.audio;
        return Sound.stop(this.file);
    }
}