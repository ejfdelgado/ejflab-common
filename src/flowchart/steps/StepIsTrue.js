const { StepBasic } = require("./StepBasic");

class StepIsTrue extends StepBasic {
    async canContinue() {
        const result = this.args[0];
        return result;
    }
}

class StepIsFalse extends StepBasic {
    async canContinue() {
        const result = this.args[0];
        return !!!result;
    }
}

module.exports = {
    StepIsTrue,
    StepIsFalse
};