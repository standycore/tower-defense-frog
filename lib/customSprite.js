import { AnimatedSprite, Assets, Ticker } from 'pixi.js';
import { getDurationsFromTag, getFramesFromTag, getSpritesheetTags, getTextureArrayFromSpritesheet } from './util';

class CustomSprite extends AnimatedSprite {

    constructor(spritesheet, options = {}) {

        spritesheet = spritesheet || Assets.get(spritesheet);
        const textures = getTextureArrayFromSpritesheet(spritesheet);

        super(textures);

        this.spritesheet = spritesheet;

        this.durations = [];

        this.animations = {};

        // create animations based on tags
        // animations are labeled by name, and are formatted as {frames: [], durations: []}
        const tags = getSpritesheetTags(spritesheet);

        // if animation data, add that too
        if (spritesheet.data.animations) {

            Object.entries(spritesheet.data.animations).forEach(([key, frames]) => {

                const durations = frames.map((frame) => spritesheet.data.frames[frame].duration);
                this.animations[key] = { frames, durations };

            });

        }

        // tags will overwrite animation data if there are collisions
        tags.forEach((tag) => {

            const frames = getFramesFromTag(spritesheet, tag) || [];
            const durations = getDurationsFromTag(spritesheet, tag) || frames.map(() => 100);
            this.animations[tag] = { frames, durations };

        });

        this.timer = 0; // ms

        this.currentAnimationName = '';
        this.currentFrameIndex = 0;
        this.currentFrameTime = 0;
        this.currentFrameDuration = 0;
        this.currentAnimation = undefined;
        this.elapsed = 0;

        this.autoUpdate = options.autoUpdate || true;
        this.ticker = undefined;

    }

    get playing() {

        return this._playing;

    }

    set playing(b) {

        this._playing = b;

    }

    get autoUpdate() {

        return this._autoUpdate;

    }

    set autoUpdate(b) {

        this._autoUpdate = b;
        if (this._autoUpdate) {

            if (!this.ticker) {

                Ticker.shared.add(this.update, this);

            }

        } else {

            Ticker.shared.remove(this.update, this);

        }

    }

    animationUpdate(delta) {

        if (this.playing && this.currentAnimation) {

            while (this.timer > this.currentFrameDuration) {

                this.timer -= this.currentFrameDuration;

                if (this.currentFrameIndex === this.currentAnimation.frames.length - 1) {

                    if (this.loop) {

                        this.currentFrameIndex = 0;

                    } else {

                        this.playing = false;

                    }

                } else {

                    this.currentFrameIndex += 1;

                }

                this.currentFrameDuration = this.currentAnimation.durations[this.currentFrameIndex];

            }

            this.currentFrame = this.currentAnimation.frames[this.currentFrameIndex];

            this.timer += delta;

        }

        this.elapsed += delta;

    }

    update(delta) {

        if (this.autoUpdate) {

            this.animationUpdate(Ticker.shared.deltaMS);

        } else {

            this.animationUpdate(delta);

        }

    }

    play(animationName, options = {}) {

        if (!animationName) {

            animationName = Object.keys(this.animations)[0];

        }

        if (this.animationName === animationName) {

            return;

        }

        const animation = this.animations[animationName];

        if (!animation) {

            console.error('cannot play non-existent animation by name:', animationName);
            return;

        }

        this.currentAnimationName = animationName;
        this.currentAnimation = animation;
        this.currentFrameIndex = 0;
        this.currentFrameDuration = animation.durations[this.currentFrameIndex];
        this.currentFrame = animation.frames[this.currentFrameIndex];
        this.timer = 0;

        this.loop = options.loop !== undefined ? options.loop : this.loop;

        this.playing = true;

    }

}

export { CustomSprite };
