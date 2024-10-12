const { SimpleObj } = require("../../SimpleObj");
const { CommandBasic } = require("./CommandBasic");

class CommandMongo extends CommandBasic {
    async computation() {
        const action = this.args[0];
        const dataBaseName = this.args[1];

        const mongoSrv = this.context.getSuperContext().getMongoClient();
        if (action == "write") {
            const collectionName = this.args[2];
            const path = this.args[3];
            let payload = SimpleObj.getValue(this.context.data, path, null);
            payload = JSON.parse(JSON.stringify(payload));
            await mongoSrv.writeLocal(dataBaseName, collectionName, payload);
        } else if (action == "read") {
            const path = this.args[2];
            const payload = {
                where: this.args[3],
            };
            const response = await mongoSrv.readLocal(dataBaseName, payload);
            if (response.list) {
                SimpleObj.recreate(this.context.data, path, response.list);
            } else {
                console.log(`No list found ${JSON.stringify(response)}`);
            }
        } else if (action == "delete") {
            const payload = {
                where: this.args[2],
            };
            const response = await mongoSrv.deleteLocal(dataBaseName, payload);
            console.log(response);
        } else if (action == "update") {
            const path = this.args[2];
            const payload = {
                where: this.args[3],
                update: SimpleObj.getValue(this.context.data, path, null),
            };
            const response = await mongoSrv.updateLocal(dataBaseName, payload);
            console.log(response);
        } else if (action == "index") {
            const collectionName = this.args[2];
            const path = this.args[3];
            const payload = SimpleObj.getValue(this.context.data, path, null);
            const response = await mongoSrv.indexLocal(dataBaseName, collectionName, payload);
            console.log(response);
        } else if (action == "create") {
            const collectionName = this.args[2];
            const path = this.args[3];
            const payload = SimpleObj.getValue(this.context.data, path, null);
            const response = await mongoSrv.createLocal(dataBaseName, collectionName, payload);
            console.log(response);
        }
    }
}

module.exports = {
    CommandMongo
};