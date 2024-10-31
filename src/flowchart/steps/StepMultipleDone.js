const { StepBasic } = require("./StepBasic");
const { SimpleObj } = require("../../SimpleObj");

class StepMultipleDone extends StepBasic {
    list = [];
    constructor(context, id, commandName, argsTxt) {
        super(context, id, commandName, argsTxt);
        super.alwaysEvaluateCanContinue = true;
    }
    async execFirst() { }

    async canContinue() {
        this.list = SimpleObj.getValue(this.context.data, this.args[0], []);
        if (!(this.list instanceof Array)) {
            console.log(`In StepMultipleDone, warning ${this.args[0]} is not a list!`);
            return true;
        }
        for (let i = 0; i < this.list.length; i++) {
            const element = this.list[i];
            if (element.done !== true) {
                return false;
            }
        }
        return true;
    }
}

module.exports = {
    StepMultipleDone
};