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
        // console.log(`StepMultiple ${JSON.stringify(this.args)}`);
        // Reads the list to iterate
        const room = this.context.getRoom();
        this.list = SimpleObj.getValue(this.context.data, this.args[1], []);
        const WORKSPACE = SimpleObj.getValue(this.context.data, "env.WORKSPACE", ".");
        const flowChartTemplateName = this.args[0];
        const indexPath = this.args[2];
        // Force update the model
        const superContext = this.context.getSuperContext();
        const roomData = superContext.getRoomLiveTupleModel(room);
        const routeMultiple = SimpleObj.getValue(roomData, `model.multiples.${flowChartTemplateName}`, null);
        //console.log(`flowChartTemplateName=${flowChartTemplateName} routeMultiple=${routeMultiple}`)
        if (typeof indexPath !== "string") {
            console.log(`In StepMultiple, indexPath is not a string ${JSON.stringify(this.args)}`);
            return;
        }
        if (routeMultiple) {
            const extraConfiguration = {};

            for (let i = 0; i < this.list.length; i++) {
                extraConfiguration[`${flowChartTemplateName}_${i}`] = routeMultiple;
            }
            this.completePaths(extraConfiguration, WORKSPACE);

            roomData.model.flowchart = this.context.complementFlowChart(extraConfiguration, indexPath);
            let changes = roomData.builder.trackDifferences(roomData.model, [], null, ["flowchart"]);
            roomData.model = roomData.builder.affect(changes);
            superContext.emitToRoom(room, "flowChartModified");
        } else {
            console.log(`In StepMultiple, can't find model.multiples.${flowChartTemplateName}`);
            //console.log(JSON.stringify(roomData, null, 4));
        }
    }

    async canContinue() {
        return true;
    }
}

module.exports = {
    StepMultiple
};