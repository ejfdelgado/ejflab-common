const { SimpleObj } = require("../../SimpleObj");
const { CommandBasic } = require("./CommandBasic");

class CommandInc extends CommandBasic {
    async computation() {
        const path = this.args[0];
        let ammount = 1;
        if (typeof this.args[1] == "number") {
            ammount = this.args[1];
        }
        let old = SimpleObj.getValue(this.context.data, path, 0);
        old += ammount;
        SimpleObj.recreate(this.context.data, path, old);
    }
}

module.exports = {
    CommandInc
};