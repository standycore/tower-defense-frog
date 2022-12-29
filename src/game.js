import { ECS } from '$/ecs';
import { EventEmitter } from '$/events';
import { loadAssets } from './assets';
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

async function preUpdate() {

    console.log('preupdate');

    // create/get world and level data
    console.log('setting up world and level');
    world = Global.world;
    pathArray = Global.level.pathArray;
    spawnPoint = pathArray[0];

    EventEmitter.events.on('frogEatBug', (strength) => {

        // entities[0].getComponent(HealthComponent).health -= strength;
        // console.log(entities[0].getComponent(HealthComponent).health);

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

                    console.log(currentFrog);
                    if (currentFrog) {

                        entities.push(currentFrog);
                        currentFrog = null;
                        window.removeEventListener('click', handleClick);

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

                const frog = new Frog(world, 'frog');
                currentFrog = frog;

                const handleClick = () => {

                    console.log(currentFrog);
                    if (currentFrog) {

                        entities.push(currentFrog);
                        currentFrog = null;
                        window.removeEventListener('click', handleClick);

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

    if (currentFrog) {

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
    if (spawnTimer >= 5000) {

        spawnTimer -= 5000;

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
