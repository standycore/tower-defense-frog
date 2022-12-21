import { Grid } from './grid.js';

class PathGenerator {

    static UP = { x: 0, y: -1 };
    static DOWN = { x: 0, y: 1 };
    static LEFT = { x: -1, y: 0 };
    static RIGHT = { x: 1, y: 0 };
    static directions = [this.UP, this.DOWN, this.LEFT, this.RIGHT];

    constructor(startX, startY) {

        this.grid = new Grid();

        this.startX = startX;
        this.startY = startY;

    }

    generate(x, y, direction, length = 30, path = new Grid()) {

        // the base condition for exiting the recursive loop
        if (length === 0) return path;

        // x-y bounds for the path to follow
        const minX = -5;
        const maxX = 5;
        const minY = -5;
        const maxY = 5;

        // creates a tile and assigns a direction for it to follow
        const tile = { x, y };
        path.set(x, y, true);

        // creates a new array to store the possible directions
        let possibleDirections = [];
        if (direction) {

            possibleDirections.push(direction);

        } else {

            possibleDirections.push(...PathGenerator.directions);

        }

        // checks if the possible directions are within bounds
        possibleDirections = possibleDirections.filter((direction) => {

            const newX = tile.x + direction.x;
            const newY = tile.y + direction.y;

            if (newX > maxX || newX < minX) return false;
            if (newY > maxY || newY < minY) return false;
            if (path.get(newX, newY)) return false;

            // an adjacency test for the new tile
            const testOffsets = [direction];
            if (direction.x) {

                testOffsets.push(PathGenerator.directions[0], PathGenerator.directions[1]);

            } else if (direction.y) {

                testOffsets.push(PathGenerator.directions[2], PathGenerator.directions[3]);

            }

            for (const offset of testOffsets) {

                const ox = offset.x;
                const oy = offset.y;
                // ignore diagonals
                if (ox === oy) {

                    continue;

                }

                const testX = newX + ox;
                const testY = newY + oy;

                // ignore center new tile
                if (newX === testX && newY === testY) {

                    // console.log('ignorning center');
                    continue;

                }

                // if testTile is the same as last tile (x, y), ignore
                if (testX === x && testY === y) {

                    continue;

                }

                if (path.get(testX, testY)) {

                    return false;

                }

            }

            return true;

        });

        // sets direction to a random direction from possibleDirections
        direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
        if (!direction) return path;

        // clones the tile and adds a direction component, then adds it to the path
        const newTile = { x: tile.x + direction.x, y: tile.y + direction.y };
        return this.generate(newTile.x, newTile.y, undefined, --length, path);

    }

}

export { PathGenerator };
