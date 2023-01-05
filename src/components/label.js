import { ECS } from '$/ecs';
import { BitmapText } from 'pixi.js';

class LabelComponent extends ECS.Component {

    /**
     * @param {string} t
     */
    set text(t) {

        this.bitmapText.text = t;

    }

    /**
     * @returns {string}
     */
    get text() {

        return this.bitmapText.text;

    }

    preUpdate(container, text, options = {}) {

        /** @type {BitmapText} */
        this.bitmapText = new BitmapText('text', {
            fontName: options.fontName || 'Arial',
            fontSize: options.fontSize
        });

        container.addChild(this.bitmapText);

        this.target = options.target;

        this.text = text;

    }

    update() {

        if (this.target) {

            this.bitmapText.position.set(
                this.target.x,
                this.target.y
            );

        }

    }

    onDestroy() {

        this.bitmapText.destroy();

    }

}

LabelComponent.register();

export { LabelComponent };
