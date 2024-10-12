class CsvFormatterFilters {
    static randomMemory = {};
    static formatRandomMemory() {
        console.log("Formating random memory");
        CsvFormatterFilters.randomMemory = {};
    }
    static parseInt(valor, myDefault = NaN) {
        const temp = parseInt(valor);
        if (isNaN(temp)) {
            return myDefault;
        } else {
            return temp;
        }
    }
    static parseFloat(valor, myDefault = NaN) {
        const temp = parseFloat(valor);
        if (isNaN(temp)) {
            return myDefault;
        } else {
            return temp;
        }
    }
    static json(valor) {
        return JSON.stringify(valor);
    }
    static rand(val, ...args) {
        let listaBase = args;
        if (!(listaBase instanceof Array)) {
            return "";
        }
        const keyMemory = val;
        let lista = CsvFormatterFilters.randomMemory[keyMemory];
        if (!(lista instanceof Array) || lista.length == 0) {
            lista = [...listaBase];
            CsvFormatterFilters.randomMemory[keyMemory] = lista;
        }
        const random = Math.random();
        //console.log(`random = ${random}`);
        const myRandom = Math.floor(random * lista.length);
        let choosed = "" + lista[myRandom];
        // Se saca de la lista
        lista.splice(myRandom, 1);
        if (/^\s*true\s*$/i.exec(choosed) !== null) {
            choosed = true;
        } else if (/^\s*false\s*$/i.exec(choosed) !== null) {
            choosed = false;
        } else if (/^\s*\d+\s*$/.exec(choosed) !== null) {
            choosed = parseInt(choosed);
        }
        return choosed;
    }
    static testRandom() {
        const lista = ["a", "b"];
        for (let i = 0; i < 10; i++) {
            console.log(CsvFormatterFilters.rand(lista));
        }
    }
    static map(myMap) {
        return (key) => {
            return myMap[key];
        }
    }
    static noNewLine(valor, replacer = "") {
        if (typeof valor == "string") {
            return valor.replace(/(?:\r\n|\r|\n)/g, replacer);
        }
        return valor;
    }
    static replace(valor, pattern, replacer = "") {
        if (typeof valor == "string") {
            return valor.replace(pattern, replacer);
        }
        return valor;
    }
}

module.exports = {
    CsvFormatterFilters
}