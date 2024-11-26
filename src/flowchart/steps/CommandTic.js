const { CommandBasic } = require("./CommandBasic");

class CommandTic extends CommandBasic {
    async computation() {
        const path = this.args[0];
        const val = new Date().getTime();
        this.writeArgument(`${path}.tic`, val);
    }
}

module.exports = {
    CommandTic
};