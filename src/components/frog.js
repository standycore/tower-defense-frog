import { ECS } from '$/ecs';
import { EventEmitter } from '$/events';

class FrogComponent extends ECS.Component {

    preUpdate(strength, eatInterval) {

        this.strength = strength;
        this.eatInterval = eatInterval;
        this.eatTimer = 0;

    }

    update(delta) {

        if (this.eatTimer >= this.eatInterval) {

            EventEmitter.events.trigger('frogEatBug', this.strength);
            this.eatTimer -= this.eatInterval;

        }

        this.eatTimer += delta;

    }

}

FrogComponent.register();

export { FrogComponent };
