
import { Container } from 'pixi.js';
// import { Vector2 } from './vector';

class Camera extends Container {
    constructor(options = {}) {
        super();
        this.zoom = 0;
    }
}

export { Camera };
