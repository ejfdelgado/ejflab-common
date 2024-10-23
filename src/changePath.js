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
const HTML_PATHS = [
    `${DIST_DIR}/index.html`
];

// Search bundle reference
if (fs.existsSync(DIST_DIR)) {
    const fileList = fs.readdirSync(DIST_DIR).filter((fileName) => {
        return /^main\./.exec(fileName) != null;
    });
    if (fileList.length > 0) {
        FILE_PATHS.push(`${DIST_DIR}/${fileList[0]}`);
    }
} else {
    console.log(`Warning: folder ${DIST_DIR} does not exists!`);
}

function changeSimpleFile(filePath) {
    console.log(`Trying ${filePath}...`);
    // Read content
    if (fs.existsSync(filePath)) {
        let myConstantsContent = fs.readFileSync(filePath, { encoding: "utf8" });
        // Change content
        myConstantsContent = myConstantsContent.replaceAll(/(static\s*SRV_ROOT\s*=\s*)[^;]+;/ig, `$1"${NODE_SERVER_PATH}";`);
        // Write content
        fs.writeFileSync(filePath, myConstantsContent, { encoding: "utf8" });
        //console.log(myConstantsContent);
    } else {
        console.log(`Warning: ${filePath} dont exists! continue...`);
    }
}

for (let i = 0; i < FILE_PATHS.length; i++) {
    changeSimpleFile(FILE_PATHS[i]);
}

// Change also the html
function changeHtmlTag(filePath) {
    console.log(`Trying ${filePath}...`);
    // Read content
    if (fs.existsSync(filePath)) {
        let myConstantsContent = fs.readFileSync(filePath, { encoding: "utf8" });
        // Change content
        myConstantsContent = myConstantsContent.replaceAll(/(<\s*base\s+href\s*=\s*")[^"]+("\s*>)/ig, `$1${NODE_SERVER_PATH}$2`);
        // Write content
        fs.writeFileSync(filePath, myConstantsContent, { encoding: "utf8" });
        //console.log(myConstantsContent);
    } else {
        console.log(`Warning: ${filePath} dont exists! continue...`);
    }
}

for (let i = 0; i < HTML_PATHS.length; i++) {
    changeHtmlTag(HTML_PATHS[i]);
}