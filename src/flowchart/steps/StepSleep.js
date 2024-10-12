const { StepBasic } = require("./StepBasic");

class StepSleep extends StepBasic {
    startTime = null;
    constructor(context, id, commandName, argsTxt) {
        super(context, id, commandName, argsTxt);
        super.alwaysEvaluateCanContinue = false;
    }
    async execFirst() {
        this.startTime = new Date().getTime();
    }

    async canContinue() {
        const minTime = this.args[0];
        const diff = new Date().getTime() - this.startTime;
        return diff >= minTime;
    }
}

module.exports = {
    StepSleep
};