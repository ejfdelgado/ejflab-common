const { MyDates } = require('./MyDates.js');

const pool = [
    { input: 5156, expected: "05.156" },
    { input: 61156, expected: "01:01.156" },
    { input: 121156, expected: "02:01.156" },
    { input: -5156, expected: "-05.156" },
    { input: -61156, expected: "-01:01.156" },
    { input: -121156, expected: "-02:01.156" },
    { input: 3600010, expected: "01:00:00.010" },
    { input: 3600000, expected: "01:00:00.000" },
];
console.log("Testing...");
for (let i = 0; i < pool.length; i++) {
    const { input, expected } = pool[i];
    const actual = MyDates.toHHMMssmm(input);
    if (actual != expected) {
        throw new Error(`Para ${input} se esperaba ${expected} pero se tuvo ${actual}`);
    }
}

const prueba = MyDates.AAAAMMDDhhmmss2unix(20180101000000);
console.log(`prueba = ${MyDates.getDayAsContinuosNumberHmmSS(new Date(prueba))}`);

const response = MyDates.secondsToHms(1000);
console.log(response);
