import { ECS } from '$/ecs';
import { EventEmitter } from '$/events';

class FrogComponent extends ECS.Component {

    preUpdate(strength, eatInterval, range) {

        this.strength = strength;
        this.eatInterval = eatInterval;
        this.range = range;
        this.eatTimer = 0;

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
