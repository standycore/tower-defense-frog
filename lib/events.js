/**
 *
 * EventEmitter class
 * handles adding callbacks to event names, calling them, etc
 * most likely use is emitter.on('eventName', () => {})
 *
 */
class EventEmitter {

    constructor() {

        this.events = {};

    }

    static get events() {

        if (!this._events) {

            this._events = new EventEmitter();

        }
        return this._events;

    }

    on(eventName, callback, options = {}) {

        if (!this.events[eventName]) {

            this.events[eventName] = [];

        }
        this.events[eventName].push({
            callback,
            once: options.once || false,
            id: options.id
        });
        return this;

    }

    once(eventName, callback, options = {}) {

        this.on(eventName, callback, { once: true, id: options.id });
        return this;

    }

    off(eventName, id) {

        if (this.events[eventName]) {

            if (!id) {

                delete this.events[eventName];

            } else {

                let index;
                if (typeof id === 'function') {

                    index = this.events[eventName].findIndex((element) => {

                        return element.callback === id;

                    });

                } else if (typeof id === 'number') {

                    index = this.events[eventName].findIndex((element) => {

                        return element.id === id;

                    });

                }
                if (typeof index === 'number' && index >= 0) {

                    this.events[eventName].splice(index, 1);

                }

            }

        }
        return this;

    }

    trigger(eventName, ...args) {

        const callbackArray = this.events[eventName] || [];
        for (let i = 0; i < callbackArray.length; i++) {

            const { callback, once } = callbackArray[i];
            // eslint-disable-next-line n/no-callback-literal
            callback(...args);
            if (once) {

                callbackArray.splice(i, 1);
                i -= 1;

            }

        }
        return this;

    }

}

export { EventEmitter };
