
const { CommandBasic } = require("./CommandBasic");

class CommandPrint extends CommandBasic {
    async computation() {
        console.log(this.args.join(" "));
    }
}

module.exports = {
    CommandPrint
};