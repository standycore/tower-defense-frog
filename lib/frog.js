import { Assets, ObservablePoint } from 'pixi.js';
import { CustomSprite } from './customSprite';

class Frog {

    constructor(type, world) {

        this.world = world;
        this.type = type;
        this.position = new ObservablePoint((frog) => {

            this.sprite.position.set(
                this.position.x * world.cellSize.x,
                this.position.y * world.cellSize.y
            );

        }, this);

        let sprite;

        if (type === 'frog') {

            sprite = new CustomSprite(Assets.get('frogSheet'));

        }

        this.sprite = sprite;
        sprite.play();
        sprite.anchor.set(0.5);
        sprite.width = world.cellSize.x;
        sprite.height = world.cellSize.y;

    }

}

export { Frog };
