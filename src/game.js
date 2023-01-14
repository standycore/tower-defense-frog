import { ECS, Entity } from '$/ecs';
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
import { PlagueFrogComponent } from './components/plagueFrog';
import { LilypadComponent } from './components/lilypad';

async function load() {

    await loadAssets();

}

/**
 * @typedef gridCell
 * @type {Object}
 * @property {float} x
 * @property {float} y
 * @property {Array<any>} stack
 * @property {Object} data
 */

/** @type {import('$/world').World} */
let world;
let pathArray;
let level;

/**
 * @typedef bugType
 * @type {Object}
 * @property {string} id
 * @property {float} health health of the bug
 * @property {float} speed speed the bug travels, in world units per second
 * @property {float} worth amount of money earned by eating bug
 * @property {string} assetSource asset name of the spritesheet
 * @property {new() => Component} component
*/

/** @type {Object<string, bugType} */
const bugTypes = {
    fly: {
        id: 'fly',
        health: 1,
        speed: 2,
        worth: 10,
        assetSource: 'flySheet',
        weight: 65
    },
    spider: {
        id: 'spider',
        health: 5,
        speed: 1,
        worth: 30,
        assetSource: 'spiderSheet',
        weight: 10
    },
    butterfly: {
        id: 'butterfly',
        health: 3,
        speed: 3,
        worth: 20,
        assetSource: 'butterflySheet',
        weight: 25
    }
};

/**
 * @typedef frogType
 * @type {Object}
 * @property {string} id
 * @property {string} name
 * @property {float} price
 * @property {boolean} unlocked
 * @property {string} assetSource
 * @property {float} attackInterval
 * @property {float} baseEatDuration
 * @property {float} strength
 * @property {float} range
 * @property {new() => Component} component
 * @property {Array<{x: float, y: float}>} cellOffsets
*/

/** @type {Object<string, frogType>} */
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
        component: PlagueFrogComponent,
        attackInterval: 500,
        baseEatDuration: 2000,
        strength: 0.25,
        range: 2
    }
};

/** @type {Array<Sprite>} */
let cellHighlights;

/** @type {float} */
let spawnTimer;
/** @type {float} */
let spawnInterval;

/** @type {Entity} */
let currentEntity;

let currentShopItemData;

/** @type {Graphics} */
let graphics;
/** @type {Graphics} */
let liveGraphics;
/** @type {float} */
let lives;
/** @type {float} */
let money;

/** @type {Array<Entity>} */
let bugs;
/** @type {Array<Entity>} */
let frogs;

/** @type {int} */
let spawnCount;
/** @type {Array<string>} */
let spawnArray;

/**
 * possible game states
 * @enum {int}
 */
const GameState = {
    NONE: 0,
    BREAK: 1,
    WAVE: 2
};

/**
 * the current state of the game
 * @type {GameState}
 */
let state;

/**
 * sets the game state to a new game state. doesnt change if the state is the same
 * @param {GameState} newState
 */
function setState(newState) {

    if (newState === state) {

        return;

    }

    state = newState;
    const stateName = Object.keys(GameState).find((key) => GameState[key] === state);
    EventEmitter.events.trigger('stateChanged', state, stateName);

}

/**
 * creates a frog based on the id
 * @param {string} id the type of frog
 * @returns {Entity} frog entity
 */
function createFrog(id) {

    if (!frogTypes[id]) {

        return;

    }

    const frog = ECS.createEntity();
    frog.addComponent(frogTypes[id].component || FrogComponent, world, bugs, frogTypes[id]);
    return frog;

}

/**
 * creates a bug based on the id
 * @param {string} id the type of bug
 * @returns {Entity} bug entity
 */
function createBug(id) {

    if (!bugTypes[id]) {

        return;

    }

    const bug = ECS.createEntity();
    bug.addComponent(BugComponent, world, pathArray, bugTypes[id]);
    return bug;

}

function createLilypad() {

    const lilypad = ECS.createEntity();
    lilypad.addComponent(LilypadComponent, world);
    return lilypad;

}

