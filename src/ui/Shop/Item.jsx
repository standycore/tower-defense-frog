import './Item.css';

export default function Item({ name, price, thumbnail, onClick }) {

    function handleClick() {

        if (onClick) {

            onClick();

        }

    }

    return (
        <button className="shop-item" onClick={handleClick}>
            <div className="title">
                {name}
            </div>
            <img className="thumbnail" src={thumbnail || './assets/frog-thumbnail-default.png'} alt="Thumbnail" width={64} height={64} />
            <div className="price">
                <img src="./assets/coin.png" alt="Coin" width={32} height={32} />
                {price}
            </div>
        </button>
    );

}
