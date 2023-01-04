import { ECS } from '$/ecs';
import { EventEmitter } from '$/events';
import { Vector2 } from '$/vector';
import { Assets, Graphics, Sprite } from 'pixi.js';
import { loadAssets } from './assets';
import { FrogComponent } from './components/frog';
import { HealthComponent } from './components/health';
import { WorldComponent } from './components/world';
import { PathFollowerComponent } from './components/pathFollower';
import { Global } from './global';
import { Input } from './input';
import { BugComponent } from './components/bug';

async function load() {

    await loadAssets();

}

/** @type {import('$/world').World} */
let world;
let pathArray;
let level;

const bugTypes = {
    fly: {
        health: 1,
        speed: 2,
        worth: 10,
        assetSource: 'flySheet'
    },
    spider: {
        health: 5,
        speed: 1,
        worth: 30,
        assetSource: 'spiderSheet'
    },
    butterfly: {
        health: 3,
        speed: 3,
        worth: 20,
        assetSource: 'butterflySheet'
    }
};

const frogTypes = {
    frog: {
        id: 'frog',
        name: 'Froggy',
        price: 100,
        assetSource: 'frogSheet',
        attackInterval: 1000,
        baseEatDuration: 2000, // how long it takes to chew food
        // cellOffsets: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
        strength: 1,
        range: 4
    },
    'fast-frog': {
        id: 'fast-frog',
        name: 'Fast Froggy',
        price: 120,
        assetSource: 'fastFrogSheet',
        attackInterval: 600,
        baseEatDuration: 2000,
        strength: 0.75,
        range: 3
    },
    'plague-frog': {
        id: 'plague-frog',
        name: 'Plague Froggy',
        price: 140,
        assetSource: 'plagueFrogSheet',
        attackInterval: 500,
        baseEatDuration: 2000,
        strength: 0.25,
        range: 2
    }
};

/** @type {Array<Sprite>} */
let cellHighlights;

let spawnTimer;
let spawnInterval;

let currentFrog;
let currentPrice;

let graphics;
let liveGraphics;
let lives;
let money;

let bugCount;
let bugs;
let frogs;

/**
 * creates a frog based on the id
 * @param {string} id the type of frog
 * @returns {ECS.Entity} frog entity
 */
function createFrog(id) {

    if (!frogTypes[id]) {

        return;

    }

    const frog = ECS.createEntity();
    frog.addComponent(FrogComponent, world, bugs, frogTypes[id]);
    return frog;

}

/**
 * creates a bug based on the id
 * @param {string} id the type of bug
 * @returns {ECS.Entity} bug entity
 */
