const fs = require('fs');

// clear && node TriangulacionGeometric.js

class TriangulacionGeometric {
    static TO_RADIANS = Math.PI / 180;
    static TO_DEGRES = 180 / Math.PI;
    static ANGLE_STEP = 10;
    static computeAngle(x, y) {
        let valor = Math.atan2(y, x) * TriangulacionGeometric.TO_DEGRES;
        if (valor < 0) {
            valor += 360;
        }
        return valor;
    }
    static generateUnaryVector(angle) {
        return {
            x: Math.cos(angle * TriangulacionGeometric.TO_RADIANS),
            y: Math.sin(angle * TriangulacionGeometric.TO_RADIANS),
        };
    }
    static computePolygonCoordinates(config, center, globales) {
        //200, 10, 250, 190, 150, 190
        const coordinates = [];

        // All angles in degrees
        // 1. compute angle of current look at
        const lookAt = config.lookAt;
        const angleLookAt = TriangulacionGeometric.computeAngle(lookAt.x, lookAt.y);
        //console.log(`angleLookAt = ${angleLookAt}`);
        // 2. compute min/max angle
        const angleMin = angleLookAt + config.angles.min;
        const angleMax = angleLookAt - config.angles.max;
        //console.log(`angleMin = ${angleMin}`);
        //console.log(`angleMax = ${angleMax}`);
        // Generate vectors from angles
        const vectorMin = TriangulacionGeometric.generateUnaryVector(angleMin);
        const vectorMax = TriangulacionGeometric.generateUnaryVector(angleMax);

        const centerLocal = {
            x: (config.position.x - center.x) * globales.canvas.scale + globales.canvas.xCenter,
            y: -1 * (config.position.y - center.y) * globales.canvas.scale + globales.canvas.yCenter
        };

        // Agrego de min angle, la distancia más corta
        coordinates.push(centerLocal.x + vectorMin.x * config.distance.min * globales.canvas.scale);
        coordinates.push(centerLocal.y + -1 * vectorMin.y * config.distance.min * globales.canvas.scale);
        // Agrego de min angle, la distancia más larga
        coordinates.push(centerLocal.x + vectorMin.x * config.distance.max * globales.canvas.scale);
        coordinates.push(centerLocal.y + -1 * vectorMin.y * config.distance.max * globales.canvas.scale);

        // Se crean los arcos
        const arcoPequenio = [];
        let currentAngle = angleMin;
        let stepAngle = TriangulacionGeometric.ANGLE_STEP;
        if (angleMax < angleMin) {
            stepAngle *= -1;
        }
        const iterations = Math.floor(Math.abs((angleMax - angleMin) / stepAngle));
        //console.log(`stepAngle = ${stepAngle} iterations = ${iterations}`);

        for (let i = 0; i < iterations; i++) {
            const vectorStep = TriangulacionGeometric.generateUnaryVector(currentAngle + i * stepAngle);
            // Agrego de min angle, la distancia más larga
            coordinates.push(centerLocal.x + vectorStep.x * config.distance.max * globales.canvas.scale);
            coordinates.push(centerLocal.y + -1 * vectorStep.y * config.distance.max * globales.canvas.scale);
        }

        // Agrego de max angle, la distancia más larga
        coordinates.push(centerLocal.x + vectorMax.x * config.distance.max * globales.canvas.scale);
        coordinates.push(centerLocal.y + -1 * vectorMax.y * config.distance.max * globales.canvas.scale);
        // Agrego de max angle, la distancia más corta
        coordinates.push(centerLocal.x + vectorMax.x * config.distance.min * globales.canvas.scale);
        coordinates.push(centerLocal.y + -1 * vectorMax.y * config.distance.min * globales.canvas.scale);

        if (config.distance.min > 0) {
            currentAngle = angleMax;
            for (let i = 0; i < iterations; i++) {
                const vectorStep = TriangulacionGeometric.generateUnaryVector(currentAngle - i * stepAngle);
                // Agrego de min angle, la distancia más larga
                coordinates.push(centerLocal.x + vectorStep.x * config.distance.min * globales.canvas.scale);
                coordinates.push(centerLocal.y + -1 * vectorStep.y * config.distance.min * globales.canvas.scale);
            }
        }

        return { centerLocal, coordinates };
    }

    static checkPointInside(config, prove) {
        return true;
    }

