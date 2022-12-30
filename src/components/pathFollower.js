import { ECS } from '$/ecs';
import { Vector2 } from '$/vector';
import { WorldComponent } from './world';

class PathFollowerComponent extends ECS.Component {

    preUpdate(pathArray, speed = 1) {

        this.pathArray = pathArray;

        // initializes index(current index in pathArray) variables
        this.index = 0;

        this.worldComponent = this.entity.getComponent(WorldComponent);

        // world distance travelled per second
        this.speed = speed;

    }

    get position() {

        return this.worldComponent?.position;

    }

    update(delta) {

        let frameTravelDistance = this.speed * delta * 0.001;
        const currentPoint = new Vector2(this.position);
        // safety escape that prevents infinite loop
        let iter = 0;

        while (iter < 100) {

            // check for reaching end of path
            if (this.index >= this.pathArray.length - 1) {

                this.entity.destroy();
                return;

            }

            const targetPoint = new Vector2(this.pathArray[this.index + 1]);
            const distanceToTarget = Vector2.distanceBetweenVectors(currentPoint, targetPoint);

            // the distance travelled in the frame will not reach the target
            if (frameTravelDistance < distanceToTarget) {

                const direction = targetPoint.copy().sub(currentPoint).normalize();
                currentPoint.add(direction.mul(frameTravelDistance));
                break;

            }
            // distance travelled in the frame will reach/pass the target
            // so, move to next path point and subtract that from travelDistance
            frameTravelDistance -= distanceToTarget;
            this.index += 1;
            currentPoint.set(targetPoint);

            iter++;

        }

        this.position.set(currentPoint.x, currentPoint.y);

    }

}

PathFollowerComponent.register();

export { PathFollowerComponent };
