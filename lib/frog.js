import { Assets, ObservablePoint } from 'pixi.js';
import { CustomSprite } from './customSprite';

class Frog {

    /*
        type - the type of frog passed as a string
        eatInterval - how fast the frog attacks the bugs
        strength - how much damage the frog can do per attack
    */
    constructor(type, world) {

        this.world = world;
        this.type = type;
        this.eatInterval = 0;
        this.strength = 0;
        this.position = new ObservablePoint((frog) => {

            this.sprite.position.set(
                this.position.x * world.cellSize.x,
                this.position.y * world.cellSize.y
            );

        }, this);

        let sprite;

        // changes the sprite, strength, and eatInterval depending on the type of frog
        if (type === 'frog') {

            sprite = new CustomSprite(Assets.get('frogSheet'));
            this.eatInterval = 1000;
            this.strength = 1;

        }

        // creates the sprite and starts the animation
        this.sprite = sprite;
        sprite.play();
        sprite.anchor.set(0.5);
        sprite.width = world.cellSize.x;
        sprite.height = world.cellSize.y;

    }

}

export { Frog };
