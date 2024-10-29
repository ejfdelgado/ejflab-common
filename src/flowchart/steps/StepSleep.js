const { StepBasic } = require("./StepBasic");

class StepSleep extends StepBasic {
    startTime = null;
    duration = null;
    constructor(context, id, commandName, argsTxt) {
        super(context, id, commandName, argsTxt);
        super.alwaysEvaluateCanContinue = false;
    }
    async execFirst() {
        this.startTime = new Date().getTime();
        const minTime = this.args[0];
        const maxTime = this.args[1];
        if (typeof maxTime == "number") {
            this.duration = minTime + Math.floor(Math.random() * (maxTime - minTime));
        } else {
            this.duration = minTime;
        }
    }

    async canContinue() {
        const diff = new Date().getTime() - this.startTime;
        return diff >= this.duration;
    }
}

module.exports = {
    StepSleep
};