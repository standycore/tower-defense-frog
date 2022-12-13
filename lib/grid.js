
class Grid {
    constructor() {
        this.map = new Map();
    }

    // returns the updated map after setting a value to a new coordinate
    set(x, y, value) {
        if (!this.map.has(x)) {
            this.map.set(x, new Map());
        }

        this.map.get(x).set(y, value);
        return this;
    }

    // returns the value at the x, y position of the map
    get(x, y) {
        return this.map.get(x)?.get(y);
    }

    // removes a coordinate from the map
    remove(x, y) {
        const result = this.map.get(x)?.delete(y);
        if (result) {
            if (this.map.get(x).size === 0) {
                this.map.delete(x);
            }
        }
        return this;
    }

    // returns the current x, y of each spot on the grid
    forEach(callback) {
        if (callback) {
            this.map.forEach((yMap, x) => {
                yMap.forEach((value, y) => {
                    callback(value, x, y);
                });
            });
        }
        return this;
    }
}

export { Grid };
