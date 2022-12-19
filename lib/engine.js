
import { EventEmitter } from './events';

class FixedEngine {

    constructor() {

        this.timeout = undefined;
        this.events = new EventEmitter();
        this.interval = 60 / 1000;
        this.ticks = 0;

        this.isRunning = false;

        this.updateCaller = () => {

            this.events.trigger('update', this.ticks);
            this.ticks += 1;

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
