/** @type {{public: Object, world: import('$/world').World}} */
const Global = {
    public: {
        debug: false
    }
};

window.Global = Global.public;

export { Global };
