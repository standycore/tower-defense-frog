import { ECS } from '$/ecs';
import { EventEmitter } from '$/events';
import { Vector2 } from '$/vector';
import { Graphics, RenderTexture, Sprite } from 'pixi.js';
import { loadAssets } from './assets';
import { FrogComponent } from './components/frog';
import { HealthComponent } from './components/health';
import { WorldComponent } from './components/world';
import { PathFollowerComponent } from './components/pathFollower';
import { Bug } from './entities/bug';
import { Frog } from './entities/frog';
import { Global } from './global';
import { Input } from './input';

async function load() {

    await loadAssets();

}

const entities = [];
let world;
let pathArray;
let level;
let spawnPoint;
let currentFrog;
let currentPrice;
let graphics;
let liveGraphics;
let lives;
let money;

async function preUpdate() {

    console.log('preupdate');

    // create/get world and level data
    console.log('setting up world and level');

    // sets up global variables
    world = Global.world;
    pathArray = Global.level.pathArray;
    level = Global.level;
    lives = 25;
    money = 100;
    spawnPoint = pathArray[0];

    // sets up graphics
    graphics = new Graphics();
    liveGraphics = new Graphics();

    // adds all the graphics to the world
    world.addChild(graphics);
    world.addChild(liveGraphics);

    // here i am testing using a sprite as a circle
    // it draws a circle using graphics then renders it onto a texture
    // the texture is used to create a sprite, which is then added to the world
    // change the condition below to true to see it
    // eslint-disable-next-line no-constant-condition
    if (false) {

        graphics.beginFill(0xFFFFFF, 1);
        graphics.drawCircle(50, 50, 50);

        // render texture created
        const renderTexture = RenderTexture.create({ width: 100, height: 100 });

        // render graphics to render texture
        Global.app.renderer.render(graphics, { renderTexture });

        // create sprite and set anchor/origin to .5
        const sprite = Sprite.from(renderTexture);
        sprite.anchor.set(0.5);

        // add to world
        world.addChild(sprite);

        // wow did you know, sprites also have an alpha property, which lets them be semi transparent
        sprite.alpha = 0.5;

        graphics.clear();

    }

    // Event that controlls the frog eat action
    EventEmitter.events.on('frogEatBug', (frog) => {

        // finds the closest bug to the frog and is furthest on the path and is in range of frog
        let closestBug;
        let furthestPath = 0;
        for (let i = 0; i < Bug.array.length; i++) {

            const bug = Bug.array[i];

            if (bug.destroyed) {

                continue;

            }

            const distance = Vector2.distanceBetweenVectors(bug.getComponent(WorldComponent).position, frog.getComponent(WorldComponent).position);
            const index = bug.getComponent(PathFollowerComponent).index;
            if (distance <= frog.getComponent(FrogComponent).range && (!closestBug || (index > furthestPath))) {

                furthestPath = index;
                closestBug = bug;

            }

        }

        if (closestBug) {

            closestBug.getComponent(HealthComponent).health -= frog.getComponent(FrogComponent).strength;

        }

    });

    EventEmitter.events.on('pathReachEnd', (bug) => {

        lives -= bug.getComponent(HealthComponent).health;
        EventEmitter.events.trigger('uiSetLives', lives);

        bug.destroy();

    });

    // set lives in ui
    EventEmitter.events.on('uiLivesReady', () => {

        console.log('setting up lives');
        EventEmitter.events.trigger('uiSetLives', lives);

    });

    // set money in ui
    EventEmitter.events.on('uiMoneyReady', () => {

        console.log('setting up money');
        EventEmitter.events.trigger('uiSetMoney', money);

    });

    // adds money on bug death
    EventEmitter.events.on('bugDied', (bug) => {

        money += bug.worth;
        EventEmitter.events.trigger('uiSetMoney', money);

    });

    // fill shop
    EventEmitter.events.on('shopReady', () => {

        console.log('setting up shop');
        EventEmitter.events.trigger('shopSetItem', {
            id: 'frog',
            name: 'Froggy',
            price: 100,
            callback: (itemData) => {

                if (currentFrog) {

                    currentFrog.destroy();
                    const type = currentFrog.type;
                    currentFrog = null;

                    if (type === itemData.id) {

                        return;

                    }

                }

                const frog = new Frog(world, itemData.id);
                currentFrog = frog;
                currentPrice = itemData.price;

            }
        });

        EventEmitter.events.trigger('shopSetItem', {
            id: 'fast-frog',
            name: 'Fast Froggy',
            price: 120,
            callback: (itemData) => {

                if (currentFrog) {

                    currentFrog.destroy();
                    const type = currentFrog.type;
                    currentFrog = null;

                    if (type === itemData.id) {

                        return;

                    }

                }

                const frog = new Frog(world, itemData.id);
                currentFrog = frog;
                currentPrice = itemData.price;

            }

        });

    });

}

const bugType = ['fly', 'spider', 'butterfly'];

let spawnTimer = 5000;

