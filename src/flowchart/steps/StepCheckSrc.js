const { StepBasic } = require("./StepBasic");
const { SimpleObj } = require("../../SimpleObj");

class StepCheckSrc extends StepBasic {
    socketId = null;
    configuration = null;
    constructor(context, id, commandName, argsTxt) {
        super(context, id, commandName, argsTxt);
        super.alwaysEvaluateCanContinue = false;
    }
    async execFirst() {
        const sourceUID = this.args[0];
        if (this.context.io) {
            // Leo la ruta del sourceUID
            const configuration = SimpleObj.getValue(this.context.data, `state.sources.${sourceUID}`, null);
            this.socketId = configuration.socket;
            if (this.socketId) {
                this.context.io.to(this.socketId).emit("checkSrc", configuration);
            }
        }
    }

    async canContinue() {
        const sourceUID = this.args[0];
        if (!this.socketId) {
            return false;
        }
        // Debe validar que todos las configuraciones hayan sido respondidas sin error
        const configuration = SimpleObj.getValue(this.context.data, `state.sources.${sourceUID}`, null);
        for (let key in configuration.data) {
            const oneConf = configuration.data[key];
            if (!oneConf.metadata) {
                return false;
            }
        }
        return true;
    }
}

module.exports = {
    StepCheckSrc
};