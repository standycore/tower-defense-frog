import './Item.css';

export default function Item({ name, onClick }) {

    function handleClick() {

        if (onClick) {

            onClick();

        }

    }

    return (
        <button onClick={handleClick}>{name}</button>
    );

}
