const { MyTensorflow } = require("./MyTensorflow");
const tf = require('@tensorflow/tfjs');
const fs = require('fs');

const test = async () => {

    const csvText = fs.readFileSync("./data/tensordata.csv", { encoding: "utf8" });
    const csvTestText = fs.readFileSync("./data/tensordata.test.csv", { encoding: "utf8" });
    const jsonMeta = JSON.parse(fs.readFileSync("./data/tensordata.json", { encoding: "utf8" }));

    const tensorflow = new MyTensorflow();
    tensorflow.setMetadata(jsonMeta);
    tensorflow.setData(csvText);
    tensorflow.setTestData(csvTestText);
    await tensorflow.run(tf);
    await tensorflow.validate(tf);
}

test();