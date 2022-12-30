import { ECS } from '$/ecs';
import { EventEmitter } from '$/events';
import { Vector2 } from '$/vector';
import { Graphics } from 'pixi.js';
import { loadAssets } from './assets';
import { FrogComponent } from './components/frog';
import { HealthComponent } from './components/health';
import { WorldComponent } from './components/world';
import { Bug } from './entities/bug';
import { Frog } from './entities/frog';
import { Global } from './global';

async function load() {

    await loadAssets();

}

const entities = [];
let world;
let pathArray;
let spawnPoint;
let currentFrog;
let graphics;
const g = new Graphics();

async function preUpdate() {

    console.log('preupdate');

    // create/get world and level data
    console.log('setting up world and level');
    world = Global.world;
    pathArray = Global.level.pathArray;
    spawnPoint = pathArray[0];
    graphics = new Graphics();
    world.addChild(graphics);

    // Event that controlls the frog eat action
    EventEmitter.events.on('frogEatBug', (frog) => {

        // loops through the entire path array and the entities array, checks to make sure the entity is a bug, then compares the
        // x and y coordinates. if the coordinates match the furthest tile, the frog will attempt to eat the fly.
        for (let i = pathArray.length - 1; i >= 0; i--) {

            for (let j = 0; j < entities.length; j++) {

                if (entities[j] instanceof Bug) {

                    if (pathArray[i].x === Math.round(entities[j].getComponent(WorldComponent).position.x) &&
                    pathArray[i].y === Math.round(entities[j].getComponent(WorldComponent).position.y)) {

                        if (Vector2.distanceBetweenVectors(entities[j].getComponent(WorldComponent).position,
                            frog.getComponent(WorldComponent).position) <= frog.getComponent(FrogComponent).range) {

                            entities[j].getComponent(HealthComponent).health -= frog.getComponent(FrogComponent).strength;

                            graphics.lineTo(entities[j].getComponent(HealthComponent).x, entities[j].getComponent(HealthComponent).y);
                            console.log(entities[j].getComponent(HealthComponent).health);
                            return;

                        }

                    }

                }

            }

        }

    });

    // fill shop
    EventEmitter.events.on('shopReady', () => {

        console.log('setting up shop');
        EventEmitter.events.trigger('shopSetItem', {
            id: 'coolfrog',
            name: 'The super cool frog',
            price: 100,
            callback: async (itemData) => {

                const frog = new Frog(world, 'frog');
                currentFrog = frog;

                const handleClick = () => {

                    // console.log(currentFrog);
                    if (currentFrog) {

                        entities.push(currentFrog);
                        currentFrog = null;
                        window.removeEventListener('click', handleClick);

                        g.clear();
                        graphics.beginFill(0x000000, 0.1);
                        graphics.drawCircle(frog.getComponent(WorldComponent).position.x * world.cellSize.x,
                            frog.getComponent(WorldComponent).position.y * world.cellSize.y,
                            frog.getComponent(FrogComponent).range * world.cellSize.y);
                        graphics.endFill();

                    }

                };

                await new Promise((resolve) => {

                    setTimeout(resolve, 0);

                });

                window.addEventListener('click', handleClick);

            }
        });

        EventEmitter.events.trigger('shopSetItem', {
            id: 'sexyfrog',
            name: 'The super sexy frog',
            price: 120,
            callback: async (itemData) => {

                const frog = new Frog(world, 'fast-frog');
                currentFrog = frog;

                const handleClick = () => {

                    console.log(currentFrog);
                    if (currentFrog) {

                        entities.push(currentFrog);
                        currentFrog = null;
                        window.removeEventListener('click', handleClick);

                        // sets up the range of the frog
                        g.clear();
                        graphics.beginFill(0x000000, 0.1);
                        graphics.drawCircle(frog.getComponent(WorldComponent).position.x * world.cellSize.x,
                            frog.getComponent(WorldComponent).position.y * world.cellSize.y,
                            frog.getComponent(FrogComponent).range * world.cellSize.y);
                        graphics.endFill();

                    }

                };

                await new Promise((resolve) => {

                    setTimeout(resolve, 0);

                });

                window.addEventListener('click', handleClick);

            }

        });

    });

}

const bugType = ['fly', 'spider', 'butterfly'];

let spawnTimer = 5000;

function update(delta, time) {

    world.addChild(g);

    if (currentFrog) {

        // sets up the range of the frog
        g.clear();
        g.beginFill(0x000000, 0.1);
        g.drawCircle(currentFrog.getComponent(WorldComponent).position.x * world.cellSize.x,
            currentFrog.getComponent(WorldComponent).position.y * world.cellSize.y,
            currentFrog.getComponent(FrogComponent).range * world.cellSize.y);
        g.endFill();

        currentFrog.getComponent(WorldComponent).position.set(Math.round((Global.canvasMousePosition.x - Global.app.view.width / 2) / world.cellSize.x), Math.round((Global.canvasMousePosition.y - Global.app.view.height / 2) / world.cellSize.y));

    }

    for (let i = 0; i < entities.length; i++) {

        const entity = entities[i];
        if (entity.destroyed) {

            entities.splice(i, 1);

        } else {

            ECS.updateEntity(entity, delta, time);

        }

    }

    // timer to spawn bugs
    if (spawnTimer >= 2500) {

        spawnTimer -= 2500;

        const bug = new Bug(world, bugType[Math.floor(Math.random() * bugType.length)], pathArray);

        entities.push(bug);

        bug.getComponent(WorldComponent).position.set(spawnPoint.x, spawnPoint.y);

    }

    spawnTimer += delta;

}

const Game = {
    load,
    preUpdate,
    update
};

export { Game };
