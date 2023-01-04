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

        this.state = 'alive';

        const spriteSource = Assets.get(assetSource);

        this.entity.addComponent(CustomSpriteComponent, spriteSource, (sprite) => {

            // creates the sprite and starts the animation
            sprite.play();
            sprite.anchor.set(0.5);
            sprite.width = world.cellSize.x;
            sprite.height = world.cellSize.y;
            world.addChild(sprite);

            this.sprite = sprite;

        });

        this.entity.addComponent(WorldComponent, world).position.set(
            pathArray[0].x,
            pathArray[0].y
        );
        this.healthComponent = this.entity.addComponent(HealthComponent, this.health);
        this.healthComponent.destroyOnDeath = false;
        this.healthComponent.events.on('death', () => {

            this.state = 'dying';
            this.pathFollowerComponent.active = false;

            EventEmitter.events.trigger('bugDied', this.entity);

        });

        this.pathFollowerComponent = this.entity.addComponent(PathFollowerComponent, pathArray, this.speed);
        this.pathFollowerComponent.events.on('end', () => {

            this.state = 'done';
            EventEmitter.events.trigger('bugReachedEnd', this.entity);

        });

    }

}

BugComponent.register();

export { BugComponent };
