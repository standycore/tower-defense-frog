// import { FixedEngine } from './engine.js';

class Component {

    constructor(entity) {

        this.entity = entity;

        this.preUpdate();

    }

    preUpdate() {

    }

    update(delta) {

    }

    static register(componentName) {

        if (this.isRegistered) {

            return;

        }

        this.isRegistered = true;

        if (componentName && typeof componentName === 'string') {

            ECS.registerComponent(componentName, this);

        } else {

            ECS.registerComponent(this);

        }

    }

}

// class TestComponent extends Component {

//     preUpdate() {

//         this.count = 0;

//     }

//     update(delta) {

//         this.count += 1;

//     }

// }

class Entity {

    constructor() {

        this.componentMap = new Map();

        ECS.addEntity(this);

    }

    addComponent(component) {

        let componentName;

        if (typeof component === 'string') {

            componentName = component;
            component = ECS.getComponent(component);

            if (!component) {

                console.error(`could not find registered component by the name ${componentName}`);

            }

        }

        componentName = componentName || component.name;

        if (!component) {

            console.error('component argument required - must be a string or a class inherited from ECS.Component');
            return;

        }

        if (this.componentMap.has(componentName)) {

            console.error(`component ${componentName} already added to this entity`);
            return;

        }

        if (!(component.prototype instanceof Component)) {

            console.error('component must be a class inherited from ECS.Component');
            return;

        }

        if (!component.isRegistered) {

            console.error(`component ${componentName} is not registered to ECS - use ECS.registerComponent`);
            return;

        }

        // eslint-disable-next-line new-cap
        const instance = new component(this);

        this.componentMap.set(componentName, instance);

        return instance;

    }

    getComponent(componentName) {

        if (typeof componentName === 'string') {

            return this.componentMap.get(componentName);

        } else if (componentName.prototype instanceof Component) {

            return Array.from(this.componentMap.values()).find((component) => {

                return component.constructor.name === componentName.name;

            });

        }

    }

}

class ECS {

    static componentMap = new Map();
    static entities = [];
    static Component = Component;
    static Entity = Entity;

    static addEntity(entity) {

        this.entities.push(entity);

    }

    static createEntity() {

        return new Entity();

    };

    static registerComponent(componentName, component) {

        if (componentName.prototype instanceof Component) {

            component = componentName;
            componentName = component.name;

        } else if (typeof componentName !== 'string') {

            console.error('the componentName must be a string, or a class inherited from ECS.Component');
            return;

        }

        if (!(component.prototype instanceof Component)) {

            console.error('the component must be a class inherited from ECS.Component');
            return;

        }

        this.componentMap.set(componentName, component);
        return component;

    }

    static getComponent(componentName) {

        return this.componentMap.get(componentName);

    }

    static update(delta) {

        for (let i = 0; i < this.entities.length; i++) {

            const entity = this.entities[i];
            entity.componentMap.forEach((component) => {

                component.update(delta);

            });

        }

    }

}

// TestComponent.register();

// console.log(ECS.componentMap.entries());

// const testEntity = ECS.createEntity();

// testEntity.addComponent(TestComponent);

// console.log('get test:', testEntity.getComponent('TestComponent'));

// const testComponent = testEntity.getComponent(TestComponent);

// console.log(new TestComponent().constructor.name);

// const engine = new FixedEngine();

// engine.onUpdate((delta) => {

//     ECS.update(delta);

//     console.log(testComponent.count);

// });

// engine.start();

export { ECS };
