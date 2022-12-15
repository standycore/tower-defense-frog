
class Grid {
    constructor() {
        this.map = new Map();
        this.directMap = new Map();
    }

    // returns the updated map after setting a value to a new coordinate
    set(x, y, value) {
        if (!this.map.has(x)) {
            this.map.set(x, new Map());
        }

        this.map.get(x).set(y, value);
        this.directMap.set(value, { x, y });
        return this;
    }

    // returns the value at the x, y position of the map
    get(x, y) {
        return this.map.get(x)?.get(y);
    }

    // removes a coordinate from the map
    remove(x, y) {
        const value = this.map.get(x)?.get(y);
        if (value) {
            this.map.get(x).delete(y);
            if (this.map.get(x).size === 0) {
                this.map.delete(x);
            }
        }
        this.directMap.has(value) && this.directMap.delete(value);
        return this;
    }

    // returns the current x, y of each spot on the grid
    forEach(callback) {
        if (!callback) {
            return;
        }
        this.directMap.forEach(({ x, y }, value) => {
            callback(value, x, y);
        });
        return this;
    }

    values() {
        return this.directMap.keys();
    }

    keys() {
        return this.directMap.values();
    }

    clear() {
        this.map.forEach((map) => {
            map.clear();
        });
        this.map.clear();
        this.directMap.clear();
        return this;
    }
}

export { Grid };
