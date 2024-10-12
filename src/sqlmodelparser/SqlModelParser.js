
const { XMLParser } = require("fast-xml-parser");
const { MyUtilities } = require("../MyUtilities");
const { MyTemplate } = require("../MyTemplate");

class SqlModelParser {
    static parseTable() {

    }
    static parseTables(rawText) {
        const options = {
            ignoreAttributes: false,
        };
        const parser = new XMLParser(options);
        const xmlFlow = parser.parse(rawText);
        console.log(JSON.stringify(xmlFlow, null, 4));
    }
}

module.exports = {
    SqlModelParser
}