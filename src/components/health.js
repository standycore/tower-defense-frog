import { ECS } from '$/ecs';
import { EventEmitter } from '$/events';

class HealthComponent extends ECS.Component {

    preUpdate(health) {

        this.health = health;
        this.triggerOnce = true;
        this.dead = false;
        this.destroyOnDeath = true;
        this.events = new EventEmitter();

    }

    update() {

        if (this.health <= 0) {

            if (this.triggerOnce && !this.dead) {

                this.events.trigger('death', this);

            }

            if (!this.triggerOnce) {

                this.events.trigger('death', this);

            }

            this.dead = true;

            if (this.destroyOnDeath) {

                this.entity.destroy();

            }

        } else {

            this.dead = false;

        }

    }

}

HealthComponent.register();

export { HealthComponent };
