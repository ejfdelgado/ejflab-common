const { CsvFormatterFilters } = require("./CsvFormatterFilters");
const { MyTemplate } = require("./MyTemplate");


function myTest() {
    const renderer = new MyTemplate();

    const cases = [
        {
            txt: "my name is ${name} and I like ${colors.0.id|mapColor} ${colors.0.id|personal:1:2:3}",
            data: { name: "Edgar", colors: [{ id: 1 }] },
            exp: "my name is Edgar and I like red 1-1-2-3",
        },
        {
            txt: "All combines: $[for color in ${colors}]$[for name in ${names}]Color ${color.id|mapColor} + ${name}, $[endfor]$[endfor]",
            data: { names: { first: "Edgar", last: "Delgado" }, colors: [{ id: 1 }, { id: 2 }] },
            exp: "All combines: Color red + Edgar, Color red + Delgado, Color blue + Edgar, Color blue + Delgado, ",
        },
        {
            txt: "Esto es una prueba $[for parent in ${parents}] parent ${parent.name} has $[for child in ${parent.children}] ${child.name} $[endfor] $[endfor] here there is nothing",
            data: {
                parents: [
                    { name: "Dog", children: [{ name: "Pepito" }, { name: "Cuco" }] },
                    { name: "Bird", children: [{ name: "Fly" }, { name: "Shym" }] },
                    { name: "Cat", children: [] }
                ]
            },
            exp: "Esto es una prueba  parent Dog has  Pepito  Cuco   parent Bird has  Fly  Shym   parent Cat has   here there is nothing",
        },
        {
            txt: "Esto es una prueba $[for parent in ${parents}] parent ${parent.name} has $[for child in ${parent.children}] ${child.name} $[endfor] $[endfor] here there is nothing",
            data: {
                parents: [
                    { name: "Dog", children: undefined },
                    { name: "Bird" },
                    { name: "Cat", children: null }
                ]
            },
            exp: "Esto es una prueba  parent Dog has   parent Bird has   parent Cat has   here there is nothing",
        },
        {
            txt: 'Es $[if ${color.id} == "texto" && ${algo} === undefined && ${otro.valor} == ${color.id} ] Es uno $[endif] fin',
            data: { color: { id: "texto" }, otro: { valor: "texto" } },
            exp: "Es  Es uno  fin",
        },
        {
            txt: "Es $[if ${color.id} == 1 && ${algo} === undefined ]Verdadero$[else]Falso$[endif] fin",
            data: { color: { id: 2 } },
            exp: "Es Falso fin",
        },
        {
            txt: 'Es $[if ${color.id} == 1 && ${algo} === undefined ]Verdadero$[else]pero acá es $[if typeof ${color} == "object" ]Sí$[else]No$[endif]$[endif] fin',
            data: { color: { id: 2 } },
            exp: "Es pero acá es Sí fin",
        },
        {
            txt: 'Filtrado $[for el in ${arreglo}]$[if ${el.num} >= 3]${el.num} ${el.txt}$[endif]$[endfor]',
            data: {
                arreglo: [
                    { num: 1, txt: "no debe salir" },
                    { num: 2, txt: "tampoco debe salir" },
                    { num: 3, txt: "sí debe salir" }
                ]
            },
            exp: "Filtrado 3 sí debe salir",
        },
        {
            txt: "my name is ${name} ${lastname} and I like ${colors.0.id} ${colors.0.id}",
            data: { lastname: "Delgado" },
            exp: "my name is ${name} Delgado and I like ${colors.0.id} ${colors.0.id}",
            skipUndefined: true,
        },
        {
            txt: "my name is ${name} ${lastname} and I like ${colors.0.id} ${colors.0.id}",
            data: { lastname: "Delgado" },
            exp: "my name is undefined Delgado and I like undefined undefined",
            skipUndefined: false,
        },
        {
            txt: "My ${index} lastname is ${lastname.${index}}",
            data: { lastname: ["delgado", "leyton"], index: 0 },
            exp: "My 0 lastname is delgado",
            skipUndefined: false,
        },
        {
            txt: "My ${index} lastname is ${lastname.${index}.detail}",
            data: { lastname: [{ detail: "delgado" }, { detail: "leyton" }], index: 0 },
            exp: "My 0 lastname is delgado",
            skipUndefined: false,
        },
        {
            txt: 'My ${ now | epoch2date : "mmm d yyyy" : "otro"}',
            data: { now: new Date().getTime(), index: 0 },
            exp: "My nada",
            skipUndefined: false,
        },
        {
            txt: ' $[for el1 in ${abuelo}] $[for el2 in ${el1.padre}] $[for el3 in ${el2.hijo}] ${el3.name} $[endfor] $[endfor] $[endfor] ',
            data: {
                abuelo: [
                    {
                        padre: [
                            {
                                hijo: [
                                    {name: "Hugo"}
                                ]
                            },
                            {
                                hijo: [
                                    {name: "Paco"}
                                ]
                            },
                            {
                                hijo: [
                                    {name: "Luis"}
                                ]
                            },
                        ]
                    }
                ]
            },
            exp: "    Hugo    Paco    Luis    ",
            skipUndefined: false,
        },
    ];

    renderer.registerFunction("json", CsvFormatterFilters.json);
    renderer.registerFunction("mapColor", CsvFormatterFilters.map({ 1: "red", 2: "blue" }));
    renderer.registerFunction("personal", (val, ...args) => {
        return val + "-" + args.join("-");
    });
    renderer.registerFunction("rand", CsvFormatterFilters.rand);
    renderer.registerFunction("epoch2date", (value, ...args) => {
        return "nada";
    });

    for (let i = 0; i < cases.length; i++) {
        const myCase = cases[i];
        const actual = renderer.render(myCase.txt, myCase.data, myCase.skipUndefined === true);
        //console.log(actual);
        if (actual !== myCase.exp) {
            throw Error(`expected:\n${JSON.stringify(myCase.exp)}\nactual:\n${JSON.stringify(actual)}`);
        } else {
            console.log(`case ${i + 1} OK!`);
        }
    }

    console.log(renderer.render('Todo salió bien ${person.name} ${o|rand:"azul":"amarillo":"verde"}', { person: { name: "Amigo" }, n: null }));
}

myTest();