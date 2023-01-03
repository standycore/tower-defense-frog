import { ECS } from '$/ecs';
import { EventEmitter } from '$/events';
import { Assets } from 'pixi.js';
import { CustomSpriteComponent } from './customSprite';
import { HealthComponent } from './health';
import { PathFollowerComponent } from './pathFollower';
import { WorldComponent } from './world';

class BugComponent extends ECS.Component {

    preUpdate(world, pathArray, options = {}) {

        const { id, name, assetSource, health, speed, worth } = options;

        this.id = id;
        this.name = name;
        this.health = health;
        this.speed = speed;
        this.worth = worth;

        const spriteSource = Assets.get(assetSource);

        this.entity.addComponent(CustomSpriteComponent, spriteSource, (sprite) => {

            // creates the sprite and starts the animation
            sprite.play();
            sprite.anchor.set(0.5);
            sprite.width = world.cellSize.x;
            sprite.height = world.cellSize.y;
            world.addChild(sprite);

        });

        this.entity.addComponent(WorldComponent, world).position.set(
            pathArray[0].x,
            pathArray[0].y
        );
        this.entity.addComponent(HealthComponent, this.health).events.on('death', () => {

            EventEmitter.events.trigger('bugDied', this.entity);

        });
        this.entity.addComponent(PathFollowerComponent, pathArray, this.speed);

    }

}

BugComponent.register();

export { BugComponent };
