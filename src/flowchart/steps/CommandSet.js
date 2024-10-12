const { SimpleObj } = require("../../SimpleObj");
const { CommandBasic } = require("./CommandBasic");

class CommandSet extends CommandBasic {
    async computation() {
        const path = this.args[0];
        const val = this.args[1];
        SimpleObj.recreate(this.context.data, path, val);
    }
}

module.exports = {
    CommandSet
};