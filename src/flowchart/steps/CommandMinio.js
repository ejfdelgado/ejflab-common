const { SimpleObj } = require("../../SimpleObj");
const { CommandBasic } = require("./CommandBasic");

class CommandMinio extends CommandBasic {
    async computation() {
        const action = this.args[0];
        const bucketName = this.args[1];
        const minioSrv = this.context.getSuperContext().getMinioClient();

        if (action == "write") {
            let objectPath = this.args[2];
            const sourcePath = this.args[3];
            const metadata = this.args[4];
            let extra = this.resolveArgument(objectPath);
            if (typeof extra == "string") {
                objectPath = extra;
            }
            //console.log(`CommandMinio.write bucket ${bucketName} objectPath ${objectPath} from ${sourcePath}`);
            //console.log(metadata);
            const bytes = this.resolveArgument(sourcePath);
            //console.log(bytes);
            // Armar el payload para minio
            const payload = {
                objectPath, bytes, metadata
            }
            await minioSrv.writeFileLocal(bucketName, [payload]);
        }
    }
}

module.exports = {
    CommandMinio
};