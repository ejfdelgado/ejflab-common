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

        // Check if should create N array
        if (typeof timeline.n == "number" && timeline.n > 0) {
            const dperiod = timeline.period / timeline.n;
            const list = new Array(timeline.n);
            for (let i=0; i<list.length; i++) {
                list[i] = {done: false};
            }
            timeline.dperiod = dperiod;
            timeline.list = list;
        }

        // Compute advance percentage
        const percentage = (timeline.t - timeline.start) / (timeline.end - timeline.start);
        SimpleObj.recreate(this.context.data, `scope.progressEach.${timeLineId}`, Math.ceil(percentage * 100));
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
}

module.exports = {
    CommandTimelineNext
};