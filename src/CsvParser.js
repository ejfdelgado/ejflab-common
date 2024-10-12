const { CsvWithFilters } = require("./CsvWithFilters");
const { SimpleObj } = require("./SimpleObj");

class CsvParser extends CsvWithFilters {
    constructor() {
        super();
        this.sep = ";";
    }
    setSeparator(val) {
        this.sep = val;
    }
    parse(txt, header = null, skipFirstLine = false, defaultValue = null) {
        const SEPARATOR = new RegExp(`${this.sep}`, "g");
        const filas = txt.split(/(?:\r\n|\r|\n)/);
        let myHeader;
        if (typeof header == "string") {
            myHeader = header;
            if (skipFirstLine) {
                filas.splice(0, 1);
            }
        } else {
            // asume first line is header
            myHeader = filas.splice(0, 1)[0];
        }
        // Deduce columns
        const columnDesc = super.getColumnDescription(myHeader, this.sep);
        const resultado = [];
        for (let i = 0; i < filas.length; i++) {
            const fila = filas[i];
            const values = fila.split(SEPARATOR);
            let actual = {};
            for (let j = 0; j < columnDesc.length; j++) {
                const desc = columnDesc[j];
                if (j < values.length) {
                    let value = values[j];
                    value = super.filterValue(value, desc);
                    actual = SimpleObj.recreate(actual, desc.id, value);
                } else {
                    actual = SimpleObj.recreate(actual, desc.id, defaultValue);
                }

            }
            resultado.push(actual);
        }
        return resultado;
    }
}

module.exports = {
    CsvParser
}