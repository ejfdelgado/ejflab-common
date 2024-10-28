const { SimpleObj } = require("../../SimpleObj");
const { CommandBasic } = require("./CommandBasic");

class CommandPostgres extends CommandBasic {
    async computation() {
        const action = this.args[0];
        const dbIdPath = this.args[1];
        const bodyPath = this.args[2];
        //srv/wideSight/sql/writes/object.sql
        const script = this.args[3];
        const destination = this.args[4];
        const postgresSrv = this.context.getSuperContext().getPostgresClient();
        if (action == "execute") {
            //console.log("Starting execute...");
            const dbIdData = SimpleObj.getValue(this.context.data, dbIdPath, null);
            let bodyData = {};
            if (typeof bodyPath == "string") {
                bodyData = SimpleObj.getValue(this.context.data, bodyPath, {});
                bodyData = JSON.parse(JSON.stringify(bodyData));
            } else if (typeof bodyPath == "object" && bodyPath !== null) {
                bodyData = bodyPath;
            }
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
            if (typeof destination == "string" && destination.trim().length > 0) {
                let generalResponse = null;
                if (response.length == 1) {
                    const rows = response[0].rows;
                    if (rows) {
                        const noList = !!this.args[5];
                        if (rows.length == 1 && noList) {
                            generalResponse = rows[0];
                        } else {
                            const first = response[0];
                            generalResponse = {
                                command: first.command,
                                rowCount: first.rowCount,
                                rows: first.rows,
                            };
                        }
                    }
                    SimpleObj.recreate(this.context.data, destination, generalResponse);
                } else if (response.length > 1) {
                    generalResponse = response.map((elem) => {
                        return {
                            command: elem.command,
                            rowCount: elem.rowCount,
                            rows: elem.rows,
                        }
                    });
                    SimpleObj.recreate(this.context.data, destination, generalResponse);
                }
            }
        }
    }
}

module.exports = {
    CommandPostgres
};