const { StepBasic } = require("./StepBasic");

class CommandBasic extends StepBasic {
    constructor(context, id, commandName, argsTxt) {
        super(context, id, commandName, argsTxt);
        super.alwaysEvaluateCanContinue = false;
        super.autoDelete = true;
    }
    async canContinue() {
        return true;
    }
    async execLast(options = {}) {
        const lastArg = this.args[this.args.length - 1];
        if (options.isCommand || ["always", "start"].indexOf(lastArg) >= 0) {
            if (lastArg == "always") {
                super.alwaysEvaluateCanContinue = true;
            }
            return await this.computation();
        }
    }
    async arrowAccepted() {
        const lastArg = this.args[this.args.length - 1];
        if (lastArg == "end") {
            return await this.computation();
        }
    }
    async computation() { }
}

module.exports = {
    CommandBasic
};