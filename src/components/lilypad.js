import { ECS } from '$/ecs';
import { getTextureArrayFromTag } from '$/util';
import { Assets } from 'pixi.js';
import { SpriteComponent } from './sprite';
import { WorldComponent } from './world';

class LilypadComponent extends ECS.Component {

    preUpdate(world) {

        const worldSheet = Assets.get('worldSheet');
        const lilypadTextures = getTextureArrayFromTag(worldSheet, 'lilies');
        const randomIndex = Math.floor(Math.random() * lilypadTextures.length);

        this.entity.addComponent(SpriteComponent, lilypadTextures[randomIndex], (sprite) => {

            sprite.width = world.cellSize.x;
            sprite.height = world.cellSize.y;
            sprite.anchor.set(0.5);
            world.addChild(sprite);

        });
        this.entity.addComponent(WorldComponent, world);

    }

}

LilypadComponent.register();

export { LilypadComponent };
