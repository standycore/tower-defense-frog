
class Grid {

    constructor() {

        this.map = new Map();
        this.keyArray = [];
        this.valueArray = [];

    }

    get size() {

        return this.keyArray.length;

    }

    // returns the updated map after setting a value to a new coordinate
    set(x, y, value) {

        if (!this.map.has(x)) {

            this.map.set(x, new Map());

        }

        this.map.get(x).set(y, value);

        this.keyArray.push({ x, y });
        this.valueArray.push(value);
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

        const index = this.keyArray.findIndex((point) => {

            return point.x === x && point.y === y;

        });
        if (index >= 0) {

            this.keyArray.splice(index, 1);
            this.valueArray.splice(index, 1);

        }

        return this;

    }

    // pop() {

    //     const value = this.directMap.values()[this.directMap.size - 1];
    //     this.directMap.delete(value);
    //     return value;

    // }

    // returns the current x, y of each spot on the grid
    forEach(callback) {

        if (!callback) {

            return;

        }
        for (let i = 0; i < this.keyArray.length; i++) {

            const { x, y } = this.keyArray[i];
            const value = this.valueArray[i];
            callback(value, x, y);

        }

        return this;

    }

    values() {

        return [...this.valueArray];

    }

    keys() {

        return [...this.keyArray];

    }

    clear() {

        this.map.forEach((map) => {

            map.clear();

        });
        this.map.clear();
        this.valueArray = [];
        this.keyArray = [];
        return this;

    }

}

export { Grid };
