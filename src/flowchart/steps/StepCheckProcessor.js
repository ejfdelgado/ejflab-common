const { StepBasic } = require("./StepBasic");
const { SimpleObj } = require("../../SimpleObj");

class StepCheckProcessor extends StepBasic {
    constructor(context, id, commandName, argsTxt) {
        super(context, id, commandName, argsTxt);
        super.alwaysEvaluateCanContinue = true;
    }
    async execFirst() {
    }

    async canContinue() {
        for (let i = 0; i < this.args.length; i++) {
            const processorUID = this.args[i];
            const socket = SimpleObj.getValue(this.context.data, `state.processors.${processorUID}.socket`, null);
            if (!socket) {
                return false;
            }
        }
        return true;
    }
}

module.exports = {
    StepCheckProcessor
};