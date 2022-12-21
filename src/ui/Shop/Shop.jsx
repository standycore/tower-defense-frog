import './Shop.css';
import Item from './Item';

export default function Shop({ name }) {

    const frogs = ['frog1', 'cool frog', 'dafrawg', 'hello froggy', 'frogC'];

    const items = frogs.map((frogData) => {

        const name = frogData;
        const id = frogData;
        return <Item key={id} name={name}/>;

    });

    return (
        <div className='shop-container'>
            <h1>{name || 'Shop'}</h1>
            <div className='item-container'>
                {items}
            </div>
        </div>
    );

}
