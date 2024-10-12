const { StepBasic } = require("./StepBasic");
const { SimpleObj } = require("../../SimpleObj");
const { IdGen } = require("../../IdGen");
const { encode, decode } = require("@msgpack/msgpack");

class StepProcess extends StepBasic {
    constructor(context, id, commandName, argsTxt) {
        super(context, id, commandName, argsTxt);
        super.alwaysEvaluateCanContinue = true;
    }
    async execFirst() {

        const partsName = /^([^\.\d]+)(\d*)\.?([^'.]*)$/.exec(this.args[0]);
        if (!partsName) {
            console.log(`The processor name ${this.args[0]} does not match ^([^\.\d]+)(\d*)\.?([^'.]*)$`);
            return false;
        }
        let method = "main";
        const processorMethod = partsName[0];
        const processorName = partsName[1];
        const instanceNumber = partsName[2];
        let processorInstance = partsName[1];
        if (typeof partsName[2] == "string") {
            processorInstance += instanceNumber;
        }
        if (typeof partsName[3] == "string" && partsName[3].trim().length > 0) {
            method = partsName[3];
        }
        this.configuration = SimpleObj.getValue(this.context.data, `state.processors.${processorName}`, null);
        if (!this.configuration) {
            this.configuration = {};
        }
        let channel = this.configuration.channel;
        if (!channel) {
            // Gets channel from parent
            channel = SimpleObj.getValue(this.context.data, `state.processors.channel`, "websocket");
        }

        let processorSocketId = null;
        let postUrl = null;
        const processorsModel = this.context.getProcessorsModel();
        if (channel == "websocket") {
            processorSocketId = SimpleObj.getValue(processorsModel.data, `state.processors.${processorName}.socket`, null);
            if (!processorSocketId) {
                console.log(`No client processor websocket for ${processorInstance}`);
                return false;
            }
        } else if (channel == "post") {
            postUrl = SimpleObj.getValue(processorsModel.data, `state.processors.${processorName}.postUrl`, null);
            if (!postUrl) {
                console.log(`No client postUrl for ${processorInstance}`);
                return false;
            }
        }

        // It reads the connection configuration
        const model = this.context.getSuperContextModel();

        const metadata = SimpleObj.getValue(model, `flowchart.flux.${processorInstance}.${method}.metadata`, {});
        if ('timeout' in metadata) {
            const timeout = parseFloat(metadata['timeout']);
            if (!isNaN(timeout)) {
                this.setTimeout(timeout);
            }
        }
        if ('retries' in metadata) {
            const retries = parseInt(metadata['retries']);
            if (!isNaN(retries)) {
                this.setMaxTries(retries);
            }
        }

        const inputConnectionsConf = SimpleObj.getValue(model, `flowchart.flux.${processorInstance}.${method}.in`, null);

        if (!inputConnectionsConf) {
            console.log(`WARN: No input connection flux configuration for ${processorInstance}.${method}`);
            //return false;
        }

        const inputs = [];
        const outputs = [];
        for (let i = 1; i < this.args.length; i++) {
            const sourcePair = this.args[i];
            const partsSource = /^(in|out):(b\.([^.]+)\.([^.]+)|d\.(.+))$/i.exec(sourcePair);
            if (partsSource == null) {
                console.log(`${sourcePair} doesn't match ^(in|out)\.(b\.([^.]+)\.([^.]+)|d\.(.+))$`);
                return false;
            }
            if (partsSource[1] == "in") {
                // It's an input
                const buffer = this.readInputFrom(!partsSource[5], partsSource[3], partsSource[4], partsSource[5]);
                if (buffer === undefined) {
                    return false;
                }
                inputs.push(buffer);
            } else {
                // Its an output
                outputs.push(partsSource[2]);
            }
        }

        const namedInputs = {};
        if (!!inputConnectionsConf) {
            for (let i = 0; i < inputConnectionsConf.length; i++) {
                const { key, val } = inputConnectionsConf[i];
                const buffer = this.resolveArgument(val);
                if (buffer === undefined) {
                    return false;
                }
                namedInputs[key] = buffer;
            }
        }

        const room = this.context.getRoom();
        //console.log(`StepProcess processorName:${processorName} processorInstance:${processorInstance} processorMethod:${processorMethod} in room ${room}`);
        this.messageUID = IdGen.num2ord(new Date().getTime());
        this.pendingCall = `${room}-${this.id}-${this.messageUID}`;
        this.context.registerPendingCall(this.pendingCall, this);
        const payload = {
            inputs,//Inputs
            namedInputs,
            outputs,//Outpus
            method,
            processorName,
            processorInstance,
            processorMethod,
            id: this.pendingCall,
            data: this.configuration[instanceNumber],
            room
        };

        if (channel == "websocket") {
            if (this.context.io) {
                this.context.io.to(processorSocketId).emit("process", payload);
            }
        } else if (channel == "queue") {
            // TODO use google library to sends via pub/sub
            const url = this.configuration.topicUrl;
        } else if (channel == "post") {
            const axios = this.context.getSuperContext().getAxios();
            const options = {
                headers: { "Content-Type": "application/octet-stream" }
            };
            const encoded = encode(payload);
            const buffer = Buffer.from(encoded);
            const postResponse = await axios.post(`${postUrl}/process`, buffer, options);
        } else {
            console.log("No channel configuration found!");
            return false;
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
    StepProcess
};