/* eslint-disable quote-props */
import './style.css';

import { World } from '$/world';

import { Application, Assets, Graphics, Sprite } from 'pixi.js';
import { Stage, Layer } from '@pixi/layers';
import { GroupMap } from '$/groupMap';
import { FixedEngine } from '$/engine';

import './src/settings';
import { Game } from './src/game';
import { generateLevel } from './src/level';
import { getTextureArrayFromTag } from '$/util';
import { Global } from 'src/global';

import ReactDOM from 'react-dom/client';
import ReactRoot from 'src/ui/root';
import { Input } from 'src/input';

async function main() {

    // The application will create a renderer using WebGL, if possible,
    // with a fallback to a canvas render. It will also setup the ticker
    // and the root stage PIXI.Container
    const app = new Application({ resizeTo: window });

    Global.app = app;

    // The application will create a canvas element for you that you
    // can then insert into the DOM
    document.querySelector('.canvas-container').appendChild(app.view);

    // replace the app stage with a custom stage from @pixi/layers
    app.stage = new Stage();

    // sorts layers (probably optional)
    app.stage.sortableChildren = true;

    // gets the global groupMap, which maps the name of a group to a group object
    // the group is created in the group map
    // this is part of @pixi/layers
    const groupMap = GroupMap.groupMap;
    groupMap.create('default', 0, (object) => {

        object.zOrder = -object.y;

    });
    groupMap.create('hover', 1, (object) => {

        object.zOrder = -object.y;

    });
    groupMap.create('debug', 2);

    // creates a layer for each group, and adds the layer to the stage
    // this is necessary for objects using the group render method to be visible
    groupMap.forEach((group) => {

        app.stage.addChild(new Layer(group));

    });

    Global.groupMap = groupMap;

    // creates a new World, which extends PIXI.Container
    // this is where game related objects should be added
    const world = new World(app);

    // sets the cell size of the world
    world.cellSize.set(50, 50);

    // add the world to the stage to be rendered
    app.stage.addChild(world);

    const engine = new FixedEngine();
    engine.start();

    Input.initialize(app.view);

    const pathGraphics = new Graphics();
    // world.addChild(pathGraphics);

    const waterGraphics = new Graphics();
    waterGraphics.beginFill(0x2233DD);
    waterGraphics.drawRect(-400, -400, 800, 800);
    waterGraphics.endFill();
    world.addChild(waterGraphics);

    // console.log(pathSheet);
    await Game.load();

    let level;
    let generating = false;
    let toDestroy = [];
    async function handleGenerateLevel() {

        if (generating) {

            return;

        }

        toDestroy.forEach((sprite) => {

            sprite.destroy();

        });
        toDestroy = [];

        generating = true;
        level = await generateLevel(world, pathGraphics);

        // const renderTexture = RenderTexture.create({ width: (maxX - minX + 1) * world.cellSize.x, height: (maxY - minY + 1) * world.cellSize.y });
        // if (levelContainer) {
        //     levelContainer.destroy();
        // }
        // const levelContainer = new Container();
        const worldSheet = Assets.get('worldSheet');

        const groundTextures = getTextureArrayFromTag(worldSheet, 'dirt');

        const pathTextures = getTextureArrayFromTag(worldSheet, 'stones');

        const groundIndexMap = {
            '11111111': 0,
            '00000000': 1,
            '11111110': 2,
            '11111011': 3,
            '01111111': 4,
            '11011111': 5,
            '11010000': 6,
            '01101000': 7,
            '00001011': 8,
            '00010110': 9,
            '01101011': 10,
            '11010110': 11,
            '11111000': 12,
            '00011111': 13,
            '00001000': 14,
            '00010000': 15,
            '01000000': 16,
            '00000010': 17,
            '00011000': 18,
            '01000010': 19,
            '1111': 0
        };

        Object.entries(groundIndexMap).forEach(([key, value]) => {

            key = key[1] + key[3] + key[4] + key[6];
            if (groundIndexMap[key] === undefined) {

                groundIndexMap[key] = value;

            }

        });

        // fill background under path
        level.grid.forEach((value, x, y) => {

            if (value.background !== 'l' && value.background !== 'c') {

                return;

            }

            let key = '';
            let backKey = '';

            for (let oy = -1; oy <= 1; oy++) {

                for (let ox = -1; ox <= 1; ox++) {

                    // skip center
                    if (ox === 0 && ox === oy) {

                        continue;

                    }

                    // diagonal check
                    let diagonal = false;
                    if (Math.abs(ox) === Math.abs(oy)) {

                        diagonal = true;

                    }

                    const adjCellValue = level.grid.get(x + ox, y + oy)?.background || 'w';

                    if (adjCellValue === 'l' || adjCellValue === 'c') {

                        key += '1';
                        if (!diagonal) {

                            backKey += '1';

                        }

                    } else {

                        key += '0';
                        if (!diagonal) {

                            backKey += '0';

                        }

                    }

                }

            }

            // console.log('ground at', x, y, value, key);

            const index = groundIndexMap[key] || groundIndexMap[backKey] || groundIndexMap['11111111'];

            const sprite = Sprite.from(groundTextures[index]);
            sprite.position.x = (x * world.cellSize.x);
            sprite.position.y = (y * world.cellSize.y);
            sprite.anchor.set(0.5);
            sprite.width = world.cellSize.x;
            sprite.height = world.cellSize.y;

            toDestroy.push(sprite);

            world.addChild(sprite);

        });

        level.path.forEach((value, x, y) => {

            const sprite = Sprite.from(pathTextures[Math.floor(Math.random() * pathTextures.length)]);
            // sprite.position.x = ((point.x - minX) * world.cellSize.x);
            // sprite.position.y = ((point.y - minY) * world.cellSize.y);
            sprite.position.x = (x * world.cellSize.x);
            sprite.position.y = (y * world.cellSize.y);
            sprite.anchor.set(0.5);
            sprite.width = world.cellSize.x;
            sprite.height = world.cellSize.y;

            toDestroy.push(sprite);

            world.addChild(sprite);

        });

        /** @type {Object} */
        Global.level = level;
        /** @type {World} */
        Global.world = world;

        // path.clear();

        // app.renderer.render(levelContainer, { renderTexture });

        // if (level) {

        //     level.destroy();

        // }
        // level = Sprite.from(renderTexture);
        // level.position.set(
        //     (minX - 0.5) * world.cellSize.x,
        //     (minY - 0.5) * world.cellSize.y
        // );
        // world.addChild(level);
        await Game.preUpdate();

        generating = false;

    }

    await handleGenerateLevel();

    engine.onUpdate((delta, time) => {

        Game.update(delta, time);
        Input.update();

    });

    // world.addChild(levelContainer);

    // document.querySelector('#generate-path').addEventListener('click', handleGenerateLevel);

    // pathGraphics.parentGroup = groupMap.get('hover');

    // creates ui using react and renders it with reactdom
    const uiContainer = document.querySelector('.ui-container');

    const root = ReactDOM.createRoot(uiContainer);
    root.render(ReactRoot());

}

main();
