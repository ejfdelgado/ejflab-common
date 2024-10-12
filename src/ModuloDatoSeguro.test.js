const { ModuloDatoSeguro } = require('./ModuloDatoSeguro.js');
const NodeRSA = require('node-rsa');
const fs = require('fs');
const { ModuloDatoSeguroFront } = require('./ModuloDatoSeguroFront.js');

const test = () => {
    //https://stackoverflow.com/questions/12524994/encrypt-decrypt-using-pycrypto-aes-256
    const dato = "edgar jose fernando";
    const clave = ModuloDatoSeguroFront.generateKey(4);
    const encriptado = ModuloDatoSeguroFront.cifrarSimple(dato, clave);
    console.log(encriptado);
    const desencriptado = ModuloDatoSeguroFront.decifrarSimple(encriptado, clave);
    console.log(dato + "=>" + encriptado + '=>' + desencriptado);
}

const test2 = () => {
    const par = ModuloDatoSeguroFront.generateKeyPair();
    const prueba = { valor: "LaPdRu17bzZxOaguGU1Q" };
    const cifrado = ModuloDatoSeguroFront.cifrar(prueba, par.public);
    console.log(cifrado);
    const decifrado = ModuloDatoSeguroFront.decifrar(cifrado, par.private);
    console.log(decifrado);
}

// 

//test();

test2();
