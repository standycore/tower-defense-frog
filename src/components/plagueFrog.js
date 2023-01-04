import { Vector2 } from '$/vector';
import { BugComponent } from './bug';
import { FrogComponent } from './frog';

class PlagueFrogComponent extends FrogComponent {

    getTargetBugs(bugs) {

        return bugs.filter((bug) => {

            const bugComponent = bug.getComponent(BugComponent);
            return bugComponent.state === 'alive' && Vector2.distanceBetweenVectors(bugComponent.worldComponent.position, this.worldComponent.position) < this.range;

        });

    }

    onAttack(bug) {

        const bugComponent = bug.getComponent(BugComponent);
        bugComponent.damage(this.strength);

    }

}

PlagueFrogComponent.register();

export { PlagueFrogComponent };
