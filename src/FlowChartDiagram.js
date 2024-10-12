const { XMLParser } = require("fast-xml-parser");

// For nodes
const DEFAULT_FONT_COLOR = "#ffffff";
const DEFAULT_FILL_COLOR = "#555555";
const DEFAULT_STROKE_COLOR = "#000000";
const DEFAULT_STROKE_WIDTH = "1";
const CURRENT_NODE_FILL = "#990000";

// For lines
const PENDING_BORDER_COLOR = "rgb(0,0,0)";
const PENDING_BORDER_WIDTH = "1";

// For nodes and lines
const DONE_BORDER_COLOR = "rgb(255,0,0)";
const DONE_BORDER_WIDTH = "3";

const computeStyle = function (incomming, done = false, current = false) {
    const base = {
        fillColor: DEFAULT_FILL_COLOR,
        strokeColor: DEFAULT_STROKE_COLOR,
        strokeWidth: DEFAULT_STROKE_WIDTH,
        // for text
        fontColor: DEFAULT_FONT_COLOR,
    };
    Object.assign(base, incomming);
    if (done) {
        //border red
        base.strokeColor = DONE_BORDER_COLOR;
        base.strokeWidth = DONE_BORDER_WIDTH;
    };
    if (current) {
        //border red
        base.strokeColor = DONE_BORDER_COLOR;
        //strokeWidth 
        base.strokeWidth = DONE_BORDER_WIDTH;
        base.fillColor = CURRENT_NODE_FILL;
        base.fontColor = DEFAULT_FONT_COLOR;
    }
    const translateShape = {
        "fillColor": "fill",
        "strokeColor": "stroke",
        "strokeWidth": "stroke-width"
    };
    const translateText = {
        fontColor: "fill",
    };
    const computedStyle = {
        shape: [],
        shapeText: '',
        text: {}
    };
    const shapeKeys = Object.keys(translateShape);
    for (let i = 0; i < shapeKeys.length; i++) {
        const shapeKey = shapeKeys[i];
        const shapeTranslated = translateShape[shapeKey];
        computedStyle.shape.push(`${shapeTranslated}:${base[shapeKey]}`);
    }
    computedStyle.shapeText = computedStyle.shape.join(";");

    // Compute text style
    const textKeys = Object.keys(translateText);
    for (let i = 0; i < textKeys.length; i++) {
        const textKey = textKeys[i];
        const textTranslated = translateText[textKey];
        computedStyle.text[textTranslated] = base[textKey];
    }
    return computedStyle;
};

