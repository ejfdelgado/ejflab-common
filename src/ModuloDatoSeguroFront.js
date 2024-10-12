
// ¿Cómo generar las llaves públicas y privadas?

//1. Se genera el par:
//openssl genrsa -out local_par.pem 256
//2. Se genera la llave pública:
//openssl rsa -in local_par.pem -pubout -out local_publica.crt
//3. Se genera la llave privada:
//openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in local_par.pem -out local_privada.key

//openssl genrsa -out local_par.pem 256 && openssl rsa -in local_par.pem -pubout -out local_publica.crt && openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in local_par.pem -out local_privada.key
//openssl genrsa -out local_par.pem 2048 && openssl rsa -in local_par.pem -pubout -out local_publica.crt && openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in local_par.pem -out local_privada.key
//openssl req -new -x509 -key local_privada.key -out local_publica.cer
//openssl x509 -in local_publica.crt -out local_publica.pem -outform PEM
const { Buffer } = require('buffer');
const { JSEncrypt } = require("jsencrypt");
const AES = require("crypto-js/aes");
const Utf8 = require("crypto-js/enc-utf8");
const { ModuloDatoSeguro } = require("./ModuloDatoSeguro.js");

class ModuloDatoSeguroFront extends ModuloDatoSeguro {
    // create a key for symmetric encryption
    // pass in the desired length of your key

    static cifrarSimple(objeto, llave) {
        return super.cifrarSimple(objeto, llave, AES)
    }

    static decifrarSimple(texto, llave) {
        return super.decifrarSimple(texto, llave, AES, Utf8);
    }

    static decifrarConListaDeLlaves(texto, llaves) {
        return super.decifrarConListaDeLlavesInterno(texto, llaves, AES, Utf8);
    }

    static cifrar = function (objeto, llavePublica) {
        llavePublica = llavePublica.replace('\n', '');
        const key = ModuloDatoSeguro.generateKey(10);
        const texto = JSON.stringify(objeto); //JSON
        const aesEncrypted = AES.encrypt(texto, key);
        const encryptedMessage = aesEncrypted.toString();
        // we create a new JSEncrypt object for rsa encryption
        const rsaEncrypt = new JSEncrypt();
        // we set the public key (which we passed into the function)
        rsaEncrypt.setPublicKey(llavePublica);
        // now we encrypt the key & iv with our public key
        const encryptedKey = rsaEncrypt.encrypt(key);
        //Se codifica en base 64 para que pueda viajar en la url

        return Buffer.from(JSON.stringify({
            llave: encryptedKey,
            mensaje: encryptedMessage,
        })).toString("base64");
    };

    static decifrar = function (texto, llavePrivada) {
        llavePrivada = llavePrivada.replace('\n', '');
        const decrypt = new JSEncrypt();
        decrypt.setPrivateKey(llavePrivada);
        const parametroSinBase64 = JSON.parse(Buffer.from(texto, "base64"));
        const llaveDesencriptada = decrypt.decrypt(parametroSinBase64["llave"]);
        var desencriptado = AES.decrypt(
            parametroSinBase64["mensaje"],
            llaveDesencriptada
        ).toString(Utf8);
        return JSON.parse(desencriptado);
    };
}

module.exports = {
    ModuloDatoSeguroFront
};