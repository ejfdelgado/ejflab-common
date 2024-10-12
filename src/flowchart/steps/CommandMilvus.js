const { SimpleObj } = require("../../SimpleObj");
const { CommandBasic } = require("./CommandBasic");

class CommandMilvus extends CommandBasic {
    async dataBaseRecreate(milvusSrv, client, dataBaseName) {
        //await milvusSrv.introspect(client);
        await milvusSrv.useDatabase(client, dataBaseName, true);
    }
    async dataBaseCreate(milvusSrv, client, dataBaseName) {
        //await milvusSrv.introspect(client);
        await milvusSrv.useDatabase(client, dataBaseName, false);
    }
    async collectionCreate(milvusSrv, client, dataBaseName, configuration) {
        await milvusSrv.useDatabase(client, dataBaseName, false);
        await milvusSrv.createCollectionWithSchema(client, configuration);
    }
    async computation() {
        const action = this.args[0];
        const dataBaseName = this.args[1];

        const milvusSrv = this.context.getSuperContext().getMilvusClient();
        const { client } = milvusSrv.connect();
        if (action == "database.create") {
            await this.dataBaseCreate(milvusSrv, client, dataBaseName);
        } else if (action == "database.recreate") {
            await this.dataBaseRecreate(milvusSrv, client, dataBaseName);
        } else if (action == "collection.create") {
            const collectionConfig = this.args[2];
            const configuration = SimpleObj.getValue(this.context.data, collectionConfig, null);
            if (configuration) {
                await this.collectionCreate(milvusSrv, client, dataBaseName, configuration);
            } else {
                throw new Error(`No MILVUS configuration in ${collectionConfig}`);
            }
        } else if (action == "introspect") {
            await milvusSrv.introspect(client);
        } else if (action == "database.destroy") {
            await milvusSrv.dropDatabase(client, dataBaseName);
        } else if (action == "database.destroy_temp") {
            await milvusSrv.dropDatabaseTemp(client);
        }
    }
}

module.exports = {
    CommandMilvus
};