import { ECS } from '$/ecs';
import { EventEmitter } from '$/events';
import { Vector2 } from '$/vector';
import { Assets, Sprite, Texture } from 'pixi.js';
import { BugComponent } from './bug';
import { CustomSpriteComponent } from './customSprite';
import { LabelComponent } from './label';
import { WorldComponent } from './world';

class FrogComponent extends ECS.Component {

    preUpdate(world, bugs, options = {}) {

        const { id, name, assetSource, strength, attackInterval, range, eatDuration } = options;

        this.id = id;
        this.name = name;
        this.strength = strength || 1;
        this.attackInterval = attackInterval || 1000;
        this.range = range || 4;
        this.attackTimer = 0;

        // determined by bug and frog
        this.baseEatDuration = eatDuration || 2000;
        this.eatDuration = 0;
        this.eatTimer = 0;
        this.eatingBug = undefined;

        this.state = 'attacking';

        this.events = new EventEmitter();

        this.ready = true;

        this.bugs = bugs;

        const spriteSource = Assets.get(assetSource);

        this.entity.addComponent(CustomSpriteComponent, spriteSource, (sprite) => {

            // creates the sprite and starts the animation
            sprite.play();
            sprite.anchor.set(0.5);
            sprite.width = world.cellSize.x;
            sprite.height = world.cellSize.y;
            world.addChild(sprite);

            this.sprite = sprite;

        });

        this.tongueTip = new Sprite(Assets.get('circle'));
        this.tongueTip.width = 20;
        this.tongueTip.height = 20;
        this.tongueTip.tint = 0xFF8888;
        this.tongueTip.anchor.set(0.5);
        this.tongueTip.visible = false;
        this.tongueTipStart = new Vector2();
        world.addChild(this.tongueTip);

        this.tongue = new Sprite(Texture.WHITE);
        this.tongue.tint = 0xFF8888;
        this.tongue.anchor.set(0, 0.5);
        this.tongue.width = 30;
        this.tongue.height = 8;
        this.tongue.rotation = 0;
        this.tongue.visible = false;
        world.addChild(this.tongue);

        this.worldComponent = this.entity.addComponent(WorldComponent, world);

        // debug label
        this.label = this.entity.addComponent(LabelComponent, world, 'frog', { target: this.entity.getComponent(CustomSpriteComponent).sprite.position });

    }

    getClosestBug(bugs) {

        // finds the closest bug to the frog and is furthest on the path and is in range of frog
        let closestBug;
        let furthestPath = 0;
        for (let i = 0; i < bugs.length; i++) {

            const bug = bugs[i];

            if (bug.destroyed) {

                continue;

            }

            const bugComponent = bug.getComponent(BugComponent);

            const distance = Vector2.distanceBetweenVectors(bugComponent.worldComponent.position, this.worldComponent.position);
            const index = bugComponent.pathFollowerComponent.index;
            if (distance <= this.range && (!closestBug || (index > furthestPath))) {

                furthestPath = index;
                closestBug = bug;

            }

        }

        return closestBug;

    }

    /**
     * gets targeted bugs based on your own rules. called in update
     * @param {Array<ECS.Entity>} bugs array of all bugs in the world
     * @returns {Array<ECS.Entity>} array of targeted bugs
     */
    getTargetBugs(bugs) {

        const closestBug = this.getClosestBug(bugs);
        return closestBug ? [closestBug] : [];

    }

    /**
     * eats the bug entity, setting state and playing tongue animation
     * @param {ECS.Entity} bug
     */
    eatBug(bug) {

        if (bug.eatenBy) {

            return;

        }

        // eat bug with animation
        this.state = 'eating';
        this.eatDuration = this.baseEatDuration;
        this.eatTimer = 0;
        if (this.eatingBug) {

            this.eatingBug.destroy();

        }

        bug.eatenBy = this.entity;

        this.eatingBug = bug;
        this.tongueTimer = 100;

        EventEmitter.events.trigger('frogEatBug', this.entity, bug);

    }

