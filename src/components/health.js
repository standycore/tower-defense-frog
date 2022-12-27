import { ECS } from '$/ecs';

class HealthComponent extends ECS.Component {

    preUpdate(health) {

        this.health = health;

    }

    update() {

        if (this.health <= 0) {

            this.entity.destroy();

        }

    }

}

HealthComponent.register();

export { HealthComponent };