class FlowChartDiagram {
    static searchClosest(srcList, tarList) {
        let closestDistance = null;
        let srcPos = null;
        let tarPos = null;
        for (let i = 0; i < srcList.length; i++) {
            for (let j = 0; j < tarList.length; j++) {
                const srcTmp = srcList[i];
                const tarTmp = tarList[j];
                const distance = Math.sqrt(
                    Math.pow(srcTmp.x - tarTmp.x, 2) + Math.pow(srcTmp.y - tarTmp.y, 2)
                );
                if (closestDistance == null || distance < closestDistance) {
                    closestDistance = distance;
                    srcPos = srcTmp;
                    tarPos = tarTmp;
                }
            }
        }
        return {
            src: srcPos,
            tar: tarPos,
        };
    }
    // FlowChartDiagram.drawLine(src, tar)
    static drawLine(src, tar, isDone = false) {
        let color = PENDING_BORDER_COLOR;
        let width = PENDING_BORDER_WIDTH;
        if (isDone) {
            color = DONE_BORDER_COLOR;
            width = DONE_BORDER_WIDTH;
        }
        return `<line x1="${src.x}" x2="${tar.x}" y1="${src.y}" y2="${tar.y}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
    }
    static isIdInHistory(nodeId, history) {
        if (history instanceof Array) {
            for (let i = 0; i < history.length; i++) {
                const oneHistory = history[i];
                if (oneHistory.id == nodeId) {
                    return true;
                }
            }
        }
        return false;
    };
    static computeGraph(grafo, currentNodes = [], history = []) {
        const lineHeight = 15;
        let svgContent = '  <defs>\
        <filter x="0" y="0" width="1" height="1" id="solid">\
          <feFlood flood-color="white" flood-opacity="0.8" result="bg" />\
          <feMerge>\
            <feMergeNode in="bg"/>\
            <feMergeNode in="SourceGraphic"/>\
          </feMerge>\
        </filter>\
      </defs>';
        const styleTar = 'fill:rgb(0,0,0);stroke-width:1;stroke:rgb(0,0,0)';

        if (grafo) {
            const shapes = grafo.shapes;
            const arrows = grafo.arrows;
            const centers = {};
            if (shapes instanceof Array) {
                for (let i = 0; i < shapes.length; i++) {
                    const shape = shapes[i];
                    const id = shape.id;
                    const pos = shape.pos;
                    centers[id] = [
                        {
                            x: parseInt(pos.x),
                            y: parseInt(pos.y + pos.height * 0.5),
                        },
                        {
                            x: parseInt(pos.x + pos.width * 0.5),
                            y: parseInt(pos.y),
                        },
                        {
                            x: parseInt(pos.x + pos.width),
                            y: parseInt(pos.y + pos.height * 0.5),
                        },
                        {
                            x: parseInt(pos.x + pos.width * 0.5),
                            y: parseInt(pos.y + pos.height),
                        },
                    ];
                }
                // Acá van las líneas
                if (arrows instanceof Array) {
                    for (let i = 0; i < arrows.length; i++) {
                        const arrow = arrows[i];
                        const isDone = FlowChartDiagram.isIdInHistory(arrow.id, history);
                        const points = [];
                        const srcList = centers[arrow.src];
                        const tarList = centers[arrow.tar];
                        // Debo buscar la combinación más corta
                        let tar;
                        let statistics = null;
                        if (arrow.points instanceof Array) {
                            for (let j = 0; j < arrow.points.length; j++) {
                                const punto = arrow.points[j];
                                points.push(punto);
                            }

                            const points1 = FlowChartDiagram.searchClosest(srcList, [points[0]]);
                            const points2 = FlowChartDiagram.searchClosest([points[points.length - 1]], tarList);
                            points.unshift(points1.src);// Al inicio
                            points.push(points2.tar);//Al final
                            tar = points2.tar;
                        } else {
                            const points0 = FlowChartDiagram.searchClosest(srcList, tarList);
                            points.push(points0.src);
                            points.push(points0.tar);
                            tar = points0.tar;
                        }

                        // draw all lines...
                        for (let j = 0; j < points.length - 1; j++) {
                            svgContent += FlowChartDiagram.drawLine(points[j], points[j + 1], isDone);
                        }

                        //compute position of text
                        points.forEach((point) => {
                            if (statistics == null) {
                                statistics = {
                                    xmin: point.x,
                                    ymin: point.y,
                                    xmax: point.x,
                                    ymax: point.y,
                                };
                            } else {
                                if (point.x < statistics.xmin) {
                                    statistics.xmin = point.x;
                                }
                                if (point.y < statistics.ymin) {
                                    statistics.ymin = point.y;
                                }
                                if (point.x > statistics.xmax) {
                                    statistics.xmax = point.x;
                                }
                                if (point.y > statistics.ymax) {
                                    statistics.ymax = point.y;
                                }
                            }
                        });

                        //draw end point
                        svgContent += `<ellipse cx="${tar.x}" cy="${tar.y}" rx="5" ry="5" style="${styleTar}"></ellipse>`;

                        // Se escribe el texto de la línea
                        if (typeof arrow.txt == "string") {
                            const lines = arrow.txt.split(/\n/g);
                            const pos = {
                                x: statistics.xmin,
                                y: statistics.ymin,
                                width: Math.abs(statistics.xmax - statistics.xmin),
                                height: Math.abs(statistics.ymax - statistics.ymin),
                            };
                            for (let j = 0; j < lines.length; j++) {
                                const line = lines[j];
                                let xPos, yPos;
                                if (points.length <= 2) {
                                    xPos = pos.x + pos.width * 0.5;
                                    yPos = pos.y +
                                        pos.height * 0.5 +
                                        j * lineHeight -
                                        (lines.length - 1) * lineHeight * 0.5 +
                                        lineHeight * 0.25;
                                } else {
                                    // take intermediate point
                                    const median = Math.floor(points.length * 0.5);
                                    xPos = parseInt(points[median].x);
                                    yPos = parseInt(points[median].y) + j * lineHeight -
                                        (lines.length - 1) * lineHeight * 0.5 +
                                        lineHeight * 0.25;
                                    //yPos = points[median].y;
                                }
                                svgContent += `<text filter="url(#solid)" font-family="Helvetica" font-size="14px" text-anchor="middle" x="${xPos}" y="${yPos}" fill="black">${line}</text>`;
                            }
                        }
                    }
                }
                // Acá van los nodos
                let error = null;
                for (let i = 0; i < shapes.length; i++) {
                    const shape = shapes[i];
                    const id = shape.id;
                    const isDone = FlowChartDiagram.isIdInHistory(id, history);
                    const isHiglighted = currentNodes.indexOf(id) >= 0;
                    const pos = shape.pos;
                    //console.log(this.computeStyle);
                    const styledResponse = computeStyle(shape.style, isDone, isHiglighted);
                    //console.log(JSON.stringify(styledResponse));
                    // Se debe reemplazar el color de fondo y de texto

                    const isRectCorrect = [pos.x, pos.y, pos.width, pos.height].reduce((acum, current) => { return acum && (typeof current == "number"); }, true);
                    if (shape.type == 'box') {
                        if (isRectCorrect) {
                            const tempRect = `<rect rx="5" x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}" style="${styledResponse.shapeText}"></rect>`;
                            svgContent += tempRect;
                        } else {
                            error = `${shape.type} with id ${id} is malformed ${JSON.stringify(shape)}`;
                        }
                    } else if (shape.type == 'ellipse') {
                        if (isRectCorrect) {
                            svgContent += `<ellipse cx="${pos.x + pos.width * 0.5}" cy="${pos.y + pos.height * 0.5
                                }" rx="${pos.width * 0.5}" ry="${pos.height * 0.5
                                }" style="${styledResponse.shapeText}"></ellipse>`;
                        } else {
                            error = `${shape.type} with id ${id} is malformed ${JSON.stringify(shape)}`;
                        }
                    } else if (shape.type == 'rhombus') {
                        if (isRectCorrect) {
                            svgContent += `<polygon points="`;
                            svgContent += `${pos.x.toFixed(0)},${pos.y + pos.height * 0.5} `;
                            svgContent += `${pos.x + pos.width * 0.5},${pos.y.toFixed(0)} `;
                            svgContent += `${(pos.x + pos.width).toFixed(0)},${pos.y + pos.height * 0.5
                                } `;
                            svgContent += `${pos.x + pos.width * 0.5},${(
                                pos.y + pos.height
                            ).toFixed(0)}" `;
                            svgContent += `style="${styledResponse.shapeText}"/>`;
                        } else {
                            error = `${shape.type} with id ${id} is malformed ${JSON.stringify(shape)}`;
                        }
                    }
                    if (typeof shape.txt == 'string') {
                        const lines = shape.txt.split(/\n/g);
                        for (let j = 0; j < lines.length; j++) {
                            const line = lines[j];
                            svgContent += `<text font-family="Helvetica" font-size="14px" text-anchor="middle" x="${pos.x + pos.width * 0.5
                                }" y="${pos.y +
                                pos.height * 0.5 +
                                j * lineHeight -
                                (lines.length - 1) * lineHeight * 0.5 +
                                lineHeight * 0.25
                                }" fill="${styledResponse.text.fill}">${line}</text>`;
                        }
                    }
                }
                if (error != null) {
                    alert(error);
                }
            }
        }
        return svgContent;
    }
    static parseHTML(text) {
        try {
            let innerText = "";
            const options = {
                ignoreAttributes: true,
                tagValueProcessor: (tagName, value) => {
                    //console.log(`tagName = ${tagName} with ${value}`);
                    innerText += value;
                    if (["span"].indexOf(tagName) >= 0) {
                        innerText += "\n";
                    } else {
                        innerText += " ";
                    }
                    return "";
                }
            };
            const parser = new XMLParser(options);
            parser.parse(text);
            if (innerText.trim().length == 0) {
                return text;
            } else {
                // If it really gets some content...
                //
                return innerText.replace(/\n$/g, "");
            }
        } catch (err) {
            return text;
        }
    }
    static computeStyle(style) {
        const response = {
            fontColor: DEFAULT_FONT_COLOR,
            fillColor: DEFAULT_FILL_COLOR,
            strokeColor: DEFAULT_STROKE_COLOR,
        };
        if (typeof style == "string") {
            const tokens = style.split(";");
            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                const partes = token.split("=");
                if (partes.length >= 2) {
                    response[partes[0]] = partes[1];
                }
            }
        }
        //console.log(`style ${style} to ${JSON.stringify(response)}`);
        return response;
    }
    static processFlowChart(nodos, he = null, prefix = "") {
        const simple = {
            shapes: [],
            arrows: [],
        };
        if (nodos instanceof Array) {
            // Se renombran los ids si es necesario
            if (prefix != "") {
                for (let i = 0; i < nodos.length; i++) {
                    const nodo = nodos[i];
                    if (nodo['@_id']) {
                        nodo['@_id'] = prefix + nodo['@_id'];
                    }
                    if (nodo['@_source']) {
                        nodo['@_source'] = prefix + nodo['@_source'];
                    }
                    if (nodo['@_target']) {
                        nodo['@_target'] = prefix + nodo['@_target'];
                    }
                    if (nodo['@_parent']) {
                        nodo['@_parent'] = prefix + nodo['@_parent'];
                    }
                }
            }
            // Se preprocesan las flechas
            const mapaFlechas = {};
            for (let i = 0; i < nodos.length; i++) {
                const nodo = nodos[i];
                const id = nodo['@_id'];
                const source = nodo['@_source'];
                const target = nodo['@_target'];
                if (source && target) {
                    mapaFlechas[id] = { original: nodo };
                }
            }
            // Se procesan los nodos y flechas
            for (let i = 0; i < nodos.length; i++) {
                const nodo = nodos[i];
                const id = nodo['@_id'];
                const source = nodo['@_source'];
                const parentId = nodo['@_parent'];
                const parentArrow = mapaFlechas[parentId];
                const target = nodo['@_target'];
                const txt = nodo["@_value"];
                let texto = '';
                if (typeof txt == "string") {
                    texto = this.parseHTML(txt);
                    if (he != null) {
                        texto = he.decode(texto);
                    }
                    //texto = texto.replace(/&nbsp;/g, " ");
                    texto = texto.replace(/<\/?br\/?>/ig, '\n');
                }
                const style = nodo['@_style'];
                const computedStyle = this.computeStyle(style);
                const details = nodo['mxGeometry'];
                if (source && target) {
                    // Es una flecha
                    const nuevaFlecha = {
                        src: source,
                        tar: target,
                        txt: texto,
                        id,
                        prefix,
                    };
                    // Se valida si tiene puntos intermedios
                    if (details?.Array?.mxPoint instanceof Array) {
                        nuevaFlecha.points = details?.Array?.mxPoint.map((point) => {
                            return {
                                x: point["@_x"],
                                y: point["@_y"],
                            };
                        });
                    } else if (details?.Array?.mxPoint) {
                        const mxPoint = details?.Array?.mxPoint;
                        nuevaFlecha.points = [{
                            x: mxPoint["@_x"],
                            y: mxPoint["@_y"],
                        }];
                    }
                    mapaFlechas[id].ref = nuevaFlecha;
                    simple.arrows.push(nuevaFlecha);
                } else {
                    if (parentArrow) {
                        // Save text in the parent
                        parentArrow.txt = texto;
                        continue;
                    }
                    let shapeType = 'box';
                    if (style) {
                        if (style.startsWith('ellipse')) {
                            shapeType = 'ellipse';
                        } else if (style.startsWith('rhombus')) {
                            shapeType = 'rhombus';
                        }
                    }
                    // read coordinates
                    if (details) {
                        const pos = {
                            width: parseInt(details['@_width']),
                            height: parseInt(details['@_height']),
                            x: parseInt(details['@_x']),
                            y: parseInt(details['@_y']),
                        };
                        simple.shapes.push({
                            id,
                            pos,
                            txt: texto,
                            type: shapeType,
                            style: computedStyle,
                            prefix
                        });
                    }
                }
            }
            // Se escriben los textos que quedaron faltando
            const llavesFlechas = Object.keys(mapaFlechas);
            for (let i = 0; i < llavesFlechas.length; i++) {
                const llave = llavesFlechas[i];
                const flecha = mapaFlechas[llave];
                if (flecha.ref.txt == "") {
                    let temp = flecha.txt;
                    if (typeof temp == "string") {
                        if (he != null) {
                            temp = he.decode(temp);
                        }
                        temp = temp.replace(/<\/?br\/?>/ig, '\n');
                    }
                    flecha.ref.txt = temp;
                }
            }
        }
        return simple;
    }
}

module.exports = {
    FlowChartDiagram
};