    static createPolygon(config, center, globales, style) {
        //console.log(JSON.stringify(config, null, 4));
        const { centerLocal, coordinates } = TriangulacionGeometric.computePolygonCoordinates(config, center, globales);
        let textPoints = "";
        if (coordinates.length > 0) {
            textPoints = "" + coordinates[0];
            for (let i = 1; i < coordinates.length; i++) {
                const actual = coordinates[i];
                if (i % 2 == 0) {
                    textPoints += ",";
                } else {
                    textPoints += " ";
                }
                textPoints += actual;
            }
        }
        const polygonText = `<polygon points="${textPoints}" style="opacity:${style.opacity};fill:${style.fill};stroke:${style.fill};stroke-width:1" />`;
        return { centerLocal, coordinates, polygonText };
    }

    static writePolygonsToFile(text, globales) {
        const svgText = `<!doctype html><html><body>\n<svg style="background-color:#F8F8F8" height="${globales.canvas.yCenter * 2}" width="${globales.canvas.xCenter * 2}" xmlns="http://www.w3.org/2000/svg">\n\t${text}\n</svg>\n</body></html>`;
        fs.writeFileSync(`./test/svg/test.html`, svgText, { encoding: "utf8" });
    }

    static crearBusqueda(person, origin, globales) {
        const configLocal = {
            green: {
                angles: parseInt(globales.canvas.green.fov / 2),
                min: globales.canvas.green.min,
                max: globales.canvas.green.max,
                style: {
                    fill: "#00FF00",
                    opacity: 0.5,
                    stroke: "black"
                }
            },
            yellow: {
                angles: parseInt(globales.canvas.yellow.fov / 2),
                min: globales.canvas.yellow.min,
                max: globales.canvas.yellow.max,
                style: {
                    fill: "#99FF99",
                    opacity: 0.35,
                    stroke: "black"
                }
            }
        };
        const angleOffset = 90;
        let center;
        // --------------
        let viewGreen1;
        {
            let { centerLocal, coordinates, polygonText } = TriangulacionGeometric.createPolygon({
                position: { x: person.position.x, y: person.position.y },
                lookAt: { x: person.lookAt.x, y: person.lookAt.y },
                angles: {
                    min: configLocal.green.angles - angleOffset,
                    max: configLocal.green.angles + angleOffset
                },
                distance: { min: configLocal.green.min, max: configLocal.green.max }
            }, origin, globales, configLocal.green.style);
            viewGreen1 = polygonText;
            center = centerLocal;
        }
        let viewYellow1;
        {
            let { centerLocal, coordinates, polygonText } = TriangulacionGeometric.createPolygon({
                position: { x: person.position.x, y: person.position.y },
                lookAt: { x: person.lookAt.x, y: person.lookAt.y },
                angles: {
                    min: configLocal.yellow.angles - angleOffset,
                    max: configLocal.yellow.angles + angleOffset
                },
                distance: { min: configLocal.yellow.min, max: configLocal.yellow.max }
            }, origin, globales, configLocal.yellow.style);
            viewYellow1 = polygonText;
        }
        let viewGreen2;
        {
            let { centerLocal, coordinates, polygonText } = TriangulacionGeometric.createPolygon({
                position: { x: person.position.x, y: person.position.y },
                lookAt: { x: person.lookAt.x, y: person.lookAt.y },
                angles: {
                    min: configLocal.green.angles + angleOffset,
                    max: configLocal.green.angles - angleOffset
                },
                distance: { min: configLocal.green.min, max: configLocal.green.max }
            }, origin, globales, configLocal.green.style);
            viewGreen2 = polygonText;
            center = centerLocal;
        }
        let viewYellow2;
        {
            let { centerLocal, coordinates, polygonText } = TriangulacionGeometric.createPolygon({
                position: { x: person.position.x, y: person.position.y },
                lookAt: { x: person.lookAt.x, y: person.lookAt.y },
                angles: {
                    min: configLocal.yellow.angles + angleOffset,
                    max: configLocal.yellow.angles - angleOffset
                },
                distance: { min: configLocal.yellow.min, max: configLocal.yellow.max }
            }, origin, globales, configLocal.yellow.style);
            viewYellow2 = polygonText;
        }

        const circlePoint = `<circle cx="${center.x}" cy="${center.y}" r="5" stroke="#00FF00" stroke-width="5" fill="none" />`;

        return viewGreen1 + viewYellow1 + viewGreen2 + viewYellow2 + circlePoint;
    }

