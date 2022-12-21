import './Item.css';

export default function Item({ name }) {

    function handleClick() {

        console.log(name + ' clicked');

    }

    return (
        <button onClick={handleClick}>{name}</button>
    );

}
