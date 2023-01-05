import { Grid } from '$/grid';
import { PathGenerator } from '$/pathGenerator';
import { WaveFunctionCollapser } from '$/wfc';

async function generateLevel(world, pathGraphics) {

    const wfc = new WaveFunctionCollapser();

    function forEachAdjacent(x, y, callback) {

        for (let ox = -1; ox <= 1; ox++) {

            for (let oy = -1; oy <= 1; oy++) {

                if (ox === 0 && ox === oy) {

                    continue;

                }

                const nx = x + ox;
                const ny = y + oy;

                callback(nx, ny);

            }

        }

    }

    wfc.createRule('no-adjacent-water', (value, x, y) => {

        let result = true;

        forEachAdjacent(x, y, (nx, ny) => {

            if (wfc.grid.get(nx, ny)?.decision?.value === 'w') {

                result = false;

            }

        });

        return result;

    });

    wfc.createRule('no-adjacent-land', (value, x, y) => {

        let result = true;

        forEachAdjacent(x, y, (nx, ny) => {

            if (wfc.grid.get(nx, ny)?.decision?.value === 'l') {

                result = false;

            }

        });

        return result;

    });

    wfc.createRule('prefer-adjacent-water', (value, x, y) => {

        // number of adjacent cells that are not water
        let count = 0;

        forEachAdjacent(x, y, (nx, ny) => {

            if (wfc.grid.get(nx, ny)?.decision && wfc.grid.get(nx, ny)?.decision.value !== 'w') {

                count++;

            }

        });

        return count < 2;

    });

    wfc.createRule('no-island', (value, x, y) => {

        // number of adjacent cells that are water
        let count = 0;

        forEachAdjacent(x, y, (nx, ny) => {

            const decision = wfc.grid.get(nx, ny)?.decision;

            if (decision && (decision.value === 'w' || decision.value === 'l')) {

                count++;

            }

        });

        return count < 4;

    });

    wfc.createRule('require-adjacent-water', (value, x, y) => {

        // number of adjacent cells that are water
        let count = 0;

        forEachAdjacent(x, y, (nx, ny) => {

            const decision = wfc.grid.get(nx, ny)?.decision;

            if (decision) {

                if (decision.value === 'w') {

                    count++;

                }

            } else {

                return true;

            }

        });

        return count > 0;

    });

    for (let x = -6; x <= 6; x++) {

        for (let y = -6; y <= 6; y++) {

            wfc.setCell(x, y);

            wfc.addOptionToCell(x, y, 'l', ['no-adjacent-water']);

            wfc.addOptionToCell(x, y, 'c', ['no-island']);

            wfc.addOptionToCell(x, y, 'w', ['no-adjacent-land']);

        }

    }

    // const valueColorMap = {
    //     l: 0x00FF00,
    //     c: 0xFFFF00,
    //     w: 0x0000FF
    // };

    const levelGrid = new Grid();

    wfc.onCellCollapse((decision) => {

        if (!decision) {

            return;

        }

        const { x, y, value } = decision;

        let cell = levelGrid.get(x, y);
        if (!cell) {

            cell = {
                x, y, stack: []
            };
            levelGrid.set(x, y, cell);

        }

        cell.background = value;
        cell.stack.push(value);

        // debug draw the world onto graphics
        // const startX = (x * world.cellSize.x) - (world.cellSize.x / 2);
        // const startY = (y * world.cellSize.y) - (world.cellSize.y / 2);

        // pathGraphics.beginFill(valueColorMap[value] || 0xFFFFFF);
        // pathGraphics.drawRect(startX, startY, world.cellSize.x, world.cellSize.y);
        // pathGraphics.endFill();

    });

    pathGraphics.clear();

    await wfc.collapse();

    const pathGenerator = new PathGenerator();

    const path = pathGenerator.generate(-4, 4, { x: 0, y: -1 });

    // console.log(path);

    let maxX = 0;
    let minX = 0;
    let maxY = 0;
    let minY = 0;

    const pathArray = [];

    path.forEach((value, x, y) => {

        maxX = Math.max(x, maxX);
        minX = Math.min(x, minX);
        maxY = Math.max(y, maxY);
        minY = Math.min(y, minY);

        let cell = levelGrid.get(x, y);
        if (!cell) {

            cell = {};
            levelGrid.set(x, y, cell);

        }

        cell.path = path;

        pathArray.push({ x, y });

    });

    function destroy() {

    }

    const level = {
        grid: levelGrid,
        path,
        pathArray,
        destroy
    };

    return level;

}

export { generateLevel };
