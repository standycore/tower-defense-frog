/**
 * ECS Component
 * can be accessed with ECS.Component (recommended)
 * this should not be constructed manually, only extended by a new class and registered to the ECS system
 * to do this, make a new component as such:
 * @example
 * class NewComponent extends ECS.Component {
 *     preUpdate(...args) {
 *
 *     }
 *
 *     update(delta, time) {
 *
 *     }
 *
 *     onDestroy() {
 *
 *     }
 * }
 *
 * NewComponent.register(); // recommended
 * // or
 * ECS.registerComponent(NewComponent);
 * @param {Entity} entity the entity that the component is attached to
 * @param {...any} args any amount of arguments that the component uses as parameters in preUpdate
 */
class Component {

    constructor(entity, ...args) {

        this.entity = entity;

        this.preUpdate(...args);

    }

    preUpdate() {

    }

    update(delta) {

    }

    onDestroy() {

    }

    destroy() {

        this.onDestroy();
        this.destroyed = true;

    }

    /**
     * registers this component with an optional string name, otherwise it will be named by its constructor name
     * components must be registered to be used in the ECS system and added to entities
     * works by calling ECS.registerComponent
     * @param {string} componentName (optional) the name of the component
     */
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

/**
 * ECS Entity
 * can be accessed with ECS.Entity (recommended)
 * entities hold ECS components, that's all, and probably shouldn't be used as logical objects themselves
 * entities have no update loop, only components do.
 * however, extended entities can be used to initialize repeated component combinations
 * @example
 * class NPC extends Entity {
 *     constructor() {
 *
 *         let health = 50;
 *
 *         this.addComponent(Health, health);
 *         this.addComponent(PathFinder);
 *         this.addComponent(Sprite, 'assets/npc.png');
 *
 *     }
 * }
 */
class Entity {

    constructor() {

        this.componentMap = new Map();
        this.destroyed = false;

        ECS.addEntity(this);

    }

    /**
     * Marks self and all components for deletion
     */
    destroy() {

        this.componentMap.forEach((component) => {

            component.destroy();

        });

        this.componentMap.clear();

        this.destroyed = true;

    }

    /**
     * adds a component to this entity
     * if the component already exists in this entity, it will not add it
     * @param {constructor} component as a string or as a class constructor, not an instance of a class
     * @param  {...any} componentArgs
     * @returns {Component} as an new instance
     */
    addComponent(component, ...componentArgs) {

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
        const instance = new component(this, ...componentArgs);

        this.componentMap.set(componentName, instance);

        return instance;

    }

    /**
     * gets a component from this entity if it has it
     * @param {constructor} componentName can be a string or a component constuctor, not an instance
     * @returns {Component} the component instance or undefined if it is not in this entity
     */
    getComponent(componentName) {

        if (typeof componentName === 'string') {

            return this.componentMap.get(componentName);

        } else if (componentName.prototype instanceof Component) {

            return Array.from(this.componentMap.values()).find((component) => {

                // return component.constructor.name === componentName.name;
                return component instanceof componentName;

            });

        }

    }

    /**
     * returns the map of components in this entity
     * @returns {Map} the component map
     */
    getComponents() {

        return this.componentMap;

    }

}

/**
 * Entity Component System manager
 * can be used to create, store, and update entities, and register components
 * stores all registered components that can be added to entities
 */
class ECS {

    static componentMap = new Map();
    static entities = [];
    static Component = Component;
    static Entity = Entity;

    static addEntity(entity) {

        this.entities.push(entity);

    }

    /**
     * creates a black Entity to be modified by adding components
     * @returns {Entity} new entity
     */
    static createEntity() {

        return new Entity();

    };

    /**
     * registers a component constructor by component name into the ECS system
     * if the name is the constructor itself, the component will be named by the constructor's name
     * @param {string} componentName can be a string or a component constructor, not instance
     * @param {constructor} component a component constructor, not instance
     * @returns {constructor} the component constructor
     */
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

        component.isRegistered = true;
        this.componentMap.set(componentName, component);
        return component;

    }

    /**
     * gets the component constructor stored in the map by its registered name
     * @param {string} componentName name of the component
     * @returns {constructor} the component constructor
     */
    static getComponent(componentName) {

        return this.componentMap.get(componentName);

    }

    /**
     * helper function for updating entities and their components
     * @example
     * const entities = [];
     *
     * function gameLoop(delta, time) {
     *
     *     for (let i = 0; i < entities.length; i++) {
     *
     *         const entity = entities[i];
     *
     *         if (!entity.destroyed) {
     *
     *             ECS.updateEntity(entity, delta, time);
     *
     *         } else {
     *
     *             entities.splice(i, 1);
     *
     *         }
     *     }
     * }
     * @param {Entity} entity
     * @param {float} delta
     * @param {float} time
     */
    static updateEntity(entity, delta, time) {

        entity.componentMap.forEach((component) => {

            component.update(delta, time);

        });

    }

    /**
     * updates all entities added to this ECS system
     * entities don't have to be managed by the ECS system
     * they can be managed by your own loops using ECS.updateEntity
     * @param {float} delta
     * @param {float} time
     */
    static update(delta, time) {

        for (let i = 0; i < this.entities.length; i++) {

            const entity = this.entities[i];
            this.updateEntity(entity, delta, time);

        }

    }

}

export { ECS };
