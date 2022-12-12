
import { Container } from 'pixi.js';

class Camera extends Container {
    constructor(options = {}) {
        super();
        this._zoom = 0;
    }

    set zoom(value) {
        this._zoom = Math.min(1, Math.max(0, value));
    }

    get zoom() {
        return this._zoom;
    }
}

export { Camera };
