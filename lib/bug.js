import { Assets, ObservablePoint } from 'pixi.js';
import { CustomSprite } from './customSprite';

class Bug {

    constructor(type, world) {

        this.world = world;
        this.type = type;
        this.health = 0;
        this.timer = 0;
        this.position = new ObservablePoint((bug) => {

            this.sprite.position.set(
                this.position.x * world.cellSize.x,
                this.position.y * world.cellSize.y
            );

        }, this);

        let sprite;

        if (type === 'fly') {

            sprite = new CustomSprite(Assets.get('flySheet'));
            this.health = 1;
            this.timer = 1000;

        } else if (type === 'spider') {

            sprite = new CustomSprite(Assets.get('spiderSheet'));
            this.health = 5;
            this.timer = 2000;

        } else if (type === 'butterfly') {

            sprite = new CustomSprite(Assets.get('butterflySheet'));
            this.health = 3;
            this.timer = 500;

        }

        this.sprite = sprite;
        sprite.play();
        sprite.anchor.set(0.5);
        sprite.width = world.cellSize.x;
        sprite.height = world.cellSize.y;

        this.moveTimer = 0;
        this.index = 0;

    }

    update(delta, pathArray) {

        if (this.health <= 0) {

            this.destroy();
            return;

        }

        if (this.moveTimer >= this.timer) {

            this.moveTimer -= this.timer;
            if (pathArray[this.index]) {

                this.position.x = pathArray[this.index].x;
                this.position.y = pathArray[this.index].y;
                this.index++;

            } else {

                this.destroy();

            }

        }

        this.moveTimer += delta;

    }

    destroy() {

        this.sprite.destroy();
        this.destroyed = true;

    }

}

export { Bug };
