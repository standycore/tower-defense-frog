import { Assets, ObservablePoint } from 'pixi.js';
import { CustomSprite } from './customSprite';

class Bug {

    /**
     *
     * @param {string} type the type of bug passed as a string
     * @param {world} world the world from main :)
     * health - how much damage the fly can withstand
     * moveInterval - how fast the fly will move along the path (measured in ticks)
     */
    constructor(type, world) {

        this.world = world;
        this.type = type;
        this.health = 0;
        this.moveInterval = 0;
        this.position = new ObservablePoint((bug) => {

            this.sprite.position.set(
                this.position.x * world.cellSize.x,
                this.position.y * world.cellSize.y
            );

        }, this);

        let sprite;

        // changes the sprite, the health, and the move speed of the fly based on the type
        if (type === 'fly') {

            sprite = new CustomSprite(Assets.get('flySheet'));
            this.health = 1;
            this.moveInterval = 1000;

        } else if (type === 'spider') {

            sprite = new CustomSprite(Assets.get('spiderSheet'));
            this.health = 5;
            this.moveInterval = 2000;

        } else if (type === 'butterfly') {

            sprite = new CustomSprite(Assets.get('butterflySheet'));
            this.health = 3;
            this.moveInterval = 500;

        }

        // creates the sprite, and starts the animation
        this.sprite = sprite;
        sprite.play();
        sprite.anchor.set(0.5);
        sprite.width = world.cellSize.x;
        sprite.height = world.cellSize.y;

        // initializes the moveTimer(current milliseconds for moveInterval) and index(current index in pathArray) variables
        this.moveTimer = 0;
        this.index = 0;

    }

    /**
     *
     * @param {float} delta milliseconds between frames
     * @param {Array} pathArray the array storing the path tiles
     *
     */
    update(delta, pathArray) {

        // checks to see if the health is under or at zero, destroys the fly if so
        if (this.health <= 0) {

            this.destroy();
            return;

        }

        // checks to see if it's time to move the fly and if the fly is at the end of the path
        if (this.moveTimer >= this.moveInterval) {

            this.moveTimer -= this.moveInterval;
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

    /**
     * Destroys the sprite and changes the destroyed boolean to true
     */
    destroy() {

        this.sprite.destroy();
        this.destroyed = true;

    }

}

export { Bug };
