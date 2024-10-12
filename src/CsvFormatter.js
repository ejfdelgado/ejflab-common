const { CsvWithFilters } = require("./CsvWithFilters");
const { SimpleObj } = require("./SimpleObj");

class CsvFormatter extends CsvWithFilters {
    constructor() {
        super();
        this.sep = ";"
    }
    setSeparator(val) {
        this.sep = val;
    }
    parse(data, header, addHeader = false, defaultValue = "") {
        const NO_SEPARATOR = new RegExp(`${this.sep}`, "g");
        const columnas = super.getColumnDescription(header, this.sep);

        let myCSV = "";
        //Add header
        if (addHeader === true) {
            for (let j = 0; j < columnas.length; j++) {
                const columna = columnas[j];
                myCSV += `${columna.id};`
            }
            myCSV += "\n";
        }

        //Add body
        for (let i = 0; i < data.length; i++) {
            const dato = data[i];
            for (let j = 0; j < columnas.length; j++) {
                const columna = columnas[j];
                const llaveCampo = columna.id;
                let valor = SimpleObj.getValue(dato, llaveCampo, defaultValue)
                valor = super.filterValue(valor, columna, dato);
                if ([null, undefined].indexOf(valor) >= 0) {
                    valor = defaultValue;
                }
                if (typeof valor == "string") {
                    // always remove new lines
                    valor = valor.replace(/(?:\r\n|\r|\n)/g, " ");
                }
                let tempVal = `${valor}`;
                tempVal = tempVal.replace(NO_SEPARATOR, " ");// maybe use "" for strings?
                myCSV += `${tempVal}${this.sep}`;
            }
            myCSV += "\n";
        }

        return myCSV;
    }
}

module.exports = {
    CsvFormatter
};