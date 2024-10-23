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
            const dbIdData = SimpleObj.getValue(this.context.data, dbIdPath, null);
            let bodyData = SimpleObj.getValue(this.context.data, bodyPath, null);
            bodyData = JSON.parse(JSON.stringify(bodyData));
            if (!(bodyData instanceof Array)) {
                bodyData = [bodyData]
            }
            for (let i = 0; i < bodyData.length; i++) {
                const payload = JSON.parse(JSON.stringify(dbIdData));
                payload.object = bodyData[i];
                console.log(`script=${script}`);
                console.log(JSON.stringify(payload, null, 4));
            }
        }
    }
}

module.exports = {
    CommandPostgres
};