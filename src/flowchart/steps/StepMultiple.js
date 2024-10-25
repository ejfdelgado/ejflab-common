const { StepBasic } = require("./StepBasic");

class StepMultiple extends StepBasic {
    list = [];
    constructor(context, id, commandName, argsTxt) {
        super(context, id, commandName, argsTxt);
        super.alwaysEvaluateCanContinue = true;
    }
    async execFirst() {
        const flowChartTemplateName = this.args[0];
        this.list = this.args[1];
    }

    async canContinue() {
        return true;
    }
}

module.exports = {
    StepMultiple
};