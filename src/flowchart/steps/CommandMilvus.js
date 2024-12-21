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
        let response = null;
        try {
            if (action == "database.create") {
                response = await this.dataBaseCreate(milvusSrv, client, dataBaseName);
            } else if (action == "database.recreate") {
                response = await this.dataBaseRecreate(milvusSrv, client, dataBaseName);
            } else if (action == "collection.create") {
                const collectionConfig = this.args[2];
                const configuration = SimpleObj.getValue(this.context.data, collectionConfig, null);
                if (configuration) {
                    response = await this.collectionCreate(milvusSrv, client, dataBaseName, configuration);
                } else {
                    throw new Error(`No MILVUS configuration in ${collectionConfig}`);
                }
            } else if (action == "collection.destroy") {
                const collectionName = this.args[2];
                response = await milvusSrv.dropCollectionOfDatabase(client, dataBaseName, collectionName);
            } else if (action == "collection.describe") {
                const collectionName = this.args[2];
                response = await milvusSrv.describeCollectionOfDatabase(client, dataBaseName, collectionName);
            } else if (action == "introspect") {
                response = await milvusSrv.introspect(client);
            } else if (action == "database.destroy") {
                response = await milvusSrv.dropDatabase(client, dataBaseName);
            } else if (action == "database.destroy_temp") {
                response = await milvusSrv.dropDatabaseTemp(client);
            } else if (action == "database.exists") {
                response = await milvusSrv.existsDatabase(client, dataBaseName);
            }
        } catch (err) {
            throw err;
        } finally {
            await milvusSrv.releaseConnection(client);
        }
        return response;
    }
}

module.exports = {
    CommandMilvus
};