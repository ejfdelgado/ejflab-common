const { StepBasic } = require("./StepBasic");
const { SimpleObj } = require("../../SimpleObj");

class StepTimeLineEnds extends StepBasic {
    async canContinue() {
        const timeLineId = this.args[0];
        const timeline = this.context.getTimeLine(timeLineId);
        if (!timeline) {
            return false;
        }
        const finished = !(timeline.t + timeline.period < timeline.end);
        if (finished) {
            SimpleObj.recreate(this.context.data, "scope.progress", 100);
        }
        return finished;
    }
}

module.exports = {
    StepTimeLineEnds
};