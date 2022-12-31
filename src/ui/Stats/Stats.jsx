import Lives from './Lives/Lives';
import Money from './Money/Money';
import './Stats.css';

export default function Stats() {

    return (
        <div className="stats">
            <Money/>
            <Lives/>
        </div>
    );

}
