import './style.css';

import { World } from '$/world';

import { Application, Assets, Container, Graphics, ObservablePoint, Point, RenderTexture, SCALE_MODES, settings, Sprite } from 'pixi.js';
import { Stage, Layer } from '@pixi/layers';
import { GroupMap } from '$/groupMap';
import { FixedEngine } from '$/engine';

async function main() {

    // The application will create a renderer using WebGL, if possible,
    // with a fallback to a canvas render. It will also setup the ticker
    // and the root stage PIXI.Container
    const app = new Application({ resizeTo: window });

    // The application will create a canvas element for you that you
    // can then insert into the DOM
    document.querySelector('.canvas-container').appendChild(app.view);

    // replace the app stage with a custom stage from @pixi/layers
    app.stage = new Stage();

    // sorts layers (probably optional)
    app.stage.sortableChildren = true;

    /**
     * gets the global groupMap, which maps the name of a group to a group object
     * the group is created in the group map
     * this is part of @pixi/layers
     */
    const groupMap = GroupMap.groupMap;
    groupMap.create('default', 0, (object) => {

        object.zOrder = -object.y;

    });
    groupMap.create('hover', 1, (object) => {

        object.zOrder = -object.y;

    });

    /**
     * creates a layer for each group, and adds the layer to the stage
     * this is necessary for objects using the group render method to be visible
     */
    groupMap.forEach((group) => {

        app.stage.addChild(new Layer(group));

    });

    /**
     * creates a new World, which extends PIXI.Container
     * this is where game related objects should be added
     */
    const world = new World(app);

    // sets the cell size of the world
    world.cellSize.set(50, 50);

    // add the world to the stage to be rendered
    app.stage.addChild(world);

    const engine = new FixedEngine();
    engine.onUpdate((ticks) => {
        // world.camera.zoom = (Math.sin(ticks * 0.01) + 1) * 0.5;
    });
    engine.start();

    /**
     * creates PIXI observable points for the canvas mouse position
     * this can be used as a global position, not for the world but for the canvas itself
     * might change to normal point later
     */
    const canvasMousePosition = new ObservablePoint(() => {}, this);
    const canvasMouseRelative = new ObservablePoint(() => {}, this);
    app.view.addEventListener('mousemove', (e) => {

        canvasMousePosition.x = e.clientX || e.x || 0;
        canvasMousePosition.y = e.clientY || e.y || 0;
        canvasMouseRelative.x = e.movementX;
        canvasMouseRelative.y = e.movementY;

    });

    /**
     * creates a update loop for rendering. not for gameplay!
     * optional if everything is already rendered from the app
     */
    // let time = 0;
    // // Listen for frame updates
    // app.ticker.add((delta) => {
    //     time += delta;
    // });

    // creates path

    const pathGraphics = new Graphics();
    world.addChild(pathGraphics);

    settings.SCALE_MODE = SCALE_MODES.NEAREST;

    Assets.add(
        'pathSheet',
        './lib/assets/world-sheet.json'
    );
    const pathSheet = await Assets.load('pathSheet');

    // console.log(pathSheet);

    let level;
    function generatePath() {

        const path = world.createPath(-4, 4, new Point(0, -1));

        let maxX = 0;
        let minX = 0;
        let maxY = 0;
        let minY = 0;

        pathGraphics.clear();
        let i = 0;
        path.forEach((point) => {

            const color = (0xFF0000) | (0xFF00 * (i / path.size)) | (0xFF);
            i++;
            pathGraphics.beginFill(color);

            // pathGraphics.drawRect(
            //     (point.x * world.cellSize.x) - (world.cellSize.x / 2),
            //     (point.y * world.cellSize.y) - (world.cellSize.y / 2),
            //     world.cellSize.x, world.cellSize.y
            // );

            maxX = Math.max(point.x, maxX);
            minX = Math.min(point.x, minX);
            maxY = Math.max(point.y, maxY);
            minY = Math.min(point.y, minY);

            // world.addChild(sprite);

        });
        pathGraphics.endFill();

        const renderTexture = RenderTexture.create({ width: (maxX - minX + 1) * world.cellSize.x, height: (maxY - minY + 1) * world.cellSize.y });
        // if (levelContainer) {
        //     levelContainer.destroy();
        // }
        const levelContainer = new Container();
        const pathTag = pathSheet.data.meta.frameTags.find(({ name }) => name === 'stones');
        const pathFrames = [];
        for (let i = pathTag.from; i <= pathTag.to; i++) {

            pathFrames.push(pathSheet.textures[i]);

        }

        path.forEach((point) => {

            const sprite = Sprite.from(pathFrames[Math.floor(Math.random() * pathFrames.length)]);
            sprite.position.x = ((point.x - minX) * world.cellSize.x);
            sprite.position.y = ((point.y - minY) * world.cellSize.y);
            sprite.width = world.cellSize.x;
            sprite.height = world.cellSize.y;

            levelContainer.addChild(sprite);

        });

        path.clear();

        app.renderer.render(levelContainer, { renderTexture });

        if (level) {

            level.destroy();

        }
        level = Sprite.from(renderTexture);
        level.position.set(
            (minX - 0.5) * world.cellSize.x,
            (minY - 0.5) * world.cellSize.y
        );
        world.addChild(level);

    }

    // world.addChild(levelContainer);

    document.querySelector('#generate-path').addEventListener('click', generatePath);

    // pathGraphics.parentGroup = groupMap.get('hover');

}

main();
