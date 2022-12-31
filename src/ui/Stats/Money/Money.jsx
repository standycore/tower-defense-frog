import { EventEmitter } from '$/events';
import { useState } from 'react';
import './Money.css';

export default function Money() {

    const [initialized, setInitialized] = useState(false);
    const [money, setMoney] = useState(10);

    if (!initialized) {

        EventEmitter.events.on('uiSetMoney', (money) => {

            setMoney(money);

        });

        EventEmitter.events.trigger('uiMoneyReady');

        setInitialized(true);

    };

    return (
        <div className="money">
            <img src="./assets/coin.png" alt="Coin" />
            <div className="text">
                {`x${money}`}
            </div>
        </div>
    );

}
