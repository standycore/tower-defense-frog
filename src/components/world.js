import { ECS } from '$/ecs';
import { ObservablePoint } from 'pixi.js';
import { SpriteComponent } from './sprite';

class WorldComponent extends ECS.Component {

    preUpdate(world, sprite) {

        this.world = world;

        this.sprite = sprite || this.entity.getComponent(SpriteComponent)?.sprite;

        this.position = new ObservablePoint(() => {

            if (this.sprite) {

                this.sprite.position.set(
                    this.position.x * this.world.cellSize.x,
                    this.position.y * this.world.cellSize.y
                );

            }

        }, this, 0, 0);

    }

    update() {

    }

}

WorldComponent.register();

export { WorldComponent };
