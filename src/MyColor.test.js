const { MyColor } = require("./MyColor");

function test1() {
    const pruebas = [
        { h: 1, s: 1, v: 1 },
    ];

    for (let i = 0; i < pruebas.length; i++) {
        const prueba = pruebas[i];
        const response = MyColor.hsv2rgb(prueba.h, prueba.s, prueba.v);
        console.log(JSON.stringify(response));
    }

    for (let i = 0; i < 100; i++) {
        console.log(MyColor.int2colorhex(i));
    }
}

function test2() {
    const pruebas = [
        { val: 0, inMin: 0, inMax: 1, outMin: 10, outMax: 20, expected: 10 },
        { val: -15, inMin: 0, inMax: 1, outMin: 10, outMax: 20, expected: 10 },
        { val: 0, inMin: -1, inMax: 1, outMin: 10, outMax: 20, expected: 15 },
        { val: -10, inMin: -1, inMax: 1, outMin: 10, outMax: 20, expected: 10 },
        { val: 100, inMin: 0, inMax: 1, outMin: 10, outMax: 50, expected: 50 },
        { val: 250, inMin: 0, inMax: 500, outMin: 0, outMax: 1, expected: 0.5 },
    ];
    for (let i = 0; i < pruebas.length; i++) {
        const argumentos = pruebas[i];
        const ans = MyColor.interpolateClamp(argumentos);
        if (ans != argumentos.expected) {
            throw new Error(`Se esperaba ${argumentos.expected} pero se obtuvo ${ans} con ${JSON.stringify(argumentos)}`);
        }
    }
}

test2();