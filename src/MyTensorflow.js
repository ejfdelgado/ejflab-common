
//import * as tf from '@tensorflow/tfjs'
//import * as tfvis from "../../../node_modules/@tensorflow/tfjs-vis/dist/index.js";

const { CsvParser } = require("./CsvParser");

//3. Call front front end
//4. Add tfvisu...

class MyJSONTensorHandler {
    constructor(someModel) {
        this.someModel = someModel;
        this.listener = null;
    }
    setListener(callback) {
        this.listener = callback;
    }
    toArrayBuffer(buffer) {
        const arrayBuffer = new ArrayBuffer(buffer.length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < buffer.length; ++i) {
            view[i] = buffer[i];
        }
        return arrayBuffer;
    }
    load() {
        const modelJSON = this.someModel;
        const modelArtifacts = {
            modelTopology: modelJSON.modelTopology,
            format: modelJSON.format,
            generatedBy: modelJSON.generatedBy,
            convertedBy: modelJSON.convertedBy
        };
        if (modelJSON.weightsManifest != null) {
            const buffer = Buffer.from(modelJSON.weightsManifest[0].binary, "base64");
            modelArtifacts.weightSpecs = modelJSON.weightsManifest[0].weights;
            modelArtifacts.weightData = this.toArrayBuffer(buffer);
        }
        if (modelJSON.trainingConfig != null) {
            modelArtifacts.trainingConfig = modelJSON.trainingConfig;
        }
        if (modelJSON.userDefinedMetadata != null) {
            modelArtifacts.userDefinedMetadata = modelJSON.userDefinedMetadata;
        }
        return modelArtifacts;
    }
    save(modelArtifacts) {
        const binary = modelArtifacts.weightData;
        const weightsManifest = [{
            binary: Buffer.from(binary).toString("base64"),
            weights: modelArtifacts.weightSpecs
        }];
        const modelJSON = {
            modelTopology: modelArtifacts.modelTopology,
            weightsManifest,
            format: modelArtifacts.format,
            generatedBy: modelArtifacts.generatedBy,
            convertedBy: modelArtifacts.convertedBy
        };
        if (modelArtifacts.trainingConfig != null) {
            modelJSON.trainingConfig = modelArtifacts.trainingConfig;
        }
        if (modelArtifacts.userDefinedMetadata != null) {
            modelJSON.userDefinedMetadata = modelArtifacts.userDefinedMetadata;
        }
        if (typeof this.listener == "function") {
            this.listener(modelJSON);
        }
    }
}

class MyTensorflow {

    constructor() {
        console.log("Constructor MyTensorflow");
        this.myData = [];
        this.myTestData = [];
        this.metadata = null;
        this.model = null;
    }

    setMetadata(jsonMetadata) {
        this.metadata = jsonMetadata;
    }

    setData(textData) {
        const parser = new CsvParser();
        this.myData = parser.parse(textData, null, true);
    }

    setTestData(textTestData) {
        const parser = new CsvParser();
        this.myTestData = parser.parse(textTestData, null, true);
    }

    static clampZeroOne(val, min, max) {
        const tam = (max - min);
        let zeroBased = val - min;
        if (zeroBased < 0) {
            zeroBased = 0;
        }
        let zeroOne = zeroBased / tam;
        if (zeroOne > 1) {
            zeroOne = 1;
        }
        return zeroOne;
    }

    extractInputs(tf, data) {
        const inmetadata = this.metadata.in;
        return data.map((fila) => {
            const resp = [];
            for (let i = 0; i < inmetadata.length; i++) {
                const metadata = inmetadata[i];
                const val = fila[metadata.column];
                const clamped = MyTensorflow.clampZeroOne(val, metadata.min, metadata.max);
                resp.push(clamped);
            }
            return resp;
        });
    }

    extractOutput(tf, data) {
        const outmetadata = this.metadata.out;
        const outputs = data.map((fila) => {
            const val = fila[outmetadata.column];
            const zeroOne = MyTensorflow.clampZeroOne(val, outmetadata.min, outmetadata.max);
            const extended = zeroOne * (outmetadata.ngroups);
            let response = Math.floor(extended);
            if (response == outmetadata.ngroups) {
                response = outmetadata.ngroups - 1;
            }
            return response;
        });
        return outputs;
    }

    prepareData(tf, data) {
        return tf.tidy(() => {
            const outmetadata = this.metadata.out;
            tf.util.shuffle(data);
            const inputs = this.extractInputs(tf, data);
            const output = this.extractOutput(tf, data);
            const inputTensor = tf.tensor2d(inputs, [inputs.length, inputs[0].length]);
            const outputTensor = tf.oneHot(tf.tensor1d(output, 'int32'), outmetadata.ngroups);
            //inputTensor.print(true);
            //outputTensor.print(true);
            return {
                inputs: inputTensor,
                outputs: outputTensor,
            }
        });
    }

    async validate(tf) {
        if (this.model == null) {
            throw Error("No hay un modelo creado");
        }
        const {
            inputs,
            outputs,
        } = this.prepareData(tf, this.myTestData);
        const results = await this.model.evaluate(inputs, outputs, { batchSize: 2 });
        console.log('Accuracy is:')
        results[1].print();
    }

    async predict(tf, valores) {
        if (this.model == null) {
            throw Error("No hay un modelo creado");
        }
        const predProb = this.model.predict(tf.tensor2d([valores])).dataSync();
        console.log("predProb:" + JSON.stringify(predProb));
    }

    async fit(tf) {
        if (this.model == null) {
            throw Error("No hay un modelo creado");
        }
        const {
            inputs,
            outputs,
        } = this.prepareData(tf, this.myData);

        const X = inputs;
        const y = outputs;
        const data = this.metadata;
        await this.model.fit(X, y, data.fit);
    }

    compile(tf) {
        const data = this.metadata;
        const myCompile = Object.assign({}, data.compile, { optimizer: tf.train.adam(0.1) });
        this.model.compile(myCompile);
    }

    async getJsonModel(tf) {
        if (this.model == null) {
            throw Error("No hay un modelo creado");
        }
        return new Promise((resolve, reject) => {
            const saver = new MyJSONTensorHandler();
            saver.setListener(async (modelJson) => {
                resolve(modelJson);
            });
            this.model.save(saver);
        });
    }

    async setJsonModel(tf, modelJson) {
        const handler = new MyJSONTensorHandler(modelJson);
        this.model = await tf.loadLayersModel(handler);
        this.compile(tf);
    }

    async createJsonModel(tf) {
        const data = this.metadata;
        this.model = tf.sequential();

        for (let i = 0; i < data.layers.length; i++) {
            const actual = data.layers[i];
            const myLayer = {
                name: `hidden-layer-${i + 1}`,
                units: actual.units,
                activation: actual.activation
            }
            if (i == 0) {
                myLayer.inputShape = [data.in.length];
            }
            this.model.add(
                tf.layers.dense(myLayer)
            );
        }

        this.model.add(
            tf.layers.dense({
                units: data.out.ngroups,
                activation: "softmax"
            })
        );

        this.compile(tf);
    }
}

module.exports = {
    MyTensorflow
};