import { Grid } from './grid';
import { Vector2 } from './vector';

class World extends Grid {
    constructor(options = {}) {
        super();
        this.cellSize = new Vector2(20, 20);
    }

    drawGrid(graphics, offsetX, offsetY, width, height) {
        const cellW = this.cellSize.x;
        const cellH = this.cellSize.y;

        for (let x = 0; x < width / cellW; x++) {
            graphics.moveTo(x * cellW + offsetX, 0);
            graphics.lineTo(x * cellW + offsetX, height);
        }

        for (let y = 0; y < height / cellH; y++) {
            graphics.moveTo(0, y * cellH + offsetY);
            graphics.lineTo(width, y * cellH + offsetY);
        }
    }
}

export { World };
