
class MyRoutes {
    // pageType is for example /calendar
    static splitPageData(path) {
        const partes = /(\/[^/]+)(\/[^/\?#]+|\/)?/ig.exec(path);
        if (partes == null) {
            return {
                pageId: null,
                pageType: null,
            };
        }
        let pageId = null;
        if (typeof partes[2] == "string") {
            pageId = (partes[2].replace("/", ""));
        }
        // Must ignore some special paths
        if (["p"].indexOf(pageId) >= 0) {
            pageId = null;
        }
        return {
            pageId,
            pageType: partes[1],
        };
    }
}

module.exports = {
    MyRoutes
};