import { ECS } from '$/ecs';

class SpriteComponent extends ECS.Component {

    preUpdate(sprite) {

        this.sprite = sprite;

    }

    onDestroy() {

        this.sprite?.destroy();

    }

}

SpriteComponent.register();

export { SpriteComponent };