    /**
     * called when an inidividual bug is being attacked
     * @param {ECS.Entity} bug the bug being attacked
     * @param {int} i the index of the bug
     * @param {Array<ECS.Entity>} targets array of all targeted bugs
     */
    onAttack(bug, i, targets) {

        const bugComponent = bug.getComponent(BugComponent);
        this.tongueTipStart.set(bugComponent.sprite.position);
        this.tongueTip.position.set(this.tongueTipStart.x, this.tongueTipStart.y);
        this.tongueTimer = 200;

        bugComponent.damage(this.strength);

        if (bugComponent.healthComponent.health <= 0) {

            // eat bug with animation
            this.eatBug(bug);

        }

    }

    /**
     * called when an array of bugs is being attacked. either this or onAttack can be used.
     * @param {Array<ECS.Entity>} targets array of all targeted bugs
     */
    onAttackAll(targets) {

    }

    /**
     *
     * @param {ECS.Entity} bug
     * @returns {boolean}
     */
    isBugValidTarget(bug) {

        const bugComponent = bug.getComponent(BugComponent);

        // invalid if bug is being eaten by a frog
        if (bugComponent.eatenBy) {

            return false;

        }

        return true;

    }

    update(delta) {

        if (this.state === 'attacking') {

            if (this.attackTimer >= this.attackInterval) {

                const targets = this.getTargetBugs(this.bugs.filter((bug) => {

                    return !bug.destroyed && this.isBugValidTarget(bug);

                }));

                this.onAttackAll(targets);

                for (let i = 0; i < targets.length; i++) {

                    const bug = targets[i];

                    this.events.trigger('attack', bug, i, targets);

                    this.onAttack(bug, i, targets);

                }

                if (targets.length > 0) {

                    this.attackTimer -= this.attackInterval;

                }

            }

        } else if (this.state === 'eating') {

            // this is for making the bug follow the tongue tip
            if (this.eatingBug) {

                if (this.eatingBug.destroyed) {

                    this.eatingBug = undefined;

                } else {

                    const bugComponent = this.eatingBug.getComponent(BugComponent);
                    bugComponent.sprite.position.set(
                        this.tongueTip.position.x,
                        this.tongueTip.position.y
                    );

                    if (this.tongueTimer <= 0) {

                        this.eatingBug.destroy();
                        this.eatingBug = undefined;

                    }

                }

            }

            // this is for the actual duration of eating
            if (this.eatTimer >= this.eatDuration) {

                this.state = 'attacking';

            }

            this.eatTimer += delta;

        }

        // animates tongue to move. tongueTimer is how long it will stick out
        if (this.tongueTimer > 0) {

            this.tongueTip.visible = true;
            this.tongue.visible = true;

            this.tongue.position.set(this.sprite.position.x, this.sprite.position.y);

            const div = 1 - Math.min(1, this.tongueTimer / 200);
            const progress = div * div;

            const tongueTipCurrent = this.tongueTipStart.lerpv(this.sprite.position, progress);
            this.tongueTip.position.set(
                tongueTipCurrent.x, tongueTipCurrent.y
            );

            // angle of tongue
            const diff = new Vector2(this.tongueTip.position).sub(this.sprite.position);
            this.tongue.rotation = Math.atan2(diff.y, diff.x);

            // length of tongue
            this.tongue.width = diff.magnitude();

            this.tongueTimer -= delta;

        } else {

            this.tongueTip.visible = false;
            this.tongue.visible = false;

        }

        this.attackTimer = Math.min(this.attackInterval * 2, this.attackTimer + delta);

        if (this.label) {

            this.label.text = this.state;

        }

    }

    onDestroy() {

        this.events.clear();
        this.tongueTip.destroy();
        this.tongue.destroy();

    }

}

FrogComponent.register();

export { FrogComponent };
