import { SCALE_MODES, settings } from 'pixi.js';

import '@pixi/math-extras';

async function init() {

    // sets the default scaling mode of all loaded textures to NEAREST
    // this is good for pixel art as it prevents blurriness caused by filtering
    settings.SCALE_MODE = SCALE_MODES.NEAREST;

}

init();
