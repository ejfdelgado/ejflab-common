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
            SimpleObj.recreate(this.context.data, `scope.progressEach.${timeLineId}`, 100);
            // Compute the overall advance
            const allProgress = SimpleObj.getValue(this.context.data, `scope.progressEach`, {});
            const keysProgress = Object.keys(allProgress);
            let sum = 0;
            for (let i = 0; i < keysProgress.length; i++) {
                const oneKey = keysProgress[i];
                const progress = allProgress[oneKey];
                sum += progress;
            }
            const average = sum / keysProgress.length;
            SimpleObj.recreate(this.context.data, `scope.progress`, Math.ceil(average));
        }
        return finished;
    }
}

module.exports = {
    StepTimeLineEnds
};