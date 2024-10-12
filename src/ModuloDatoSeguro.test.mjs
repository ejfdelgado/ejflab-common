//const { ModuloDatoSeguro } = require('./ModuloDatoSeguro.js');
//const NodeRSA = require('node-rsa');
//const fs = require('fs');

import { ModuloDatoSeguroBack } from "./ModuloDatoSeguroBack.mjs";

//const { ModuloDatoSeguroBack } = require('./ModuloDatoSeguroBack');

const test = () => {
    //https://stackoverflow.com/questions/12524994/encrypt-decrypt-using-pycrypto-aes-256
    const rand = ModuloDatoSeguroBack.generateKey(4);
    const dato = `LaPdRu17bzZxOaguGU1Q_${rand}`;
    const clave = ModuloDatoSeguroBack.generateKey(4);
    const encriptado = ModuloDatoSeguroBack.cifrarSimple(dato, clave);
    console.log(encriptado);
    const desencriptado = ModuloDatoSeguroBack.decifrarSimple(encriptado, clave);
    console.log(dato + " => " + ` ${clave} ` + encriptado + ' => ' + desencriptado);
}

const test2 = () => {
    const par = ModuloDatoSeguroBack.generateKeyPair();
    const prueba = { valor: "LaPdRu17bzZxOaguGU1Q" };
    const cifrado = ModuloDatoSeguroBack.cifrar(prueba, par.public);
    console.log(cifrado);
    const decifrado = ModuloDatoSeguroBack.decifrar(cifrado, par.private);
    console.log(decifrado);
}

test();
//test2();

/*
const texto = "Una calurosa mañana, se encontraba Tío Conejo recolectando zanahorias para el almuerzo. De repente, escuchó un rugido aterrador: ¡era Tío Tigre! \
—¡Ajá, Tío Conejo! —dijo el felino—. No tienes escapatoria, pronto te convertirás en un delicioso bocadillo. \
En ese instante, Tío Conejo notó unas piedras muy grandes en lo alto de la colina e ideó un plan. \
—Puede que yo sea un delicioso bocadillo, pero estoy muy flaquito —dijo Tío Conejo—. Mira hacia la cima de la colina, ahí tengo mis vacas y te puedo traer una. ¿Por qué conformarte con un pequeño bocadillo, cuando puedes darte un gran banquete? \
Como Tío Tigre se encontraba de cara al sol, no podía ver con claridad y aceptó la propuesta. Entonces le permitió a Tío Conejo ir colina arriba mientras él esperaba abajo. \
Al llegar a la cima de la colina, Tío Conejo gritó: \
—Abre bien los brazos Tío Tigre, estoy arreando la vaca más gordita. \
Entonces, Tío Conejo se acercó a la piedra más grande y la empujó con todas sus fuerzas. La piedra rodó rápidamente. \
Tío Tigre estaba tan emocionado que no vio la enorme piedra que lo aplastó, dejándolo adolorido por meses. \
Tío Conejo huyó saltando de alegría.";
console.log(ModuloDatoSeguroBack.ofuscarTexto(texto, true, true, "/"));
console.log(ModuloDatoSeguroBack.ofuscarTexto("Un computador no puede procesar una imagen que tenga esto", true, true, "/")):
*/