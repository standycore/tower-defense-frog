import { ECS } from '$/ecs';
import { Assets } from 'pixi.js';
import { CustomSpriteComponent } from 'src/components/customSprite';
import { FrogComponent } from 'src/components/frog';
import { WorldComponent } from 'src/components/world';
import { CustomSprite } from '../../lib/customSprite';

class Frog extends ECS.Entity {

    /*
        world - the world data
        type - the type of frog passed as a string
        eatInterval - how fast the frog attacks the bugs
        strength - how much damage the frog can do per attack
    */
    constructor(world, type) {

        super();

        let sprite;
        let eatInterval = 0;
        let strength = 0;

        // changes the sprite, strength, and eatInterval depending on the type of frog
        if (type === 'frog') {

            sprite = new CustomSprite(Assets.get('frogSheet'));
            eatInterval = 2500;
            strength = 1;

        }

        // creates the sprite and starts the animation
        sprite.play();
        sprite.anchor.set(0.5);
        sprite.width = world.cellSize.x;
        sprite.height = world.cellSize.y;
        world.addChild(sprite);

        this.addComponent(CustomSpriteComponent, sprite);
        this.addComponent(WorldComponent, world, sprite);
        this.addComponent(FrogComponent, strength, eatInterval);

    }

    type() {

        return 'frog';

    }

}

export { Frog };
