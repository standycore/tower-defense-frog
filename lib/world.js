import { Grid } from './grid';
import { Camera } from './camera';

import { Container, Graphics, Point } from 'pixi.js';
import { GroupMap } from './groupMap';

class World extends Container {
    constructor(app, options = {}) {
        super();

        this.grid = new Grid();

        this.graphics = new Graphics();
        this.addChild(this.graphics);
        GroupMap.groupMap.create('grid', -1, false);
        this.graphics.parentGroup = GroupMap.groupMap.get('grid');

        this.camera = new Camera();
        this.autoUpdateFromCamera = true;

        this.app = app;

        this.left = 0;
        this.top = 0;
        this.right = 0;
        this.bottom = 0;

        this.cellSize = new Point(40, 40);

        this.updateFromCamera();
    }

    drawGrid() {
        const cellW = this.cellSize.x;
        const cellH = this.cellSize.y;

        if (!cellW || !cellH) {
            return;
        }

        const graphics = this.graphics;

        graphics.clear();

        graphics.lineStyle(1, 0xffffff);

        const offsetX = cellW * 0.5;
        const offsetY = cellH * 0.5;

        for (let x = Math.max(0, this.left - this.left % cellW); x < this.right; x += cellW) {
            graphics.moveTo(x + offsetX, this.top);
            graphics.lineTo(x + offsetX, this.bottom);
        }

        for (let x = Math.min(0, this.right - this.right % cellW); x > this.left; x -= cellW) {
            graphics.moveTo(x - offsetX, this.top);
            graphics.lineTo(x - offsetX, this.bottom);
        }

        for (let y = Math.max(0, this.top - this.top % cellH); y < this.bottom; y += cellH) {
            graphics.moveTo(this.left, y + offsetY);
            graphics.lineTo(this.right, y + offsetY);
        }

        for (let y = Math.min(0, this.bottom - this.bottom % cellH); y > this.top; y -= cellH) {
            graphics.moveTo(this.left, y - offsetY);
            graphics.lineTo(this.right, y - offsetY);
        }

        graphics.drawCircle(0, 0, 4);
    }

    updateFromCamera(camera = this.camera) {
        const halfWidth = this.app.screen.width * 0.5;
        const halfHeight = this.app.screen.height * 0.5;
        this.position.x = -camera.position.x + halfWidth;
        this.position.y = -camera.position.y + halfHeight;
        this.left = camera.position.x - halfWidth;
        this.right = camera.position.x + halfWidth;
        this.top = camera.position.y - halfHeight;
        this.bottom = camera.position.y + halfHeight;
    }

    render(...args) {
        if (this.autoUpdateFromCamera) {
            this.updateFromCamera(this.camrea);
        }
        this.drawGrid();
        super.render(...args);
    }
}

export { World };
