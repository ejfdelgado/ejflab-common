const { SimpleObj } = require("../../SimpleObj");
const { CommandBasic } = require("./CommandBasic");

class CommandTimeline extends CommandBasic {
    async computation() {
        const timeLineId = this.args[0];
        const start = parseFloat(this.args[1]);
        const end = parseFloat(this.args[2]);
        const period = parseFloat(this.args[3]);
        const timeline = {
            start,
            end,
            period,
        };
        this.context.registerTimeline(timeLineId, timeline);
    }
}

module.exports = {
    CommandTimeline
};