const fs = require('fs');

/**
 * export NODE_SERVER_PATH=/app1/
 * node ./node_modules/@ejfdelgado/ejflab-common/src/changePath.js
 */

const NODE_SERVER_PATH = process.env.NODE_SERVER_PATH;

if (!NODE_SERVER_PATH) {
    console.log("Error: NODE_SERVER_PATH env variable is not set!");
    return;
}
const DIST_DIR = "./dist/bundle";
const FILE_PATHS = [
    "./node_modules/@ejfdelgado/ejflab-common/src/MyConstants.js",
    "./node_modules/@ejfdelgado/ejflab-back/node_modules/@ejfdelgado/ejflab-common/src/MyConstants.js"
];

// Search bundle reference
const fileList = fs.readdirSync(DIST_DIR).filter((fileName) => {
    return /^main\./.exec(fileName) != null;
});
if (fileList.length > 0) {
    FILE_PATHS.push(`${DIST_DIR}/${fileList[0]}`);
}

function changeSimpleFile(filePath) {
    console.log(`Modifiying ${filePath}...`);
    // Read content
    let myConstantsContent = fs.readFileSync(filePath, { encoding: "utf8" });
    // Change content
    myConstantsContent = myConstantsContent.replaceAll(/(static\s*SRV_ROOT\s*=\s*)[^;]+;/ig, `$1"${NODE_SERVER_PATH}";`);
    // Write content
    fs.writeFileSync(filePath, myConstantsContent, { encoding: "utf8" });
    //console.log(myConstantsContent);
}

for (let i = 0; i < FILE_PATHS.length; i++) {
    changeSimpleFile(FILE_PATHS[i]);
}