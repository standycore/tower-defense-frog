import Shop from './Shop/Shop';
import './root.css';
import Stats from './Stats/Stats';
import Wave from './Wave/Wave';

export default function ReactRoot() {

    return (
        <div id="root">
            <Shop/>
            <Stats/>
            <Wave/>
        </div>
    );

}
