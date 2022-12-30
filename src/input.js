import { EventEmitter } from '$/events';
import { Vector2 } from '$/vector';

class Input {

    static events = new EventEmitter();
    static canvas;
    static canvasMousePosition;
    static canvasMouseRelative;
    static initialized = false;

    static initialize(canvas) {

        this.canvas = canvas;

        // creates PIXI observable points for the canvas mouse position
        // this can be used as a global position, not for the world but for the canvas itself
        // might change to normal point later
        this.canvasMousePosition = new Vector2(0, 0);
        this.canvasMouseRelative = new Vector2(0, 0);
        canvas.addEventListener('mousemove', (e) => {

            this.canvasMousePosition.x = e.clientX || e.x || 0;
            this.canvasMousePosition.y = e.clientY || e.y || 0;
            this.canvasMouseRelative.x = e.movementX;
            this.canvasMouseRelative.y = e.movementY;

        });

        canvas.addEventListener('click', (e) => {

            this.events.trigger('click', e);

        });

        this.mousedown = false;
        canvas.addEventListener('mousedown', (e) => {

            this.mousedown = true;
            this.events.trigger('mousedown', e);

        });

        canvas.addEventListener('mouseup', (e) => {

            this.mousedown = false;
            this.events.trigger('mouseup', e);

        });

    }

    static update() {

        if (this.mousedown) {

            this.mousedown = false;

        }

    }

    static justClicked() {

        return this.mousedown;

    }

}

export { Input };
