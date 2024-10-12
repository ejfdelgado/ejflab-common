const { CommandBasic } = require("./CommandBasic");
const { SimpleObj } = require("../../SimpleObj");

class CommandTimelineNext extends CommandBasic {
    async computation() {
        const timeLineId = this.args[0];
        const timeline = this.context.getTimeLine(timeLineId);
        if (!timeline) {
            return;
        }
        if ([null, undefined].indexOf(timeline.t) >= 0) {
            timeline.t = timeline.start;
        } else {
            timeline.t = timeline.t + timeline.period;
            if (timeline.t > timeline.end) {
                timeline.t = timeline.end;
            }
        }
        // Compute advance percentage
        const percentage = (timeline.t - timeline.start) / (timeline.end - timeline.start);
        SimpleObj.recreate(this.context.data, "scope.progress", Math.ceil(percentage * 100));

    }
}

module.exports = {
    CommandTimelineNext
};