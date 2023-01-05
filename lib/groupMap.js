import { Group } from '@pixi/layers';

class GroupMap extends Map {

    static _groupMap;

    /**
     * @returns {GroupMap}
     */
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
        this.set(groupName, group);
        return group;

    }

}

export { GroupMap };
