const { CommandBasic } = require("./CommandBasic");

class CommandToc extends CommandBasic {
    async computation() {
        const path = this.args[0];
        const val = new Date().getTime();
        const tic = this.resolveArgument(`${path}.tic`);
        this.writeArgument(`${path}.toc`, val);
        if (typeof tic == "number") {
            this.writeArgument(`${path}.gap`, val - tic);
        }
    }
}

module.exports = {
    CommandToc
};