    static crearSeguridad(person, origin, globales) {
        const configLocal = {
            green: {
                angles: parseInt(globales.canvas.green.fov / 2),
                min: globales.canvas.green.min,
                max: globales.canvas.green.max,
                style: {
                    fill: "#0000FF",
                    opacity: 0.5,
                    stroke: "black"
                }
            },
            yellow: {
                angles: parseInt(globales.canvas.yellow.fov / 2),
                min: globales.canvas.yellow.min,
                max: globales.canvas.yellow.max,
                style: {
                    fill: "#9999FF",
                    opacity: 0.35,
                    stroke: "black"
                }
            }
        };
        let center;
        let viewGreen;
        {
            let { centerLocal, coordinates, polygonText } = TriangulacionGeometric.createPolygon({
                position: { x: person.position.x, y: person.position.y },
                lookAt: { x: person.lookAt.x, y: person.lookAt.y },
                angles: { min: configLocal.green.angles, max: configLocal.green.angles },
                distance: { min: configLocal.green.min, max: configLocal.green.max }
            }, origin, globales, configLocal.green.style);
            viewGreen = polygonText;
            center = centerLocal;
        }

        let viewYellow;

        {
            let { centerLocal, coordinates, polygonText } = TriangulacionGeometric.createPolygon({
                position: { x: person.position.x, y: person.position.y },
                lookAt: { x: person.lookAt.x, y: person.lookAt.y },
                angles: { min: configLocal.yellow.angles, max: configLocal.yellow.angles },
                distance: { min: configLocal.yellow.min, max: configLocal.yellow.max }
            }, origin, globales, configLocal.yellow.style);
            viewYellow = polygonText;
        }

        const circlePoint = `<circle cx="${center.x}" cy="${center.y}" r="5" stroke="blue" stroke-width="5" fill="none" />`;

        return viewGreen + viewYellow + circlePoint;
    }

    static testComputePolygon() {
        const globales = {
            canvas: {
                xCenter: 400,
                yCenter: 400,
                maxDistance: 800,
                yellow: {
                    fov: 120,
                    max: 350,
                    min: 0,
                },
                green: {
                    fov: 60,
                    max: 300,
                    min: 50,
                }
            },
            busqueda: {
                position: { x: 0, y: 0 }, lookAt: { x: 0, y: 1 }
            },
            seguridad: {
                position: { x: 0, y: 0 }, lookAt: { x: 0, y: 1 }
            }
        };
        globales.canvas.scale = globales.canvas.xCenter / globales.canvas.maxDistance;

        let completeText = "";
        const seguridadPolygons = TriangulacionGeometric.crearSeguridad(globales.seguridad, globales.busqueda.position, globales);
        const busquedaPolygons = TriangulacionGeometric.crearBusqueda(globales.busqueda, globales.busqueda.position, globales);
        completeText += seguridadPolygons + busquedaPolygons;
        /*
        const tests = [
            {
                prove: { x: 40, y: 33 },
                style: {
                    fill: "green",
                    opacity: 0.5,
                    stroke: "black"
                },
                config: {
                    position: { x: 0, y: 30 }, lookAt: { x: 0, y: 1 },
                    angles: { min: 45, max: 45 }, distance: { min: 125, max: 250 }
                },
                expectedIsInside: true,
            },
            {
                prove: { x: 40, y: 33 },
                style: {
                    fill: "blue",
                    opacity: 0.2,
                    stroke: "black"
                },
                config: {
                    position: { x: 250, y: 30 }, lookAt: { x: -1, y: 0 },
                    angles: { min: 45, max: 45 }, distance: { min: 125, max: 250 }
                },
                expectedIsInside: true,
            }
        ];

        const origin = tests[0].config.position;
        for (let i = 0; i < tests.length; i++) {
            const test = tests[i];
            const svgPolygon = TriangulacionGeometric.createPolygon(test.config, origin, globales, test.style);

            const currentIsInside = TriangulacionGeometric.checkPointInside(test.config, test.prove);
            if (currentIsInside != test.expectedIsInside) {
                throw new Error(`Test ${i + 1} failed`);
            }
        }
        */

        TriangulacionGeometric.writePolygonsToFile(completeText, globales);

        console.log("Celebrate party!");
    }
}

TriangulacionGeometric.testComputePolygon();