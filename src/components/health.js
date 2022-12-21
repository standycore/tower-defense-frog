import { ECS } from '$/ecs';

class HealthComponent extends ECS.Component {

    preUpdate(health) {

        this.health = health;

    }

}

HealthComponent.register();

export { HealthComponent };
