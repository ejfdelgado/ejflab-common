
class CsvWithFilters {
    static PATTERN_FILTER = "\\s*([^|\\s]+)(\\s*\\|\\s*([^:\\s]+)\\s*(\\s*:\\s*([^:\\s]+)*)?)?";
    constructor() {
        this.filterRegistry = {
            classes: {

            },
            methods: {

            },
        };
    }
    registerClass(name, myClass) {
        if (name) {
            this.filterRegistry.classes[name] = myClass;
            console.log(`registerClass(${name}) OK`);
        }
    }
    registerFunction(key, myFunction) {
        if (typeof myFunction == "function") {
            this.filterRegistry.methods[key] = myFunction;
            //console.log(`registerFunction(${key}) OK`);
        }
    }
    filterValue(valor, columna, dato, defaultBase) {
        if (columna.theclass && columna.theclass in this.filterRegistry.classes) {
            const oneclass = this.filterRegistry.classes[columna.theclass];
            if (columna.themethod) {
                const onemethod = oneclass[columna.themethod];
                if (typeof onemethod == "function") {
                    let myarguments = [];
                    if (columna.useRow) {
                        myarguments.push(dato);
                    } else {
                        myarguments.push(valor);
                    }
                    myarguments = myarguments.concat(columna.argumentos);
                    valor = onemethod(...myarguments);
                }
            }
        } else if (columna.themethod && columna.themethod in this.filterRegistry.methods) {
            const onemethod = this.filterRegistry.methods[columna.themethod];
            let myarguments = [];
            if (columna.useRow) {
                myarguments.push(dato);
            } else {
                myarguments.push(valor);
            }
            if (["rand"].indexOf(columna.themethod) >= 0) {
                if (myarguments[0] === undefined) {
                    myarguments[0] = defaultBase;
                }
            }
            myarguments = myarguments.concat(columna.argumentos);
            valor = onemethod(...myarguments);
        }
        return valor;
    }
    getColumnDescription(header, separator = ";") {
        const columnas = [];
        const patron = new RegExp(`([^${separator}]+)`, "g");
        let partes = null;
        do {
            partes = patron.exec(header);
            if (partes !== null) {
                const completo = partes[1];
                const patron2 = new RegExp(CsvWithFilters.PATTERN_FILTER, "g");
                const subpartes = patron2.exec(completo);
                if (subpartes !== null) {
                    const desc = {
                        id: subpartes[1],
                        useRow: false,
                    };
                    if (subpartes[3] !== undefined) {
                        let subpartes3 = subpartes[3];
                        if (subpartes3[subpartes3.length - 1] == "*") {
                            subpartes3 = subpartes3.substring(0, subpartes3.length - 1);
                            desc.useRow = true;
                        }
                        let classMethod = subpartes3.split(".");
                        if (classMethod.length == 1) {
                            desc.themethod = classMethod[0];
                        } else {
                            desc.theclass = classMethod[0];
                            desc.themethod = classMethod[1];
                        }
                        const argumentos = [];
                        if (subpartes[5]) {
                            argumentos.push(JSON.parse(subpartes[5]));
                            let siguiente = null;
                            siguiente = patron2.exec(completo);
                            if (siguiente !== null) {
                                siguiente[0].split(":").map((siguienteFixed) => {
                                    if (siguienteFixed.trim().length > 0) {
                                        argumentos.push(JSON.parse(siguienteFixed));
                                    }

                                });
                            }
                        }
                        desc.argumentos = argumentos;
                    }
                    columnas.push(desc);
                }
            }
        } while (partes !== null);
        return columnas;
    }
};

module.exports = {
    CsvWithFilters
}