const { SimpleObj } = require("../../SimpleObj");
const { CommandBasic } = require("./CommandBasic");

class CommandPostgres extends CommandBasic {
    async computation() {
        const action = this.args[0];
        const dbIdPath = this.args[1];
        const bodyPath = this.args[2];
        //srv/wideSight/sql/writes/object.sql
        const script = this.args[3];
        const postgresSrv = this.context.getSuperContext().getPostgresClient();
        if (action == "execute") {
            //console.log("Starting execute...");
            const dbIdData = SimpleObj.getValue(this.context.data, dbIdPath, null);
            let bodyData = SimpleObj.getValue(this.context.data, bodyPath, null);
            bodyData = JSON.parse(JSON.stringify(bodyData));
            if (!(bodyData instanceof Array)) {
                bodyData = [bodyData]
            }
            const now = new Date().getTime();

            const pool = postgresSrv.getPool();
            const client = await pool.connect();
            await client.query("BEGIN");
            const response = [];
            try {
                // Insert into media
                for (let i = 0; i < bodyData.length; i++) {
                    const payload = JSON.parse(JSON.stringify(dbIdData));
                    payload.object = bodyData[i];
                    payload.now = now;
                    const result = await postgresSrv.executeFile(script, payload, client);
                    response.push(result);
                }
                await client.query("COMMIT");
            } catch (e) {
                await client.query("ROLLBACK");
                throw e;
            } finally {
                client.release();
            }
            //console.log("Finishing execute...");
            //console.log(JSON.stringify(response));
        }
    }
}

module.exports = {
    CommandPostgres
};