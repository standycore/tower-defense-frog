import { Group } from '@pixi/layers';

class GroupMap extends Map {

    static _groupMap;

    static get groupMap() {

        if (!this._groupMap) {

            this._groupMap = new GroupMap();

        }
        return this._groupMap;

    }

    create(groupName, ...args) {

        if (this.has(groupName)) {

            return;

        }
        const group = new Group(...args);
        group.name = groupName;
        // console.log(group);
        this.set(groupName, group);
        return group;

    }

}

export { GroupMap };
