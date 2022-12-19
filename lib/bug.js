import { Assets, ObservablePoint } from 'pixi.js';
import { CustomSprite } from './customSprite';

class Bug {

    constructor(type, world) {

        this.world = world;
        this.type = type;
        let sprite;
        this.position = new ObservablePoint((bug) => {

            this.sprite.position.set(
                this.position.x * world.cellSize.x,
                this.position.y * world.cellSize.y
            );

        }, this);

        if (type === 'fly') sprite = new CustomSprite(Assets.get('flySheet'));
        else if (type === 'spider') sprite = new CustomSprite(Assets.get('spiderSheet'));

        this.sprite = sprite;
        sprite.play();
        sprite.anchor.set(0.5);
        sprite.width = world.cellSize.x;
        sprite.height = world.cellSize.y;

        this.moveTimer = 0;
        this.index = 0;

    }

    update(delta, pathArray) {

        if (this.moveTimer >= 1000) {

            this.moveTimer -= 1000;
            if (pathArray[this.index]) {

                this.position.x = pathArray[this.index].x;
                this.position.y = pathArray[this.index].y;
                this.index++;

            } else this.destroy();

        }

        this.moveTimer += delta;

    }

    destroy() {

        this.sprite.destroy();
        this.destroyed = true;

    }

}

export { Bug };