function update(delta, time) {

    // clears the live graphics to be updated below
    // must be cleared every frame so previous frame's drawings dont stick
    liveGraphics.clear();

    if (currentFrog && !currentFrog.destroyed) {

        const frogComponent = currentFrog.getComponent(FrogComponent);
        const frogWorldComponent = currentFrog.getComponent(WorldComponent);
        const frogCanvasPosition = world.worldToCanvasPosition(frogWorldComponent.position);

        // converts canvas position to world position
        const mouseWorldPosition = world.canvasToWorldPosition(Input.canvasMousePosition);

        // snaps world position by rounding it
        const snappedWorldPosition = new Vector2(Math.round(mouseWorldPosition.x), Math.round(mouseWorldPosition.y));

        // set the floating frogs position to the snapped position
        frogWorldComponent.position.set(snappedWorldPosition.x, snappedWorldPosition.y);

        // gets the level's grid's cell from the snapped position
        const cell = level.grid.get(snappedWorldPosition.x, snappedWorldPosition.y);

        // defines a boolean validCell starting with true, and is invalidated with the following conditions
        let validCell = true;

        // if there is no cell, then it is not a valid cell
        if (!cell) {

            validCell = false;

        } else {

            // if cell has a path on it, then it is not a valid cell
            if (cell.path) {

                validCell = false;

            }

            // if cell has a frog on it, then it is not a valid cell
            if (cell.frog) {

                validCell = false;

            }

            if (money < currentPrice) {

                validCell = false;

            }

        }

        // sets the circle color of the moving circle based on whether it is a valid cell or not
        // valid cell? GREEN otherwise: RED
        const circleColor = validCell ? 0x44FF44 : 0xFF4444;

        liveGraphics.beginFill(circleColor, 0.2);
        liveGraphics.drawCircle(
            frogCanvasPosition.x,
            frogCanvasPosition.y,
            frogComponent.range * world.cellSize.y);
        liveGraphics.endFill();

        // when clicked, only if the cell is valid will the frog be placed
        if (Input.justClicked() && validCell) {

            // pushes the currentFrog to the entities array
            // this allows it to start updating
            entities.push(currentFrog);

            // draws a "permanent" light black circle around the frog indicating its bug eating range
            graphics.beginFill(0x000000, 0.1);
            graphics.drawCircle(frogCanvasPosition.x,
                frogCanvasPosition.y,
                frogComponent.range * world.cellSize.y);
            graphics.endFill();

            // stores the frog in the cell to be accessed and checked against via positions
            cell.frog = currentFrog;

            // make currentFrog null to clear the mouse selection
            currentFrog = null;

            money -= currentPrice;
            EventEmitter.events.trigger('uiSetMoney', money);

        }

    }

    // updates all entities in the entities array and removes them from the array if they are destroyed every frame
    for (let i = 0; i < entities.length; i++) {

        const entity = entities[i];
        if (entity.destroyed) {

            entities.splice(i, 1);
            i -= 1;

        } else {

            ECS.updateEntity(entity, delta, time);

        }

    }

    // removes bugs from the bugs array when they are destroyed
    // this might be changed to a better way in the future
    for (let i = 0; i < Bug.array.length; i++) {

        const bug = Bug.array[i];
        if (bug.destroyed) {

            Bug.array.splice(i, 1);
            i -= 1;

        }

    }

    // timer to spawn bugs
    if (spawnTimer >= 2500) {

        spawnTimer -= 2500;

        const randomIndex = Math.floor(Math.random() * bugType.length);
        const bug = new Bug(world, bugType[randomIndex], pathArray);

        entities.push(bug);

        bug.getComponent(WorldComponent).position.set(spawnPoint.x, spawnPoint.y);

    }

    spawnTimer += delta;

    // frog targeting debug

    // sets line style to draw red lines
    // this is for the debugging of frogs to see which bug they are targeting (below)
    liveGraphics.lineStyle(2, 0xFF0000, 1);

    entities.forEach((entity) => {

        if (entity instanceof Frog) {

            const frog = entity;

            let closestBug;
            let furthestPath = 0;
            for (let i = 0; i < Bug.array.length; i++) {

                const bug = Bug.array[i];

                const distance = Vector2.distanceBetweenVectors(bug.getComponent(WorldComponent).position, frog.getComponent(WorldComponent).position);
                const index = bug.getComponent(PathFollowerComponent).index;
                if (distance <= frog.getComponent(FrogComponent).range && (!closestBug || (index > furthestPath))) {

                    furthestPath = index;
                    closestBug = bug;

                }

            }

            if (!closestBug) {

                return;

            }

            const a = world.worldToCanvasPosition(frog.getComponent(WorldComponent).position);
            liveGraphics.moveTo(a.x, a.y);

            const b = world.worldToCanvasPosition(closestBug.getComponent(WorldComponent).position);
            liveGraphics.lineTo(b.x, b.y);

        }

    });

}

const Game = {
    load,
    preUpdate,
    update
};

export { Game };
