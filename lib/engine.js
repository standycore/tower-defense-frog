
import { EventEmitter } from './events.js';

class FixedEngine {

    constructor() {

        this.timeout = undefined;
        this.events = new EventEmitter();

        // the fixed interval between frames, in ms. 1000 / 60 = 60 frames per second
        this.interval = 1000 / 60;

        // the number of ticks / frames since the engine started as an int
        this.ticks = 0;

        // the time since the engine started, in ms
        this.time = 0;

        this.isRunning = false;

        this.updateCaller = () => {

            this.events.trigger('update', this.interval, this.time, this.ticks);
            this.ticks += 1;
            this.time += this.interval;

            if (this.isRunning) {

                this.timeout = setTimeout(() => {

                    this.updateCaller();

                }, this.interval);

            }

        };

    }

    start() {

        if (!this.isRunning) {

            this.isRunning = true;

            this.updateCaller();

        }
        return this;

    }

    stop() {

        this.isRunning = false;
        clearTimeout(this.timeout);
        return this;

    }

    onUpdate(...args) {

        this.events.on('update', ...args);
        return this;

    }

}

export { FixedEngine };
