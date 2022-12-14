import './style.css';

import { World } from './lib/world';

import { Application, Graphics, ObservablePoint } from 'pixi.js';
import { Stage, Layer } from '@pixi/layers';
import { GroupMap } from './lib/groupMap';
import { FixedEngine } from './lib/engine';

async function main() {
    // The application will create a renderer using WebGL, if possible,
    // with a fallback to a canvas render. It will also setup the ticker
    // and the root stage PIXI.Container
    const app = new Application({ resizeTo: window });

    // The application will create a canvas element for you that you
    // can then insert into the DOM
    document.body.appendChild(app.view);

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

    // let time = 0;
    // // Listen for frame updates
    // app.ticker.add((delta) => {
    //     time += delta;
    // });

    // creates path
    const path = world.createPath(-4, 4);
    const pathGraphics = new Graphics();
    pathGraphics.lineStyle(1, 0xFFFFFF);
    pathGraphics.beginFill(0xFFFFFF);
    path.forEach((point) => {
        // pathGraphics.drawCircle(point.x * world.cellSize.x, point.y * world.cellSize.y, 5);
        pathGraphics.drawRect(
            (point.x * world.cellSize.x) - (world.cellSize.x / 2),
            (point.y * world.cellSize.y) - (world.cellSize.y / 2),
            world.cellSize.x, world.cellSize.y);
    });
    pathGraphics.endFill();
    world.addChild(pathGraphics);
    // pathGraphics.parentGroup = groupMap.get('hover');
}

main();
