const fs = require('fs');
const { CsvFormatter } = require("./CsvFormatter");
const { CsvFormatterFilters } = require("./CsvFormatterFilters");
const { MyDates } = require('./MyDates');
const { MyTemplate } = require('./MyTemplate');

const myTest = () => {
    const dataset1 = [
        { name: "Ed", color: 1, friends: [{ name: "Bo" }, { name: "Elisa" }] },
        { name: null, color: 2, friends: [{ name: "Bo" }, {}] },
        { name: "Other\nNew", color: null, friends: [{ name: "B;o" }, {}] },
    ];

    const cases = [
        { data: dataset1, header: 'name', exp: "Ed;\n;\nOther New;\n", def: "" },
        { data: dataset1, header: 'name|noNewLine:"_"', exp: "Ed;\n;\nOther_New;\n", def: "" },
        { data: dataset1, header: 'friends.0.name', exp: "Bo;\nBo;\nB o;\n", def: "" },
        { data: dataset1, header: 'color|mapColor', exp: "red;\nblue;\nN/A;\n", def: "N/A" },
        { data: dataset1, header: 'noe', exp: "N/A;\nN/A;\nN/A;\n", def: "N/A" },
        { data: dataset1, header: 'friends.0.name', exp: "friends.0.name;\nBo;\nBo;\nB o;\n", def: "", useHeader: true },
    ];

    const myParser = new CsvFormatter();
    myParser.registerClass(CsvFormatterFilters);
    myParser.registerFunction("noNewLine", CsvFormatterFilters.noNewLine);
    myParser.registerFunction("mapColor", CsvFormatterFilters.map({ 1: "red", 2: "blue" }));
    myParser.setSeparator(";");

    for (let i = 0; i < cases.length; i++) {
        const myCase = cases[i];
        const myExpected = myCase.exp;
        const response = myParser.parse(myCase.data, myCase.header, myCase.useHeader, myCase.def);
        if (response !== myExpected) {
            throw Error(`expected ${JSON.stringify(myExpected)} actual ${JSON.stringify(response)}`);
        } else {
            console.log(`case ${i + 1} OK! ${JSON.stringify(myExpected)} equals ${JSON.stringify(response)}`);
        }
    }
}

function getRandomInt(min, max) {
    return Math.floor(min + Math.random() * max);
}

const generateLongCsv = (n) => {
    const data = [];
    for (let i = 0; i < n; i++) {
        const local = {};
        local.d1 = getRandomInt(0, 100);
        local.d2 = getRandomInt(0, 100);
        local.out = 0;
        data.push(local);
    }
    const myParser = new CsvFormatter();
    const response = myParser.parse(data, "d1;d2;out", true);

    const fecha = MyDates.getDayAsContinuosNumberHmmSSmmm(new Date());
    fs.writeFileSync(`./test/csv/test_${n}_${fecha}.csv`, response, { encoding: "utf8" });
};

const testComunidad = () => {
    const db = [
        {
            "uid": "pmVbGBVQVvhG6QEP0EcenbmvSSH3",
            "picture": "https://storage.googleapis.com/panal-comunidad-dev-public/profile/edelgado@panal.co/me",
            "email": "edelgado@panal.co",
            "bio": "Esta es mi biografía!",
            "versionchat": 20230418,
            "name": "Princess Peach",
            "search": [
                "edelgado@panal.co"
            ],
            "pushkey": {
                "2c14e44e-abed-40bb-8c4e-02c2d0f08c4d": "ExponentPushToken[9YfB6jJHu63Yhgt8ieQxRw]",
                "3f0d6cad-e387-4d17-8f04-7fdeeac42ad9": "ExponentPushToken[NULrDTKP-lH0YIlDDhiOjf]",
                "cacce296-c1da-4f24-9ea7-aa7e679f0af9": "ExponentPushToken[-Yb3drMHWy6zAr-SKHVQCw]",
                "d8814585-fe19-4472-854f-3a96d9a11ee9": "ExponentPushToken[5YxMh6Cu5_VjdLamJNloUu]"
            },
            "donorType": "3",
            "created": 1670861237000,
            "version": 8,
            "versionstatus": 20230601,
            "id": "edelgado@panal.co"
        }
    ];

    const myParser = new CsvFormatter();
    const STATUS = {
        "-1": "Miembro",
        "0": "Donador",
        "1": "Donador Silver",
        "2": "Donador Gold",
        "3": "Donador Black",
    };
    myParser.registerFunction("status", CsvFormatterFilters.map(STATUS));
    myParser.registerFunction("date", MyDates.toAAAAMMDDHHmmss);
    const response = myParser.parse(db, "email;\
    name;\
    donorType|status;\
    created|date\
    ", true);
    console.log(response);
}

const testRandom = () => {
    const db = {};
    const conditionalEngine = new MyTemplate();
    const myParser = new CsvFormatter();
    conditionalEngine.registerFunction("rand", CsvFormatterFilters.rand);
    for (let i = 0; i < 12; i++) {
        const response = conditionalEngine.computeIf('"hola ${prueba1|rand:1:2:3:4:5:6}"', db);
        console.log(response);
    }
};

//myTest();
//generateLongCsv(1000);
//testComunidad();
testRandom();