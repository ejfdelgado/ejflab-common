import * as tf from '@tensorflow/tfjs-node'
import { MyTensorflow } from "./MyTensorflow.js";
import fs from 'fs'

export default class MyTensorflowBack extends MyTensorflow {
    static async test() {
        const csvText = fs.readFileSync("./data/tensordata.csv", { encoding: "utf8" });
        const csvTestText = fs.readFileSync("./data/tensordata.test.csv", { encoding: "utf8" });
        const jsonMeta = JSON.parse(fs.readFileSync("./data/tensordata.json", { encoding: "utf8" }));
        const jsonModel = JSON.parse(fs.readFileSync("./data/tensormodel.json", { encoding: "utf8" }));

        let tensorflow = new MyTensorflowBack();
        tensorflow.setMetadata(jsonMeta);
        tensorflow.setData(csvText);
        tensorflow.createJsonModel(tf);
        await tensorflow.fit(tf);

        //const jsonModel = await tensorflow.getJsonModel(tf);
        //console.log(JSON.stringify(jsonModel, null, 4));
        tensorflow = new MyTensorflowBack();
        tensorflow.setMetadata(jsonMeta);
        tensorflow.setData(csvText);
        tensorflow.setTestData(csvTestText);
        await tensorflow.setJsonModel(tf, jsonModel);

        await tensorflow.fit(tf);

        await tensorflow.validate(tf);
        await tensorflow.predict(tf, [0, 0]);
    }
}

MyTensorflowBack.test();