import { Assets } from 'pixi.js';

async function loadAssets() {

    // Assets for the rock path
    Assets.add(
        'worldSheet',
        './lib/assets/world-sheet.json'
    );
    await Assets.load('worldSheet');

    // Assets for the base frog
    Assets.add(
        'frogSheet',
        './lib/assets/frog-sheet.json'
    );
    await Assets.load('frogSheet');

    // Assets for the fly
    Assets.add(
        'flySheet',
        './lib/assets/fly-sheet.json'
    );
    await Assets.load('flySheet');

    // Assets for the spider
    Assets.add(
        'spiderSheet',
        './lib/assets/spider-sheet.json'
    );
    await Assets.load('spiderSheet');

    // Assets for the butterfly
    Assets.add(
        'butterflySheet',
        './lib/assets/butterfly-sheet.json'
    );
    await Assets.load('butterflySheet');

}

export { loadAssets };
