import Shop from './Shop/Shop';
import './root.css';
import Stats from './Stats/Stats';

export default function ReactRoot() {

    return (
        <div id="root">
            <Shop/>
            <Stats/>
        </div>
    );

}
