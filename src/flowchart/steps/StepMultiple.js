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
        const room = this.context.getRoom();
        this.list = SimpleObj.getValue(this.context.data, this.args[1], []);
        const WORKSPACE = SimpleObj.getValue(this.context.data, "env.WORKSPACE", ".");
        const flowChartTemplateName = this.args[0];
        // Force update the model
        const superContext = this.context.getSuperContext();
        const roomData = superContext.getRoomLiveTupleModel(room);
        const routeMultiple = SimpleObj.getValue(roomData, `model.multiples.${flowChartTemplateName}`, null);
        //console.log(`flowChartTemplateName=${flowChartTemplateName} routeMultiple=${routeMultiple}`)
        if (routeMultiple) {
            const extraConfiguration = {};

            for (let i = 0; i < this.list.length; i++) {
                extraConfiguration[`${flowChartTemplateName}_${i}`] = routeMultiple;
            }
            this.completePaths(extraConfiguration, WORKSPACE);

            roomData.model.flowchart = this.context.complementFlowChart(extraConfiguration);
            let changes = roomData.builder.trackDifferences(roomData.model, [], null, ["flowchart"]);
            roomData.model = roomData.builder.affect(changes);
            superContext.emitToRoom(room, "flowChartModified");
        } else {
            console.log(`Error: Can't find model.multiples.${flowChartTemplateName}`);
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