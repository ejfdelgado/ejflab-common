const { SimpleObj } = require("../../SimpleObj");

class StepBasic {
    maxErrorCount = 3;
    timeOutMillis = 60000;
    //
    firstTime = true;
    fired = false;
    // Si ya evaluó a true no debe volver a invocar canContinue
    alwaysEvaluateCanContinue = true;
    autoDelete = true;
    args = [];
    lastErrorTime = null;
    errorCount = 0;
    nextTry = null;
    commandName;
    argsTxt;
    fireTime;
    constructor(context, id, commandName, argsTxt) {
        this.context = context;
        this.id = id;
        this.commandName = commandName;
        this.argsTxt = argsTxt;
    }
    setTimeout(value) {
        this.timeOutMillis = value * 1000;
    }
    setMaxTries(value) {
        this.maxErrorCount = value;
    }
    async executeAsNode(args) {
        const answer = {
            canContinue: false,
            abort: false,
        };
        if (this.reachMaxErrors()) {
            answer.abort = true;
            const message = `Abort at ${this.argsTxt} after ${this.errorCount} retries.`;
            const room = this.context.getRoom();
            this.context.io.to(room).emit("myerror", { origin: "StepBasic.executeAsNode", message: message });
            return answer;
        }
        if (typeof this.nextTry == "number") {
            const ahora = new Date().getTime();
            if (ahora <= this.nextTry) {
                return answer;
            }
        }
        try {
            this.args = args;
            await this.execFirst();
            await this.execLast({ isCommand: true });
            answer.canContinue = true;
            this.resetErrorState();
            return answer;
        } catch (err) {
            this.handleError(err);
            answer.canContinue = false;
            return answer;
        }
    }
    async executeAsArrow(args) {
        const answer = {
            canContinue: false,
            abort: false,
        };
        if (this.reachMaxErrors()) {
            answer.abort = true;
            const message = `Abort at ${this.argsTxt} after ${this.errorCount} retries.`;
            const room = this.context.getRoom();
            this.context.io.to(room).emit("myerror", { origin: "StepBasic.executeAsArrow", message: message });
            return answer;
        }
        if (typeof this.nextTry == "number") {
            const ahora = new Date().getTime();
            if (ahora <= this.nextTry) {
                return answer;
            }
        }
        try {
            this.args = args;
            if (this.alwaysEvaluateCanContinue == false) {
                if (this.fired) {
                    answer.canContinue = true;
                    return answer;
                }
            }
            if (this.firstTime) {
                const done = await this.execFirst();
                if (done === false) {
                    return answer;
                }
                this.firstTime = false;
                this.fireTime = new Date().getTime();
            }
            answer.canContinue = await this.canContinue();
            if (answer.canContinue) {
                await this.execLast();
                this.fired = true;
                this.resetErrorState();
            } else {
                //Check ellapsed time
                const now = new Date().getTime();
                const duration = now - this.fireTime;
                if (duration > this.timeOutMillis) {
                    const message = `Timeout for ${this.argsTxt} after ${duration} milliseconds`;
                    // It breaks the timeout threshold
                    // Erase the pendig call to ignore eventual arrive of response...
                    if (!this.context.canRetry(this.pendingCall, new Error(message))) {
                        this.context.stop();
                        return;
                    } else {
                        this.context.clearPendingCall(this.pendingCall);
                    }
                }
            }

            return answer;
        } catch (err) {
            this.handleError(err);
            answer.canContinue = false;
            return answer;
        }
    }
    reachMaxErrors() {
        const reached = this.errorCount >= this.maxErrorCount;
        return reached;
    }
    resetErrorState() {
        this.errorCount = 0;
        this.lastErrorTime = null;
        this.nextTry = null;
    }
    async handleError(error) {
        const { stack } = error;
        this.errorCount++;
        this.lastErrorTime = new Date().getTime();
        const room = this.context.getRoom();
        if (!this.reachMaxErrors()) {
            const delay = 1000 * Math.exp(this.errorCount) / Math.exp(1);
            this.nextTry = delay + this.lastErrorTime;
            const message = `Error at ${this.argsTxt} #${this.errorCount}. Retrying in ${delay.toFixed(0)} ms.  ${stack}`;
            this.context.io.to(room).emit("myerror", { origin: "StepBasic", message: message });
        } else {
            const message = `Error at ${this.argsTxt} #${this.errorCount}. ${stack}`;
            this.context.io.to(room).emit("myerror", { origin: "StepBasic", message: message });
        }
    }
    async execFirst() { }
    async canContinue() { return true; }
    async execLast() { }
    async arrowAccepted() { }
    async destroy() { }

    readInputFrom(isBuffer, sourceId, pathId, completePath) {
        let buffer = null;
        if (isBuffer) {
            // It reads from buffer
            buffer = this.context.readBufferData(sourceId, pathId);
            if (!buffer) {
                console.log(`No buffer in ${sourceId} ${pathId}`);
                return undefined;
            }
        } else {
            // It reads from data model
            buffer = SimpleObj.getValue(this.context.data, completePath, null);
        }
        return buffer;
    }

    resolveArgument(val) {
        const partsSource = /^(b\.([^.]+)\.([^.]+)|d\.(.+))$/i.exec(val);
        if (partsSource == null) {
            console.log(`${val} doesn't match ^(b\.([^.]+)\.([^.]+)|d\.(.+))$`);
            return undefined;
        }
        const buffer = this.readInputFrom(!partsSource[4], partsSource[2], partsSource[3], partsSource[4]);
        return buffer;
    }
}

module.exports = {
    StepBasic
}