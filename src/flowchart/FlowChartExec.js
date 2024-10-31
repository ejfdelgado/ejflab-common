const fs = require('fs');

const he = require('he');
const { XMLParser } = require("fast-xml-parser");
const { MyUtilities } = require("../MyUtilities");
const { MyTemplate } = require("../MyTemplate");
const { FlowChartDiagram } = require("../FlowChartDiagram.js");

const { StepSleep } = require("./steps/StepSleep");
const { StepOneTime } = require("./steps/StepOneTime");
const { StepIsTrue, StepIsFalse } = require("./steps/StepIsTrue");
const { StepCheckSrc } = require("./steps/StepCheckSrc");

const { CommandInc } = require("./steps/CommandInc");
const { CommandSet } = require("./steps/CommandSet");
const { StepReadSrc } = require('./steps/StepReadSrc');
const { StepTimeLineEnds } = require('./steps/StepTimeLineEnds');
const { StepTimeLineHasMore } = require('./steps/StepTimeLineHasMore');
const { StepProcess } = require('./steps/StepProcess');
const { CommandTimeline } = require('./steps/CommandTimeline');
const { CommandTimelineNext } = require('./steps/CommandTimelineNext');
const { CommandMilvus } = require('./steps/CommandMilvus');
const { StepCheckProcessor } = require('./steps/StepCheckProcessor');
const { MyColor } = require('../MyColor');
const { SimpleObj } = require("../SimpleObj");
const { CommandPrint } = require('./steps/CommandPrint');
const { CommandMongo } = require('./steps/CommandMongo');
const { CommandMinio } = require('./steps/CommandMinio');
const { CommandPostgres } = require('./steps/CommandPostgres.js');
const { StepMultiple } = require('./steps/StepMultiple.js');

class FlowChartExec {
    executionPromise = null;
    io = null;
    supercontext = null;
    data = {};
    instances = {};
    renderer = new MyTemplate();
    registry = {};
    flowchart = null;
    actualNodes = [];
    nodesById = {};
    conf = {
        debug: false,
        sleep: 100,
        retries: 4,
        timeout: 50 //seconds
    };
    bufferData = {};
    pendingsCalls = {};
    constructor() {
        // Arrows
        this.registry["sleep"] = StepSleep;
        this.registry["oneTime"] = StepOneTime;
        this.registry["isTrue"] = StepIsTrue;
        this.registry["isFalse"] = StepIsFalse;
        this.registry["checkSrc"] = StepCheckSrc;
        this.registry["readSrc"] = StepReadSrc;
        this.registry["timelineEnds"] = StepTimeLineEnds;
        this.registry["timelineHasMore"] = StepTimeLineHasMore;
        this.registry["process"] = StepProcess;
        this.registry["require"] = StepCheckProcessor;
        this.registry["multiple"] = StepMultiple;

        // Nodes
        this.registry["inc"] = CommandInc;
        this.registry["set"] = CommandSet;
        this.registry["timeline"] = CommandTimeline;
        this.registry["timelineNext"] = CommandTimelineNext;
        this.registry["milvus"] = CommandMilvus;
        this.registry["mongo"] = CommandMongo;
        this.registry["print"] = CommandPrint;
        this.registry["minio"] = CommandMinio;
        this.registry["postgres"] = CommandPostgres;
    }

    registerTimeline(id, timeline) {
        SimpleObj.recreate(this.data, `state.timelines.${id}`, timeline);
    }

    getTimeLine(id) {
        return SimpleObj.getValue(this.data, `state.timelines.${id}`, null);
    }

    saveBufferData(sourceId, pathId, buffer) {
        //console.log(`saveBufferData ${sourceId} ${pathId}`, buffer);
        if (!this.bufferData[sourceId]) {
            this.bufferData[sourceId] = {};
        }
        this.bufferData[sourceId][pathId] = buffer;
    }

    readBufferData(sourceId, pathId) {
        //console.log(`readBufferData ${sourceId} ${pathId}`);
        if (!this.bufferData[sourceId]) {
            this.bufferData[sourceId] = {};
        }
        return this.bufferData[sourceId][pathId];
    }

