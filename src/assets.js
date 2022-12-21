import { Assets } from 'pixi.js';

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

}

export { loadAssets };
