const { StepBasic } = require("./StepBasic");

class StepOneTime extends StepBasic {
    executed = false;
    constructor(context, id, commandName, argsTxt) {
        super(context, id, commandName, argsTxt);
        super.autoDelete = false;
    }

    async canContinue() {
        return !this.executed;
    }

    async arrowAccepted() {
        this.executed = true;
    }
}

module.exports = {
    StepOneTime
};