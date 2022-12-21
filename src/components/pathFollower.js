import { ECS } from '$/ecs';
import { WorldComponent } from './world';

class PathFollowerComponent extends ECS.Component {

    preUpdate(pathArray, moveInterval = 1000) {

        this.pathArray = pathArray;

        // initializes the moveTimer(current milliseconds for moveInterval) and index(current index in pathArray) variables
        this.moveTimer = 0;
        this.index = 0;
        this.moveInterval = moveInterval;

        this.worldComponent = this.entity.getComponent(WorldComponent);

    }

    get position() {

        return this.worldComponent?.position;

    }

    update(delta) {

        // checks to see if the health is under or at zero, destroys the fly if so
        if (this.health <= 0) {

            this.entity.destroy();
            return;

        }

        // checks to see if it's time to move the fly and if the fly is at the end of the path
        if (this.moveTimer >= this.moveInterval) {

            this.moveTimer -= this.moveInterval;
            this.index++;
            if (this.pathArray[this.index]) {

                this.position.x = this.pathArray[this.index].x;
                this.position.y = this.pathArray[this.index].y;

            } else {

                this.entity.destroy();

            }

        }

        this.moveTimer += delta;

    }

}

PathFollowerComponent.register();

export { PathFollowerComponent };
