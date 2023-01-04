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

        /** @type {import('$/customSprite').CustomSprite} */
        this.sprite = undefined;

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

        this.worldComponent = this.entity.addComponent(WorldComponent, world);
        this.worldComponent.position.set(
            pathArray[0].x,
            pathArray[0].y
        );
        this.healthComponent = this.entity.addComponent(HealthComponent, this.health);
        this.healthComponent.destroyOnDeath = false;
        this.healthComponent.events.on('death', () => {

            this.state = 'dying';
            this.pathFollowerComponent.active = false;

            this.sprite.stop();

            EventEmitter.events.trigger('bugDied', this.entity);

        });

        this.pathFollowerComponent = this.entity.addComponent(PathFollowerComponent, pathArray, this.speed);
        this.pathFollowerComponent.events.on('end', () => {

            this.state = 'done';
            EventEmitter.events.trigger('bugReachedEnd', this.entity);

        });

        this.damageIndicatorTimer = 0;

        this.eatenBy = undefined;

    }

    damage(amount) {

        this.healthComponent.health -= amount;
        this.damageIndicatorTimer = 100;

    }

    update(delta, time) {

        if (this.damageIndicatorTimer > 0) {

            this.sprite.tint = 0xFF9999;
            this.damageIndicatorTimer -= delta;

        } else {

            this.sprite.tint = 0xFFFFFF;
            this.damageIndicatorTimer = 0;

        }

        const offset = Math.sin(time * 0.05) * 10 * Math.min(1, this.damageIndicatorTimer / 100);
        this.worldComponent.offset.x = offset;
        this.worldComponent.offset.y = offset;

    }

}

BugComponent.register();

export { BugComponent };
