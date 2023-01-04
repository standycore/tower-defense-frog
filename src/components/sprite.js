import { ECS } from '$/ecs';
import { Sprite } from 'pixi.js';

class SpriteComponent extends ECS.Component {

    preUpdate(sprite, callback = () => {}) {

        if (!(sprite instanceof Sprite)) {

            sprite = this.spriteConstructor(sprite);

        }

        this.sprite = sprite;

        callback(sprite);

    }

    spriteConstructor(source) {

        return Sprite.from(source);

    }

    onDestroy() {

        this.sprite?.destroy();

    }

}

SpriteComponent.register();

export { SpriteComponent };
