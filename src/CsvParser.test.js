const fs = require('fs');
const { CsvParser } = require("./CsvParser");
const sortify = require("./sortify");

const myTest = () => {
    const cases = [
        { csv: "./data/case0.csv", json: "./data/case0.json", header: null, skipFirstLine: false },
        { csv: "./data/case1.csv", json: "./data/case1.json", header: "name;friends.0.name;friends.1.name;", skipFirstLine: false },
        { csv: "./data/case2.csv", json: "./data/case2.json", header: "name;friends.0.name;friends.1.name;", skipFirstLine: true },
        { csv: "./data/case3.csv", json: "./data/case3.json", header: "name;friends.0.name;friends.1.name|emptyStringIsNull;", skipFirstLine: true },
    ];

    const parser = new CsvParser();

    parser.registerFunction("emptyStringIsNull", (val) => {
        if (typeof val == "string" && val.trim().length == 0) {
            return null;
        }
        return val;
    });

    for (let i = 0; i < cases.length; i++) {
        const myCase = cases[i];
        const {
            csv, json
        } = myCase;
        const dataCsv = fs.readFileSync(csv, { encoding: "utf8" });
        const dataJson = JSON.parse(fs.readFileSync(json, { encoding: "utf8" }));

        const response = parser.parse(dataCsv, myCase.header, myCase.skipFirstLine);
        const myExpected = sortify(dataJson);
        const actual = sortify(response);
        if (actual !== myExpected) {
            throw Error(`expected:\n${myExpected}\nactual:\n${actual}`);
        } else {
            console.log(`case ${i + 1} OK!`);
        }
    }
};

myTest();