const { StepBasic } = require("./StepBasic");

class StepTimeLineHasMore extends StepBasic {
    async canContinue() {
        const timeLineId = this.args[0];
        const timeline = this.context.getTimeLine(timeLineId);
        if (!timeline) {
            return false;
        }
        return timeline.t + timeline.period < timeline.end;
    }
}

module.exports = {
    StepTimeLineHasMore
};