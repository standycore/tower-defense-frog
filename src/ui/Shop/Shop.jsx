import './Shop.css';
import Item from './Item';
import { useState } from 'react';
import { EventEmitter } from '$/events';

export default function Shop({ name }) {

    const [initialized, setInitialized] = useState(false);
    const [items, setItems] = useState({});

    if (!initialized) {

        // console.log('shop setting up events');
        EventEmitter.events.on('shopSetItem', ({ id, name, price, thumbnail, unlocked, data, callback }) => {

            if (id === undefined) {

                return;

            }
            const itemData = items[id] || {};
            Object.assign(itemData, {
                id,
                name: name || itemData.name || '',
                price: price || itemData.price || 0,
                thumbnail,
                unlocked: unlocked !== undefined ? unlocked : itemData.unlocked || false,
                callback: callback || itemData.callback,
                data: data || {}
            });
            items[id] = itemData;

            setItems({ ...items });

        });

        EventEmitter.events.trigger('shopReady');

        setInitialized(true);

    }

    const itemButtons = Array.from(Object.values(items)).map((itemData) => {

        const { id, name, price, unlocked, callback } = itemData;

        function handleClick() {

            if (callback) {

                callback(itemData);

            }

        }

        return <Item key={id} name={name} price={price} unlocked={unlocked} onClick={handleClick}/>;

    });

    return (
        <div className='shop-container'>
            <h1>{name || 'Shop'}</h1>
            <div className='item-container'>
                {itemButtons}
            </div>
        </div>
    );

}
