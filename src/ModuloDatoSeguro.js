
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

//const AES = require("crypto-js/aes");
//const Utf8 = require("crypto-js/enc-utf8");

class ModuloDatoSeguro {
  // create a key for symmetric encryption
  // pass in the desired length of your key
  static generateKey(keyLength = 10) {
    // define the characters to pick from
    const chars =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz*&-%/!?*+=()";
    let randomstring = "";
    for (let i = 0; i < keyLength; i++) {
      const rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
  };

  static cifrarSimple(objeto, llave, AES) {
    const texto = JSON.stringify(objeto);
    const encriptado = AES.encrypt(texto, llave);
    return encriptado.toString();
  }
  static decifrarSimple(texto, llave, AES, Utf8) {
    const desencriptado = AES.decrypt(texto, llave).toString(Utf8);
    return JSON.parse(desencriptado);
  }
  static decifrarConListaDeLlavesInterno(texto, llaves, AES, Utf8) {
    for (let i = 0; i < llaves.length; i++) {
      try {
        const llave = llaves[i];
        const temp = ModuloDatoSeguro.decifrarSimple(texto, llave, AES, Utf8);
        return temp;
      } catch (err) { }
    }
    return undefined;
  }
  static ofuscarTexto(txt, switchOrder = true, switchLettersWithNumbers = true, useSpace = " ") {
    let salida = "";
    const REMAPPING = {
      "i": "1",
      "I": "1",
      "a": "4",
      "A": "4",
      "e": "3",
      "E": "3",
      "s": "5",
      "S": "5",
      "t": "7",
      "T": "7",
      "o": "0",
      "O": "0",
    };
    const remapLet = (some) => {
      if (!switchLettersWithNumbers) {
        return some;
      }
      const nueva = REMAPPING[some];
      if (!nueva) {
        return some;
      }
      return nueva;
    };
    const remapArray = (some) => {
      let nuevo = "";
      for (let j = 0; j < some.length; j++) {
        nuevo += remapLet(some[j]);
      }
      return nuevo;
    };
    const REGEX = /[a-zA-ZáéíóúüÁÉÍÓÚñÑ]/;
    let pal = [];
    let copy = null;
    const mapFun = (character, i) => {
      let aleatorio = Math.floor(Math.random() * (copy.length - 1));
      if (aleatorio == i && copy.length > 1) {
        aleatorio += 1;
      }
      const actual = copy.splice(aleatorio, 1)[0];
      return actual;

    };
    const procesarPalabra = () => {
      if (pal.length > 0) {
        if (pal.length <= 3) {
          salida += remapArray(pal.join(''));
        } else {
          const ini = remapLet(pal.splice(0, 1)[0]);
          const fin = remapLet(pal.splice(pal.length - 1, 1)[0]);
          salida += ini;

          if (switchOrder) {
            copy = [].concat(pal);
            pal = pal.map(mapFun);
            salida += remapArray(pal.join(''));
          } else {
            salida += remapArray(pal.join(''));
          }
          salida += fin;
        }
        pal = [];
      }
    };
    for (let i = 0; i < txt.length; i++) {
      const act = txt[i];
      if (REGEX.test(act)) {
        // Busco la palabra completa
        pal.push(act);
      } else {
        // Se revisa si hay una palabra antes
        procesarPalabra();
        // Pasa derecho
        if (act == " ") {
          salida += useSpace;
        } else {
          salida += act;
        }
      }
    }
    procesarPalabra();
    return salida;
  }
}

module.exports = {
  ModuloDatoSeguro
};