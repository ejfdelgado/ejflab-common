const { StepBasic } = require("./StepBasic");
const { SimpleObj } = require("../../SimpleObj");
const { IdGen } = require("../../IdGen");

class StepReadSrc extends StepBasic {
    pendingCall = null;
    socketId = null;
    sourceUID = null;
    dataPath = null;
    configuration = null;
    constructor(context, id, commandName, argsTxt) {
        super(context, id, commandName, argsTxt);
        super.alwaysEvaluateCanContinue = false;
    }
    async execFirst() {
        const sourcePair = this.args[0];
        const parts = sourcePair.split(".");
        this.sourceUID = parts[0];
        if (parts.length >= 2) {
            this.dataPath = parts[1];
        }
        const timelineId = this.args[1];
        const timeline = this.context.getTimeLine(timelineId);
        if (!timeline || typeof timeline.t != "number" || timeline.done) {
            console.log(`Timeline ${timelineId} can't be used ${JSON.stringify(timeline)}`);
        }
        if (this.context.io) {
            // Leo la ruta del sourceUID
            this.configuration = SimpleObj.getValue(this.context.data, `state.sources.${this.sourceUID}`, null);
            let localConfiguration = {};
            if (this.dataPath) {
                if (!(this.dataPath in this.configuration.data)) {
                    console.log(`The source ${this.sourceUID} has no ${this.dataPath}`);
                    return;
                }
                localConfiguration[this.dataPath] = this.configuration.data[this.dataPath];
            } else {
                localConfiguration = this.configuration.data;
            }
            this.socketId = this.configuration.socket;
            if (this.socketId) {
                this.messageUID = IdGen.num2ord(new Date().getTime());
                this.pendingCall = `${this.id}-${this.messageUID}`;
                this.context.registerPendingCall(this.pendingCall, this);
                this.context.io.to(this.socketId).emit("readSrc", {
                    configuration: localConfiguration,
                    timeline,
                    sourcePair,
                    id: this.pendingCall,
                });
            }
        }
    }

    async canContinue() {
        if (!this.pendingCall) {
            return false;
        }
        const isPending = this.context.existsPendingCall(this.pendingCall);
        return !isPending;
    }
}

module.exports = {
    StepReadSrc
};