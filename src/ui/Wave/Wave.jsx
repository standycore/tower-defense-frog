import { EventEmitter } from '$/events';
import { useState } from 'react';
import './Wave.css';

export default function Wave() {

    const [initialized, setInitialized] = useState(false);
    const [visible, setVisible] = useState(false);

    if (!initialized) {

        EventEmitter.events.on('uiWaveSetVisible', (b) => {

            setVisible(b);

        });

        EventEmitter.events.trigger('uiWaveReady');

        setInitialized(true);

    }

    function handleClick() {

        EventEmitter.events.trigger('startWave');

    }

    return (
        <button className={`wave ${visible ? '' : 'display-none'}`} onClick={handleClick}>
            Ready
        </button>
    );

}