    registerPendingCall(id, val = true) {
        this.pendingsCalls[id] = val;
    }

    existsPendingCall(id) {
        return id in this.pendingsCalls;
    }

    clearPendingCall(id) {
        delete this.pendingsCalls[id];
    }

    async canRetry(id, error) {
        //console.log(`Check retry for ${error.message}...`);
        if (!this.existsPendingCall(id)) {
            return false;
        }
        const stepInstance = this.pendingsCalls[id];
        await stepInstance.handleError(error);
        if (stepInstance.reachMaxErrors()) {
            return false;
        } else {
            stepInstance.firstTime = true;
            return true;
        }
    }

    setSocketIO(io, room) {
        this.io = io;
        this.room = room;
    }

    getRoom() {
        return this.room;
    }

    getSuperContextModel() {
        const roomData = this.getSuperContext().getRoomLiveTupleModel(this.room);
        return roomData.model;
    }

    getProcessorsModel() {
        const roomData = this.getSuperContext().getRoomLiveTupleModel("processors");
        return roomData.model;
    }

    processFlowChart(xmlFlow, prefix = "") {
        const nodos = xmlFlow?.mxfile?.diagram?.mxGraphModel?.root?.mxCell;
        return FlowChartDiagram.processFlowChart(nodos, he, prefix);
    }

