import './style.css';

import { World } from './lib/world';

import { Application, Graphics } from 'pixi.js';

async function main() {
    // The application will create a renderer using WebGL, if possible,
    // with a fallback to a canvas render. It will also setup the ticker
    // and the root stage PIXI.Container
    const app = new Application({ resizeTo: window });

    // The application will create a canvas element for you that you
    // can then insert into the DOM
    document.body.appendChild(app.view);

    const grid = new World();

    grid.set(0, 0, 'a');
    grid.set(1, 0, 'a');
    grid.set(0, 2, 'a');
    grid.set(3, 4, 'a');
    grid.set(2, 6, 'a');

    const graphics = new Graphics();

    grid.forEach((value, x, y) => {
        graphics.drawRect(x * 20, y * 20, 20, 20);
    });

    grid.cellSize.set(40, 40);

    app.stage.addChild(graphics);

    // let time = 0;
    // Listen for frame updates
    app.ticker.add((delta) => {
        // time += delta;

        graphics.clear();

        graphics.lineStyle(1, 0xffffff);

        // grid.drawGrid(graphics, Math.sin(time * 0.1) * 10, Math.cos(time * 0.1) * 10, app.screen.width, app.screen.height);
        grid.drawGrid(graphics, 0, 0, app.screen.width, app.screen.height);
    });

    return 'solemthing';
}

main();
