import { CustomSprite } from '$/customSprite';
import { ECS } from '$/ecs';
import { Assets } from 'pixi.js';
import { CustomSpriteComponent } from 'src/components/customSprite';
import { HealthComponent } from 'src/components/health';
import { PathFollowerComponent } from 'src/components/pathFollower';
import { WorldComponent } from 'src/components/world';

class Bug extends ECS.Entity {

    static array = [];

    constructor(world, type, pathArray) {

        super();

        Bug.array.push(this);

        let sprite;
        let speed;
        let health;

        // changes the sprite, the health, and the move speed of the fly based on the type
        if (type === 'fly') {

            sprite = new CustomSprite(Assets.get('flySheet'));
            health = 1;
            speed = 2;

        } else if (type === 'spider') {

            sprite = new CustomSprite(Assets.get('spiderSheet'));
            health = 5;
            speed = 1;

        } else if (type === 'butterfly') {

            sprite = new CustomSprite(Assets.get('butterflySheet'));
            health = 3;
            speed = 3;

        }

        // creates the sprite, and starts the animation
        sprite.play();
        sprite.anchor.set(0.5);
        sprite.width = world.cellSize.x;
        sprite.height = world.cellSize.y;

        world.addChild(sprite);

        this.addComponent(CustomSpriteComponent, sprite);
        this.addComponent(WorldComponent, world, sprite);
        this.addComponent(PathFollowerComponent, pathArray, speed);
        this.addComponent(HealthComponent, health);

    }

}

export { Bug };