    interpretColor(nodes) {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.style && node.style.fillColor) {
                const hexColor = node.style.fillColor;
                const colorRGB = MyColor.colorhex2int(hexColor);
                if (colorRGB) {
                    const { r, g, b } = colorRGB;
                    const { h, s, v } = MyColor.rgb2hsv(r, g, b);
                    if (15 < s && 50 < v) {
                        if (77 < h && h < 145) {
                            node.feature = "green";
                        } else if (160 < h && h < 255) {
                            node.feature = "blue";
                        } else if (h < 31 || 340 < h) {
                            node.feature = "red";
                        }
                    }
                }
            }
        }
    }

    getFlowChartType(flowchart) {
        let type = "default";
        const { shapes } = flowchart;

        // Verifico si hay un nodo que diga type:algo
        for (let i = 0; i < shapes.length; i++) {
            const nodo = shapes[i];
            const { txt } = nodo;
            const partes = /^\s*type\s*:\s*(.*)$/.exec(txt);
            if (partes) {
                type = partes[1];
                break;
            }
        }
        return type;
    }

    processFluxChart(flowchart) {
        const { shapes } = flowchart;
        const connections = {};
        // Iterate shapes
        shapes.forEach((node) => {
            node.mode = "flux";
            const { txt } = node;
            const lines = txt.split(/\r?\n/).filter((line) => {
                return line.trim().length > 0;
            });
            const partes = /^\s*([a-zA-Z]+\d*|[a-zA-Z]+\d*\.[a-zA-Z]+)$/.exec(lines[0]);
            if (partes) {
                // Define un processor
                let keyProcessor = partes[1];
                const inputArrows = this.getInputArrows(node, flowchart);
                const outputArrows = this.getOutputArrows(node, flowchart);
                //console.log(`${keyProcessor} in x: ${inputArrows.length} out x: ${outputArrows.length}`);
                const currentConnections = {
                    in: [],
                    out: [],
                    metadata: {},
                };
                if (keyProcessor.indexOf(".") < 0) {
                    connections[keyProcessor + ".main"] = currentConnections;
                } else {
                    connections[keyProcessor] = currentConnections;
                }
                const processArrow = (isInput, arrow) => {
                    const { src, tar } = arrow;
                    let idNode;
                    if (isInput) {
                        idNode = src;
                    } else {
                        idNode = tar;
                    }
                    const referencedNode = this.getNodesWithId(idNode, flowchart)[0];
                    if (referencedNode) {
                        const partesOrigen = /^\s*([^:]+)\s*:\s*([a-zA-Z\.\d_]+)$/.exec(referencedNode.txt);
                        if (partesOrigen) {
                            const argName = partesOrigen[1];
                            const argValue = partesOrigen[2];
                            if (isInput) {
                                currentConnections.in.push({ key: argName, val: argValue });
                            } else {
                                currentConnections.out.push({ key: argName, val: argValue });
                            }
                        } else {
                            console.log(`Err: No match ${referencedNode.txt}`);
                        }
                    } else {
                        console.log(`Err in idNode ${idNode}`)
                    }
                };
                inputArrows.forEach((arrow) => {
                    processArrow(true, arrow);
                });
                outputArrows.forEach((arrow) => {
                    processArrow(false, arrow);
                });
                // Read extra argument if they exists
                for (let k = 1; k < lines.length; k++) {
                    const someLine = lines[k];
                    const paramGroups = /^\s*([^:]+):(.+)$/.exec(someLine);
                    if (paramGroups) {
                        const paramName = paramGroups[1];
                        const paramValue = paramGroups[2];
                        currentConnections.metadata[paramName] = paramValue;
                    }
                }
            }
        });
        return connections;
    }

    checkTypeOfChart(flowchart) {
        const type = this.getFlowChartType(flowchart);
        const response = {};
        if (type == "flux") {
            response.flux = this.processFluxChart(flowchart);
        }
        return response;
    }

    loadFlowChart(paths) {
        return this.loadFlowChartInternal(paths, true);
    }

    complementFlowChart(paths, indexPath) {
        console.log("complementFlowChart...");
        return this.loadFlowChartInternal(paths, false, indexPath);
    }

    loadFlowChartInternal(paths, initialize, indexPath) {
        if (initialize) {
            this.flowchart = {
                shapes: [],
                arrows: [],
                prefixes: [],
                flux: {},
            };
            this.nodesById = {};
        }
        const options = {
            ignoreAttributes: false,
        };
        const llaves = Object.keys(paths);
        llaves.forEach((prefix) => {
            // Get index Number from prefix if matches the pattern
            const prefixGroupsNumber = /_([\d]+)$/.exec(prefix);
            let index = null;
            if (prefixGroupsNumber) {
                index = parseInt(prefixGroupsNumber[1]);
            }
            const path = paths[prefix];
            const xmlFlowText = fs.readFileSync(path, 'utf8');
            const parser = new XMLParser(options);
            const xmlFlow = parser.parse(xmlFlowText);
            const localFlowChart = this.processFlowChart(xmlFlow, prefix);
            this.interpretColor(localFlowChart.shapes);
            // 
            const check = this.checkTypeOfChart(localFlowChart);
            if (typeof indexPath == "string" && !isNaN(index)) {
                // Write metadata of node
                const placeMetadata = (node) => {
                    node.indexPath = indexPath;
                    SimpleObj.recreate(node, `meta.${indexPath}`, index);
                }
                localFlowChart.shapes.forEach(placeMetadata);
                localFlowChart.arrows.forEach(placeMetadata);
            }
            this.flowchart.shapes.push(...localFlowChart.shapes);
            this.flowchart.arrows.push(...localFlowChart.arrows);
            this.flowchart.prefixes.push(prefix);
            if (check.flux) {
                for (let key in check.flux) {
                    this.flowchart.flux[key] = check.flux[key];
                }
            }
        });

        // Se indexan los nodos por id
        const BLACK_LIST = ["flux"];
        this.flowchart.shapes.forEach((node) => {
            if (BLACK_LIST.indexOf(node.mode) < 0) {
                this.nodesById[node.id] = node;
            }
        });
        if (this.conf.debug === true) {
            console.log(JSON.stringify(this.flowchart, null, 4));
        }
        return this.flowchart;
    }

    setData(data) {
        this.data = data;
    }

    getData() {
        return this.data;
    }

    setSuperContext(supercontext) {
        this.supercontext = supercontext;
    }

    getSuperContext() {
        return this.supercontext;
    }

    createInstance(commandName, nodeId, argsTxt, args) {
        //console.log(`Creating instance with ${JSON.stringify(args)}`);
        const reference = this.registry[commandName];
        if (!reference) {
            throw new Error(`No step registered for ${commandName} in node id ${nodeId}`);
        }
        const instance = new reference(this, nodeId, commandName, argsTxt);
        let timeout = this.conf.timeout;
        let retries = this.conf.retries;
        instance.setTimeout(timeout);
        instance.setMaxTries(retries);
        //console.log(`Using timeout:${timeout}s retries:${retries}`);
        return instance;
    }

    interpretArguments(argTxt) {
        //console.log(`Interpret ${argTxt}`);
        const tokens = argTxt.split(";");
        const args = [];
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            // Interpret with template
            if (token.trim().length > 0) {
                const rendered = this.renderer.render(token, this.data);
                let value;
                try {
                    value = eval(rendered);
                } catch (err) {
                    console.log(`Error parsing ${typeof rendered} ${rendered}`);
                    throw err;
                }
                args.push(value);
            }
        }
        return args;
    }

    async executeAsNode(node) {
        const { id, txt } = node;
        if (txt == undefined || txt == null || txt.trim().length == 0) {
            return true;
        }
        let index = 0;
        const answered = await MyUtilities.replaceAsync2(txt, /(([a-z]+)«([^»]*)»)/ig, async (match, g1, commandName, argsTxt) => {
            const args = this.interpretArguments(argsTxt);
            let instance = this.createInstance(commandName, id, txt, args);
            index++;
            const response1 = `${commandName}${JSON.stringify(args)}`;
            const { canContinue, abort } = await instance.executeAsNode(args, argsTxt);
            if (abort) {
                // Panic and halt all
                this.mustEnd = true;
            }
            return [response1, canContinue];
        });
        if (this.conf.debug === true) {
            console.log(`${id})\n${txt}\n${answered.first}`);
        }
    }

    async executeAsArrow(node) {
        const { id, txt } = node;
        if (txt == undefined || txt == null || txt.trim().length == 0) {
            return true;
        }
        let create = false;
        if (!(id in this.instances)) {
            create = true;
            this.instances[id] = {};
        }
        let index = 0;
        const answered = await MyUtilities.replaceAsync2(txt, /(([a-z]+)«([^»]*)»)/ig, async (match, g1, commandName, argsTxt) => {
            const args = this.interpretArguments(argsTxt);
            let instance = null;
            if (create || !this.instances[id][`${index}`]) {
                instance = this.createInstance(commandName, id, txt, args);
                this.instances[id][`${index}`] = instance;
            } else {
                instance = this.instances[id][`${index}`];
                if (!instance) {
                    throw Error(`Can't find instance at id:${id} index:${index} at commandName:${txt} in ${commandName}`);
                }
            }
            index++;
            const response1 = `${commandName}${JSON.stringify(args)}`;
            const { canContinue, abort } = await instance.executeAsArrow(args, argsTxt);
            if (abort) {
                // Panic and halt all
                this.mustEnd = true;
            }
            return [response1, canContinue];
        });
        if (this.conf.debug === true) {
            console.log(`${id})\n${txt}\n${answered.first}\n${answered.second}`);
        }
        const canContinue = eval(answered.second);
        if (canContinue) {
            // Delete only those instances that can be deleted
            const instances = this.instances[id];
            const llaves = Object.keys(instances);
            const promesasAccepted = [];
            llaves.forEach((llave, i) => {
                const instance = instances[llave];
                promesasAccepted.push(instance.arrowAccepted());
            });
            await Promise.all(promesasAccepted);
            const promesasDestroy = [];
            llaves.forEach((llave, i) => {
                const instance = instances[llave];
                if (instance.autoDelete == true) {
                    promesasDestroy.push(new Promise(async (resolve, reject) => {
                        try {
                            await instances[llave].destroy();
                            delete instances[llave];
                            resolve();
                        } catch (err) {
                            reject(err);
                        }
                    }));
                }
            });
            await Promise.all(promesasDestroy);
        }
        return canContinue;
    }

    async sleep(milis) {
        if (milis == 0) {
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, milis);
        });
    }

    getNodesWithText(name, type = ["ellipse", "box"], flowchart = null) {
        if (!flowchart) {
            flowchart = this.flowchart;
        }
        return flowchart.shapes.filter((value) => {
            if (typeof value.txt == "string") {
                return name == value.txt.trim() && type.indexOf(value.type) >= 0;
            }
        });
    }

    getNodesWithId(id, flowchart = null) {
        if (!flowchart) {
            flowchart = this.flowchart;
        }
        return flowchart.shapes.filter((value) => {
            return id == value.id
        });
    }

    getOutputArrows(node, flowchart = null) {
        if (!flowchart) {
            flowchart = this.flowchart;
        }
        const { id } = node;
        return flowchart.arrows.filter((value) => {
            return value.src == id;
        })
    }

    getInputArrows(node, flowchart = null) {
        if (!flowchart) {
            flowchart = this.flowchart;
        }
        const { id } = node;
        return flowchart.arrows.filter((value) => {
            return value.tar == id;
        })
    }

    setConf(conf) {
        Object.assign(this.conf, conf);
    }

    async pause() {
        if (!this.executionPromise) {
            return;
        }
        this.isPaused = true;
        await this.executionPromise;
        this.executionPromise = null;
    }

    async stop() {
        const hasPromise = (!!this.executionPromise);
        //console.log(`FlowChartExec.stop() ${hasPromise}`);
        let callbackRef = null;
        this.isPaused = true;
        if (hasPromise) {
            const { callback } = await this.executionPromise;
            callbackRef = callback;
            this.executionPromise = null;
        }
        this.tempHistory = [];
        this.tempHistoryIncommingArrows = {};
        this.status = {
            currentNodes: [],
            history: [],
        };
        this.bufferData = {};
        this.pendingsCalls = {};
        if (callbackRef) {
            callbackRef(this.status);
        }
    }

    isRunning() {
        return this.executionPromise !== null;
    }

    async executeIteration(callback) {
        if (this.isRunning()) {
            console.log("Can't start if it's running.");
            return;
        }
        this.executionPromise = this.executeIterationLocal(callback);
        return this.executionPromise;
    }

    async executeIterationLocal(callback) {
        console.log("executeIterationLocal...");
        let status;
        if (this.actualNodes.length == 0) {
            // Se debe relanzar todo
            this.startDate = new Date().getTime();
            this.mustEnd = false;
            this.isPaused = false;
            this.tempHistory = [];
            this.tempHistoryIncommingArrows = {};
            this.instances = {};
            status = {
                currentNodes: [],
                history: [],
            };
            // Search starting points
            this.actualNodes = this.getNodesWithText("start");
            if (this.actualNodes.length == 0) {
                console.log(`WARN: No start nodes found`);
            } else {
                console.log(`Found ${this.actualNodes.length} start points`);
            }
            this.status = status;
        } else {
            status = this.status;
        }

        const addToHistory = (id) => {
            if (this.tempHistory.indexOf(id) < 0) {
                this.tempHistory.push(id);
                status.history.push({ id });
            }
        };
        const addCurrentNodeTo = (id, list) => {
            if (list.indexOf(id) < 0) {
                list.push(id);
            }
        };
        const removeCurrentNodeFrom = (id, list) => {
            const index = list.indexOf(id);
            if (index >= 0) {
                list.splice(index, 1);
            }
        };
        do {
            status.currentNodes = [];
            const promesas = [];
            //loop
            this.actualNodes.forEach((node) => {
                addCurrentNodeTo(node.id, status.currentNodes);
                addToHistory(node.id);
                //search outside arrows and checkthem
                const outputArrows = this.getOutputArrows(node);
                //console.log(`Found ${outputArrows.length} output arrows`);
                outputArrows.forEach((arrow) => {
                    promesas.push(new Promise(async (resolve) => {
                        try {
                            const canContinue = await this.executeAsArrow(arrow);
                            if (canContinue) {
                                removeCurrentNodeFrom(node.id, status.currentNodes);
                                addToHistory(arrow.id);
                                // Agrego la evidencia que el nodo tar recibe la flecha id
                                if (!this.tempHistoryIncommingArrows[arrow.tar]) {
                                    this.tempHistoryIncommingArrows[arrow.tar] = [];
                                }
                                this.tempHistoryIncommingArrows[arrow.tar].push(arrow.id);
                            }
                            resolve(
                                {
                                    node,
                                    arrow,
                                    canContinue,
                                    error: false,
                                }
                            );
                        } catch (err) {
                            console.log(err);
                            resolve(
                                {
                                    error: err,
                                }
                            );
                        }
                    }));
                });
            });

            //If any outside arrow is true, then remove node and add new node
            const responses = await Promise.all(promesas);

            const newNodes = [];
            responses.forEach((respose) => {
                const { node, arrow, canContinue, error } = respose;
                if (error !== false) {
                    // Arrow fail
                    // Maybe handle to set maximum retries and exponetial back off
                    // Add visibility in somewhere
                    console.log(error);
                } else {
                    if (canContinue) {
                        // Saco el nodo
                        removeCurrentNodeFrom(node, this.actualNodes);
                        // Busco el destino de la flecha y lo agrego a los pendientes
                        const { tar } = arrow;
                        const nextNode = this.nodesById[tar];
                        const oldIndex = this.actualNodes.indexOf(nextNode);
                        if (nextNode && oldIndex < 0) {
                            // Si es un nodo green, chequeo que todas las flechas entrantes estén hechas
                            if (nextNode.feature == "green") {
                                // Leo las flechas que llegan aquí
                                const incomingArrows = this.getInputArrows(nextNode);
                                let allDone = true;
                                if (this.tempHistoryIncommingArrows[nextNode.id]) {
                                    for (let k = 0; k < incomingArrows.length; k++) {
                                        const incomingArrow = incomingArrows[k];
                                        if (this.tempHistoryIncommingArrows[nextNode.id].indexOf(incomingArrow.id) < 0) {
                                            allDone = false;
                                            break;
                                        }
                                    }
                                }
                                if (allDone) {
                                    this.actualNodes.push(nextNode);
                                    newNodes.push(nextNode);
                                }
                            } else {
                                this.actualNodes.push(nextNode);
                                newNodes.push(nextNode);
                            }
                        }
                    }
                }
            });

            // Execute new nodes
            for (let i = 0; i < newNodes.length; i++) {
                const node = newNodes[i];
                addCurrentNodeTo(node.id, status.currentNodes);
                addToHistory(node.id);
                try {
                    await this.executeAsNode(node);
                    if (node.feature == "green") {
                        this.tempHistoryIncommingArrows[node.id] = [];
                    }
                    if (node.txt == "end") {
                        this.mustEnd = true;
                    }
                    if (["ok", "end"].indexOf(node.txt.toLocaleLowerCase()) >= 0) {
                        removeCurrentNodeFrom(node, this.actualNodes);
                    }
                } catch (err) {
                    // Node fail
                    // Maybe handle to set maximum retries and exponetial back off
                    // Add visibility in somewhere
                    console.log(err);
                }
            }
            await this.sleep(this.conf.sleep);
            //Finish when no more nodes are in the list
            await callback(status);
        } while (this.actualNodes.length > 0 && !this.mustEnd && !this.isPaused);
        this.executionPromise = null;

        return {
            callback
        };
    }

    static async test() {
        const pruebas = [
            {
                conf: { sleep: 500, debug: false },
                data: {
                    person: {
                        name: "Edgar",
                        age: 38,
                        male: true
                    }
                },
                flowchartUrl: {
                    "": "../../src/assets/flowcharts/flow01.drawio",
                    "Step": "../../src/assets/flowcharts/flow01b.drawio"
                }
            }
        ];

        for (let i = 0; i < pruebas.length; i++) {
            const prueba = pruebas[i];
            const { nodes, conf, data, flowchartUrl } = prueba;
            const instance = new FlowChartExec();
            instance.setConf(conf);
            instance.setData(data);
            instance.loadFlowChart(flowchartUrl);
            await instance.executeIteration(async (status) => {
                console.log(JSON.stringify(status, null, 4));
            });
            console.log(JSON.stringify(data, null, 4));
        }
    }
}

//FlowChartExec.test();

module.exports = {
    FlowChartExec
}