const { StepBasic } = require("./StepBasic");
const { SimpleObj } = require("../../SimpleObj");

class StepMultiple extends StepBasic {
    list = [];
    constructor(context, id, commandName, argsTxt) {
        super(context, id, commandName, argsTxt);
        super.alwaysEvaluateCanContinue = true;
    }
    completePaths(objeto, WORKSPACE) {
        if (!objeto) {
            return;
        }
        for (let llave in objeto) {
            let valor = objeto[llave];
            if (typeof valor == "string") {
                valor = valor.replaceAll("${WORKSPACE}", WORKSPACE);
                objeto[llave] = valor;
            }
        }
    }
    async execFirst() {
        // Reads the list to iterate
        this.list = SimpleObj.getValue(this.context.data, this.args[1], []);
        const WORKSPACE = SimpleObj.getValue(this.context.data, "env.WORKSPACE", "./");
        //console.log(`WORKSPACE=${WORKSPACE}`);
        //console.log(`My list ${JSON.stringify(this.list)}`);
        // Loads the draw.io file
        const flowChartTemplateName = this.args[0];
        const extraConfiguration = {
            Print: '${WORKSPACE}/flowcharts/multiple/flow01N.drawio',
        };
        this.completePaths(extraConfiguration, WORKSPACE);
        this.context.complementFlowChart(extraConfiguration);
    }

    async canContinue() {
        return true;
    }
}

module.exports = {
    StepMultiple
};