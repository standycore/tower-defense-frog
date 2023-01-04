import { Assets, BitmapFont, Graphics, RenderTexture } from 'pixi.js';
import { Global } from './global';

async function loadAssets() {

    // Assets for the rock path
    Assets.add(
        'worldSheet',
        './assets/world-sheet.json'
    );
    await Assets.load('worldSheet');

    // Assets for the base frog
    Assets.add(
        'frogSheet',
        './assets/frog-sheet.json'
    );
    await Assets.load('frogSheet');

    // Assets for the fast frog
    Assets.add(
        'fastFrogSheet',
        './assets/fast-frog-sheet.json'
    );
    await Assets.load('fastFrogSheet');

    // Assets for the fly
    Assets.add(
        'flySheet',
        './assets/fly-sheet.json'
    );
    await Assets.load('flySheet');

    // Assets for the spider
    Assets.add(
        'spiderSheet',
        './assets/spider-sheet.json'
    );
    await Assets.load('spiderSheet');

    // Assets for the butterfly
    Assets.add(
        'butterflySheet',
        './assets/butterfly-sheet.json'
    );
    await Assets.load('butterflySheet');

    // Asset for the heart
    Assets.add(
        'heart',
        './assets/heart.png'
    );
    await Assets.load('heart');

    // Asset for the cell highlight
    Assets.add(
        'cellHighlight',
        './assets/cell-highlight.png'
    );
    await Assets.load('cellHighlight');

    // generated circle asset
    // here i am testing using a sprite as a circle
    // it draws a circle using graphics then renders it onto a texture
    {

        const graphics = new Graphics();
        graphics.beginFill(0xFFFFFF, 1);
        graphics.drawCircle(50, 50, 50);

        // render texture created
        const renderTexture = RenderTexture.create({ width: 100, height: 100 });

        // render graphics to render texture
        Global.app.renderer.render(graphics, { renderTexture });

        // create sprite and set anchor/origin to .5
        // const sprite = Sprite.from(renderTexture);
        // sprite.anchor.set(0.5);

        // add circle to asset cache
        // it can be received with Assets.get('circle');
        Assets.cache.set('circle', renderTexture);

        graphics.destroy();

    }

    // load bitmap fonts
    BitmapFont.from('Arial', {
        fontFamily: 'Arial',
        fontSize: 16,
        strokeThickness: 2,
        fill: 'white'
    });

}

export { loadAssets };
