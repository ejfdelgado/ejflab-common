import NodeRSA from "node-rsa";
import pkgCriptoJs from 'crypto-js';
const { AES } = pkgCriptoJs;
import Utf8 from "crypto-js/enc-utf8.js";
import { ModuloDatoSeguro } from "./ModuloDatoSeguro.js";

export class ModuloDatoSeguroBack extends ModuloDatoSeguro {
    static SCHEMES = ["pkcs1", "pkcs8", "openssh"];
    static KEY_TYPES = ["public", "private"];
    static scheme_default = ModuloDatoSeguroBack.SCHEMES[0];

    static cifrarSimple(objeto, llave) {
        return super.cifrarSimple(objeto, llave, AES)
    }

    static decifrarSimple(texto, llave) {
        return super.decifrarSimple(texto, llave, AES, Utf8);
    }

    static generateKeyPair = (tamanio = 512) => {
        const key = new NodeRSA({ b: tamanio });
        key.setOptions({ encryptionScheme: ModuloDatoSeguroBack.scheme_default });
        const respose = {
            public: key.exportKey(`${ModuloDatoSeguroBack.SCHEMES[0]}-${ModuloDatoSeguroBack.KEY_TYPES[0]}-pem`),
            private: key.exportKey(`${ModuloDatoSeguroBack.SCHEMES[0]}-${ModuloDatoSeguroBack.KEY_TYPES[1]}-pem`),
        };
        return respose;
    };
    static cifrar(objeto, llavePublica) {
        llavePublica = llavePublica.replace('\n', '');
        const miniKey = ModuloDatoSeguro.generateKey(10);
        const format = `${ModuloDatoSeguroBack.scheme_default}-${ModuloDatoSeguroBack.KEY_TYPES[0]}-pem`;
        const key = new NodeRSA(llavePublica, format);
        const encryptedKey = key.encrypt(miniKey, 'base64');
        const texto = JSON.stringify(objeto);
        const aesEncrypted = AES.encrypt(texto, miniKey);
        const encryptedMessage = aesEncrypted.toString();
        return Buffer.from(JSON.stringify({
            llave: encryptedKey,
            mensaje: encryptedMessage,
        })).toString("base64");

    }
    static decifrar(texto, llavePrivada) {
        llavePrivada = llavePrivada.replace('\n', '');
        const parametroSinBase64 = JSON.parse(Buffer.from(texto, "base64"));
        const key = new NodeRSA(llavePrivada, `${ModuloDatoSeguroBack.scheme_default}-${ModuloDatoSeguroBack.KEY_TYPES[1]}-pem`);
        const llaveDesencriptada = key.decrypt(parametroSinBase64["llave"], 'utf8');
        var desencriptado = AES.decrypt(
            parametroSinBase64["mensaje"],
            llaveDesencriptada
        ).toString(Utf8);
        return JSON.parse(desencriptado);
    }
}
