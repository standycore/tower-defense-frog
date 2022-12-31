import { ECS } from '$/ecs';
import { EventEmitter } from '$/events';

class HealthComponent extends ECS.Component {

    preUpdate(health) {

        this.health = health;

    }

    update() {

        if (this.health <= 0) {

            this.entity.destroy();
            EventEmitter.events.trigger('bugDied', this.entity);

        }

    }

}

HealthComponent.register();

export { HealthComponent };
