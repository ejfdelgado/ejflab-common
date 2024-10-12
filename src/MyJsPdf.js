const { jsPDF } = require("jspdf"); // will automatically load the node version
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

//    "jspdf": "^2.5.1",
//    "jsdom": "^22.0.0",
//    "html2canvas": "^1.4.1",
//    "dompurify": "^3.0.3",
//    "core-js": "^3.30.2",
//    "canvg": "^4.0.1",
//    "btoa": "^1.2.1",
//    "atob": "^2.1.2",

class MyJsPdf {
    static async render() {

        const html = '<html><head><style> html { color: red; } </style></head><body>hola</body></html>';
        const domhtml = new JSDOM(html, { contentType: "text/html" });

        global.window = domhtml.window;
        global.document = window.document;
        global.navigator = window.navigator;
        window.getComputedStyle = (...args) => {
            return { content: "none" };
            /*
            if ([":before", ":after"].indexOf(args[1]) >= 0) {
                return { content: "none" };
            } else {
                return window.getComputedStyle(...args);
            }
            */
        };
        window.scrollTo = () => { };
        global.Node = window.Node;

        var doc = new jsPDF();
        await new Promise((resolve) => {
            doc.html(document.body, {
                callback: function (d) {
                    d.save("a4.pdf");
                    resolve();
                }
            });
        });
    }
}

//MyJsPdf.render();

module.exports = {
    MyJsPdf,
};