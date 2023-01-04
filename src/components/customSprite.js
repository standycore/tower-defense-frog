import { CustomSprite } from '$/customSprite';
import { SpriteComponent } from './sprite';

class CustomSpriteComponent extends SpriteComponent {

    spriteConstructor(source) {

        return new CustomSprite(source);

    }

    update(delta) {

    }

}

CustomSpriteComponent.register();

export { CustomSpriteComponent };
