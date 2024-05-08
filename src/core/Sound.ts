export class Sound {
    public silent: boolean = false;
    private sounds: Map<string, HTMLAudioElement> = new Map();
    private volume: number = 0.5;

    public play(file: string): this {
        this.stop(file);
        this.sounds.set(file, new Audio(file));
        this.sounds.get(file)!.volume = this.volume;
        if (!this.silent) this.sounds.get(file)!.play();
        return this;
    }

    public pause(file: string): this {
        if (this.sounds.has(file)) this.sounds.get(file)!.pause();
        return this;
    }

    public stop(file: string): this {
        if (this.sounds.has(file)) {
            this.sounds.get(file)!.pause();
            this.sounds.get(file)!.currentTime = 0;
        }
        return this;
    }

    public setVolume(volume: number) {
        this.volume = volume;
        this.sounds.forEach(sound => sound.volume = volume);
    }

    public getVolume(): number {
        return this.volume;
    }
}
