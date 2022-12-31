import { EventEmitter } from '$/events';
import { useState } from 'react';
import Heart from './Heart';
import './Lives.css';

export default function Lives() {

    const [initialized, setInitialized] = useState(false);
    const [lives, setLives] = useState(4);

    if (!initialized) {

        EventEmitter.events.on('uiSetLives', (lives) => {

            setLives(lives);

        });

        EventEmitter.events.trigger('uiLivesReady');

        setInitialized(true);

    };

    const hearts = [];

    for (let i = 0; i < lives; i++) {

        hearts.push(
            <Heart key={i} />
        );

    }

    return (
        <div className="lives">
            {hearts}
        </div>
    );

}
