import { ECS } from '$/ecs';
import { EventEmitter } from '$/events';
import { Assets } from 'pixi.js';
import { CustomSpriteComponent } from './customSprite';
import { WorldComponent } from './world';

class FrogComponent extends ECS.Component {

    preUpdate(world, options = {}) {

        const { id, name, assetSource, strength, eatInterval, range } = options;

        this.id = id;
        this.name = name;
        this.strength = strength || 1;
        this.eatInterval = eatInterval || 1000;
        this.range = range || 4;
        this.eatTimer = 0;

        const spriteSource = Assets.get(assetSource);

        this.entity.addComponent(CustomSpriteComponent, spriteSource, (sprite) => {

            // creates the sprite and starts the animation
            sprite.play();
            sprite.anchor.set(0.5);
            sprite.width = world.cellSize.x;
            sprite.height = world.cellSize.y;
            world.addChild(sprite);

        });

        this.entity.addComponent(WorldComponent, world);

    }

    update(delta) {

        if (this.eatTimer >= this.eatInterval) {

            EventEmitter.events.trigger('frogEatBug', this.entity);
            this.eatTimer -= this.eatInterval;

        }

        this.eatTimer += delta;

    }

}

FrogComponent.register();

export { FrogComponent };
