
class Grid {
    constructor() {
        this.map = new Map();
    }

    set(x, y, value) {
        if (!this.map.has(x)) {
            this.map.set(x, new Map());
        }

        this.map.get(x).set(y, value);
        return this;
    }

    get(x, y) {
        return this.map.get(x)?.get(y);
    }

    remove(x, y) {
        const result = this.map.get(x)?.delete(y);
        if (result) {
            if (this.map.get(x).size === 0) {
                this.map.delete(x);
            }
        }
        return this;
    }

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

    clear() {
        this.map.forEach((map) => {
            map.clear();
        });
        this.map.clear();
        return this;
    }
}

export { Grid };
