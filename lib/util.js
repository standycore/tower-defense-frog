// eslint-disable-next-line no-unused-vars
import { Spritesheet } from 'pixi.js';

/**
 *
 * @param {Spritesheet} spritesheet
 */
function getTag(spritesheet, tag) {

    if (typeof tag === 'string') {

        tag = spritesheet.data.meta.frameTags?.find(({ name }) => name === tag);

    }

    if (!tag) {

        console.error('the spritesheet does not have a tag by the name:', tag);
        return;

    }

    return tag;

}

/**
 *
 * @param {Spritesheet} spritesheet
 */
function getTextureArrayFromTag(spritesheet, tag) {

    tag = getTag(spritesheet, tag);
    if (!tag) return;

    const textures = [];

    for (let i = tag.from; i <= tag.to; i++) {

        textures.push(spritesheet.textures[i]);

    }

    return textures;

}

/**
 *
 * @param {Spritesheet} spritesheet
 */
function getFramesFromTag(spritesheet, tag) {

    tag = getTag(spritesheet, tag);
    if (!tag) return;

    const frames = [];

    for (let i = tag.from; i <= tag.to; i++) {

        frames.push(i);

    }

    return frames;

}

/**
 *
 * @param {Spritesheet} spritesheet
 */
function getDurationsFromTag(spritesheet, tag) {

    tag = getTag(spritesheet, tag);
    if (!tag) return;

    const durations = [];

    for (let i = tag.from; i <= tag.to; i++) {

        durations.push(spritesheet.data.frames[i].duration);

    }

    return durations;

}

/**
 *
 * @param {Spritesheet} spritesheet
 */
function getTextureArrayFromTags(spritesheet, tags) {

    if (!(tags instanceof Array)) {

        console.error('getTextureArrayFromTags requires an array of tags');
        return;

    }

    const textures = [];

    tags.forEach((tag) => {

        const result = getTextureArrayFromTag(spritesheet, tag);
        if (result) {

            textures.push(...result);

        }

    });

    return textures;

}

/**
 *
 * @param {Spritesheet} spritesheet
 */
function getTextureArrayFromSpritesheet(spritesheet) {

    return Array.from(Object.values(spritesheet.textures));

}

/**
 *
 * @param {Spritesheet} spritesheet
 */
function getSpritesheetTags(spritesheet) {

    return spritesheet?.data?.meta?.frameTags;

}

export { getTextureArrayFromTag, getSpritesheetTags, getTextureArrayFromTags, getTextureArrayFromSpritesheet, getTag, getFramesFromTag, getDurationsFromTag };
