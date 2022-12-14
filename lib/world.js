import { Grid } from './grid';
import { Camera } from './camera';

import { Container, Graphics, Point } from 'pixi.js';
import { GroupMap } from './groupMap';

import '@pixi/math-extras';

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

        // directions for the path to follow
        const UP = new Point(0, -1);
        const DOWN = new Point(0, 1);
        const LEFT = new Point(-1, 0);
        const RIGHT = new Point(1, 0);
        this.directions = [UP, DOWN, LEFT, RIGHT];

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

    // (WIP)
    // creates the path through the grid
    createPath(x, y, direction = this.directions[0], length = 30, path = new Grid()) {
        // the base condition for exiting the recursive loop
        console.log('x', x, 'y', y);
        if (length === 0) return path;

        // x-y bounds for the path to follow
        const minX = -4;
        const maxX = 4;
        const minY = -4;
        const maxY = 4;

        // creates a tile and assigns a direction for it to follow
        const tile = new Point(x, y);

        // creates a new array to store the possible directions
        let possibleDirections = [direction];
        if (Math.abs(direction.x) > 0) {
            possibleDirections.push(this.directions[0], this.directions[1]);
        } else if (Math.abs(direction.y) > 0) {
            possibleDirections.push(this.directions[2], this.directions[3]);
        }

        // checks if the possible directions are within bounds
        possibleDirections = possibleDirections.filter((direction) => {
            const newX = tile.x + direction.x;
            const newY = tile.y + direction.y;

            if (newX > maxX || newX < minX) return false;
            if (newY > maxY || newY < minY) return false;
            if (path.get(newX, newY)) return false;

            return true;
        });

        // sets direction to a random direction from possibleDirections
        direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
        if (!direction) return path;

        // clones the tile and adds a direction component, then adds it to the path
        const newTile = tile.clone().add(direction);
        path.set(x, y, newTile);
        return this.createPath(newTile.x, newTile.y, direction, --length, path);
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

        const scale = (camera.zoom * 5 + 1);
        this.scale.x = scale;
        this.scale.y = scale;
    }

    render(...args) {
        if (this.autoUpdateFromCamera) {
            this.updateFromCamera(this.camrea);
        }
        this.drawGrid(-4, 4);
        super.render(...args);
    }
}

export { World };