function createBug(id) {

    if (!bugTypes[id]) {

        return;

    }

    const bug = ECS.createEntity();
    bug.addComponent(BugComponent, world, pathArray, bugTypes[id]);
    return bug;

}

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
    spawnInterval = 2500;
    spawnTimer = 2500;
    bugCount = 6;
    bugs = [];
    frogs = [];

    // sets up graphics
    graphics = new Graphics();
    liveGraphics = new Graphics();
    cellHighlights = [];

    // adds all the graphics to the world
    world.addChild(graphics);
    world.addChild(liveGraphics);

    // Event that controlls the frog eat action
    EventEmitter.events.on('frogEatBug', (frog) => {

        // finds the closest bug to the frog and is furthest on the path and is in range of frog
        let closestBug;
        let furthestPath = 0;
        for (let i = 0; i < bugs.length; i++) {

            const bug = bugs[i];

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

    EventEmitter.events.on('bugReachedEnd', (bug) => {

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

        money += bug.getComponent(BugComponent).worth;
        EventEmitter.events.trigger('uiSetMoney', money);

    });

    // fill shop
    EventEmitter.events.on('shopReady', () => {

        console.log('setting up shop');

        const handleClick = (itemData) => {

            if (currentFrog) {

                const id = currentFrog.getComponent(FrogComponent).id;
                currentFrog.destroy();
                currentFrog = null;

                if (id === itemData.id) {

                    return;

                }

            }

            const frog = createFrog(itemData.id);// new Frog(world, itemData.id);
            frog.active = false;
            currentFrog = frog;
            currentPrice = itemData.price;

        };

        Object.entries(frogTypes).forEach(([id, { name, price }]) => {

            EventEmitter.events.trigger('shopSetItem', {
                id,
                name,
                price,
                callback: handleClick
            });

        });

    });

}

function update(delta, time) {

    if (lives <= 0) {

        return;

    }

    // clears the live graphics to be updated below
    // must be cleared every frame so previous frame's drawings dont stick
    liveGraphics.clear();

    cellHighlights.forEach((sprite) => {

        sprite.visible = false;

    });

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

        // defines a boolean validCell starting with true, and is invalidated with the following conditions
        let validCells = true;

        const cellOffsets = frogTypes[frogComponent.id].cellOffsets || [{ x: 0, y: 0 }];

        // gets the level's grid's cell from the snapped position
        const cells = cellOffsets.map(({ x: ox, y: oy }) => {

            return level.grid.get(snappedWorldPosition.x + ox, snappedWorldPosition.y + oy);

        });

        for (let i = 0; i < cellOffsets.length; i++) {

            const cellOffset = cellOffsets[i];
            const cellPosition = { x: snappedWorldPosition.x + cellOffset.x, y: snappedWorldPosition.y + cellOffset.y };
            const cell = cells[i];

            if (i > cellHighlights.length - 1) {

                const cellHighlight = new Sprite(Assets.get('cellHighlight'));
                cellHighlight.width = world.cellSize.x;
                cellHighlight.height = world.cellSize.y;
                cellHighlight.anchor.set(0.5);
                cellHighlights.push(cellHighlight);
                world.addChild(cellHighlight);

            }

            const cellHighlight = cellHighlights[i];
            cellHighlight.visible = true;

            const cellCanvasPosition = world.worldToCanvasPosition(cellPosition.x, cellPosition.y);
            cellHighlight.position.set(cellCanvasPosition.x, cellCanvasPosition.y);

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

            if (!validCell) {

                cellHighlight.tint = 0xFF4444;
                validCells = false;

            } else {

                cellHighlight.tint = 0xFFFFFF;

            }

        }

        // sets the circle color of the moving circle based on whether it is a valid cell or not
        // valid cell? GREEN otherwise: RED
        const circleColor = validCells ? 0x44FF44 : 0xFF4444;

        liveGraphics.beginFill(circleColor, 0.2);
        liveGraphics.drawCircle(
            frogCanvasPosition.x,
            frogCanvasPosition.y,
            frogComponent.range * world.cellSize.y);
        liveGraphics.endFill();

        // when clicked, only if the cell is valid will the frog be placed
        if (Input.justClicked() && validCells) {

            // pushes the currentFrog to the entities array
            frogs.push(currentFrog);

            // this allows it to start updating
            currentFrog.active = true;

            // draws a "permanent" light black circle around the frog indicating its bug eating range
            graphics.beginFill(0x000000, 0.1);
            graphics.drawCircle(frogCanvasPosition.x,
                frogCanvasPosition.y,
                frogComponent.range * world.cellSize.y);
            graphics.endFill();

            // stores the frog in the cell to be accessed and checked against via positions
            for (const cell of cells) {

                cell.frog = currentFrog;

            }

            // make currentFrog null to clear the mouse selection
            currentFrog = null;

            money -= currentPrice;
            EventEmitter.events.trigger('uiSetMoney', money);

        }

    }

    // updates all entities in the entities array and removes them from the array if they are destroyed every frame
    ECS.update(delta, time);

    // removes bugs from the bugs array when they are destroyed
    // this might be changed to a better way in the future
    for (let i = 0; i < bugs.length; i++) {

        const bug = bugs[i];
        if (bug.destroyed) {

            bugs.splice(i, 1);
            i -= 1;

        }

    }

    // timer to spawn bugs
    if (spawnTimer >= spawnInterval) {

        console.log(spawnInterval);
        console.log(bugCount);
        spawnTimer -= spawnInterval;

        const bugTypeIds = Object.keys(bugTypes);
        const randomIndex = Math.floor(Math.random() * bugTypeIds.length);
        const bug = createBug(bugTypeIds[randomIndex]);

        bugs.push(bug);

        if (bugCount <= 0 && spawnInterval > 250) {

            spawnInterval -= 50;
            bugCount = 6;

        }

        if (bugCount > 0) {

            bugCount -= 1;

        }

    }

    spawnTimer += delta;

    // frog targeting debug

    // sets line style to draw red lines
    // this is for the debugging of frogs to see which bug they are targeting (below)
    // liveGraphics.lineStyle(2, 0xFF0000, 1);

    // frogs.forEach((frog) => {

    //     const closestBug = frog.getComponent(FrogComponent).getClosestBug(bugs);

    //     if (!closestBug) {

    //         return;

    //     }

    //     const a = world.worldToCanvasPosition(frog.getComponent(WorldComponent).position);
    //     liveGraphics.moveTo(a.x, a.y);

    //     const b = world.worldToCanvasPosition(closestBug.getComponent(WorldComponent).position);
    //     liveGraphics.lineTo(b.x, b.y);

    // });

}

const Game = {
    load,
    preUpdate,
    update
};

export { Game };
