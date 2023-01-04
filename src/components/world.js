import { ECS } from '$/ecs';
import { ObservablePoint } from 'pixi.js';
import { SpriteComponent } from './sprite';

class WorldComponent extends ECS.Component {

    preUpdate(world, sprite) {

        this.world = world;

        this.sprite = sprite || this.entity.getComponent(SpriteComponent)?.sprite;

        this.position = new ObservablePoint(() => {

            if (this.sprite) {

                const worldPosition = this.world.worldToCanvasPosition(this.position);
                this.sprite.position.set(
                    worldPosition.x, worldPosition.y
                );

            }

        }, this, 0, 0);

    }

    update() {

    }

}

WorldComponent.register();

export { WorldComponent };