async function preUpdate() {

    console.log('preupdate');

    // create/get world and level data
    console.log('setting up world and level');

    // sets up global variables
    world = Global.world;
    pathArray = Global.level.pathArray;
    level = Global.level;

    // sets the lives and money variables
    lives = 25;
    money = 120;

    // variables to control  bug spawn
    spawnInterval = 1000;
    spawnTimer = 1000;
    spawnCount = 6;

    // entities arrays
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

    // generates new wave of bugs into spawnArray
    EventEmitter.events.on('generateWave', () => {

        let cumulativeWeight = 0;
        spawnArray = [];

        Object.entries(bugTypes).forEach(([id, bugType]) => {

            cumulativeWeight += bugType.weight;

        });

        Object.entries(bugTypes).forEach(([id, bugType]) => {

            const count = Math.floor(bugType.weight / cumulativeWeight * spawnCount);

            for (let i = 0; i < count; i++) {

                spawnArray.push(id);

            }

        });

    });

    // start the wave (if not started and if generated)
    EventEmitter.events.on('startWave', () => {

        setState(GameState.WAVE);

    });

    // lowers lives if a bug passes through
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

    EventEmitter.events.on('bugDied', (bug) => {

    });

    // adds money on bug eaten by frog
    EventEmitter.events.on('frogEatBug', (frog, bug) => {

        money += bug.getComponent(BugComponent).worth;
        EventEmitter.events.trigger('uiSetMoney', money);

    });

    // fill shop
    EventEmitter.events.on('shopReady', () => {

        console.log('setting up shop');

        const handleItemClick = (itemData) => {

            if (currentEntity) {

                currentEntity.destroy();
                currentEntity = undefined;

                if (currentShopItemData.id === itemData.id) {

                    currentShopItemData = undefined;
                    return;

                }

            }

            currentShopItemData = itemData;

            switch (itemData.id) {

                case 'lilypad':
                    currentEntity = createLilypad();
                    break;

                default:
                    currentEntity = createFrog(itemData.id);
                    break;

            }

            currentEntity.active = false;

        };

        EventEmitter.events.trigger('shopSetItem', {
            id: 'lilypad',
            name: 'Lilypad',
            price: 20,
            thumbnail: '',
            callback: handleItemClick,
            data: {
                cellFilter: (cell) => {

                    // if cell has a path on it, then it is not a valid cell
                    if (cell.path) {

                        return false;

                    }

                    // if cell is not water, invalid
                    if (cell.stack[0] !== 'w') {

                        return false;

                    }

                    // if cell already has lilypad, invalid
                    if (cell.stack.find((e) => {

                        return e instanceof Entity && e.getComponent(LilypadComponent);

                    })) {

                        return false;

                    }

                    return true;

                }
            }
        });

        Object.entries(frogTypes).forEach(([id, { name, price, thumbnail, cellOffsets, cellFilter }]) => {

            EventEmitter.events.trigger('shopSetItem', {
                id,
                name,
                price,
                thumbnail,
                callback: handleItemClick,
                data: {
                    cellOffsets,
                    cellFilter: cellFilter || ((cell) => {

                        // if cell has a path on it, then it is not a valid cell
                        if (cell.path) {

                            return false;

                        }

                        // if cell is water
                        if (cell.stack[0] === 'w') {

                            // if cell doesnt have lilypad, invalid
                            if (!cell.stack[1] || !cell.stack[1].getComponent(LilypadComponent)) {

                                return false;

                            }

                        }

                        // if cell has a frog on it, then it is not a valid cell
                        if (cell.stack.find((e) => {

                            return e instanceof Entity && e.getComponent(FrogComponent);

                        })) {

                            return false;

                        }

                        return true;

                    })
                }
            });

        });

    });

    // setup actions when different states are set
    EventEmitter.events.on('stateChanged', (state, stateName) => {

        console.log('state changed to', state, stateName);

        if (state === GameState.BREAK) {

            // generate wave
            EventEmitter.events.trigger('generateWave');

            EventEmitter.events.trigger('uiWaveSetVisible', true);

        } else if (state === GameState.WAVE) {

            EventEmitter.events.trigger('uiWaveSetVisible', false);

        }

    });

    // set the initial game state
    setState(GameState.NONE);

    EventEmitter.events.on('uiWaveReady', () => {

        setState(GameState.BREAK);

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

    if (currentEntity && !currentEntity.destroyed) {

        // const frogWorldComponent = currentFrog.getComponent(WorldComponent);
        // const frogCanvasPosition = world.worldToCanvasPosition(frogWorldComponent.position);

        const worldComponent = currentEntity.getComponent(WorldComponent);
        const canvasPosition = world.worldToCanvasPosition(worldComponent.position);

        // converts canvas position to world position
        const mouseWorldPosition = world.canvasToWorldPosition(Input.canvasMousePosition);

        // snaps world position by rounding it
        const snappedWorldPosition = new Vector2(Math.round(mouseWorldPosition.x), Math.round(mouseWorldPosition.y));

        // set the floating frogs position to the snapped position
        worldComponent.position.set(snappedWorldPosition.x, snappedWorldPosition.y);

        // defines a boolean validCell starting with true, and is invalidated with the following conditions
        let validCells = true;

        if (money < currentShopItemData.price) {

            validCells = false;

        }

        const cellOffsets = currentShopItemData.data.cellOffsets || [{ x: 0, y: 0 }];

        // gets the level's grid's cell from the snapped position
        /** @type {Array<gridCell>} */
        const cells = cellOffsets.map(({ x: ox, y: oy }) => {

            return level.grid.get(snappedWorldPosition.x + ox, snappedWorldPosition.y + oy);

        });

        // only check cells if validcells is initially true
        if (validCells) {

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

                    if (currentShopItemData.data.cellFilter) {

                        if (!currentShopItemData.data.cellFilter(cell)) {

                            validCell = false;

                        }

                    }

                }

                if (!validCell) {

                    cellHighlight.tint = 0xFF4444;
                    validCells = false;

                } else {

                    cellHighlight.tint = 0xFFFFFF;

                }

            }

        }

        // frog related things only so, check for frog component
        const frogComponent = currentEntity.getComponent(FrogComponent);

        if (frogComponent) {

            // sets the circle color of the moving circle based on whether it is a valid cell or not
            // valid cell? GREEN otherwise: RED
            const circleColor = validCells ? 0x44FF44 : 0xFF4444;

            liveGraphics.beginFill(circleColor, 0.2);
            liveGraphics.drawCircle(
                canvasPosition.x,
                canvasPosition.y,
                frogComponent.range * world.cellSize.y);
            liveGraphics.endFill();

        }

        // when clicked, only if the cell is valid will the frog be placed
        if (Input.justClicked() && validCells) {

            // this allows it to start updating
            currentEntity.active = true;

            // check again if frog
            if (frogComponent) {

                // pushes the currentFrog to the entities array
                frogs.push(currentEntity);

                // draws a "permanent" light black circle around the frog indicating its bug eating range
                // if the frog is a plague frog, draws a purple circle instead indicating the poison range
                if (currentEntity.getComponent(PlagueFrogComponent)) {

                    graphics.beginFill(0xFF00FF, 0.1);

                } else {

                    graphics.beginFill(0x000000, 0.1);

                }

                graphics.drawCircle(canvasPosition.x,
                    canvasPosition.y,
                    frogComponent.range * world.cellSize.y);
                graphics.endFill();

            }

            // stores the entity in the cell to be accessed and checked against via positions
            for (const cell of cells) {

                cell.stack.push(currentEntity);

            }

            money -= currentShopItemData.price;
            EventEmitter.events.trigger('uiSetMoney', money);

            // make currentFrog null to clear the mouse selection
            currentEntity = null;
            currentShopItemData = undefined;

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

    if (state === GameState.WAVE) {

        // Spawns bugs from spawnArray
        if (spawnTimer >= spawnInterval) {

            spawnTimer -= spawnInterval;

            if (spawnArray && spawnArray.length > 0) {

                const bug = createBug(spawnArray.shift());
                bugs.push(bug);

            }

        }

        spawnTimer += delta;

        if (spawnArray.length === 0 && bugs.length === 0) {

            // end wave
            setState(GameState.BREAK);
            spawnCount += 8;
            EventEmitter.events.trigger('uiSetMoney', money += 60);

        }

    } else {

        spawnTimer = 0;

    }

}

const Game = {
    load,
    preUpdate,
    update
};

export { Game };
