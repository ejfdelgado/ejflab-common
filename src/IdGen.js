const { MyConstants } = require("./MyConstants");

class IdGen {
  static RANDOM_SPACE = 3;
  static MAX_LENGTH_ORD_TEXT = 11 + Math.ceil(IdGen.RANDOM_SPACE * 0.63);
  static RANDOM_SPACE_MULT = Math.pow(10, IdGen.RANDOM_SPACE);
  static URL_GET_DATE = "srv/date";

  //Retorna un diferido con la fecha
  static diferenciaFechaServidor = null;
  static diferidoInvocacion = null;

  static async ahora() {
    return new Promise((resolve) => {
      const sincronizar = async function () {
        const response = await fetch(`${MyConstants.SRV_ROOT}${IdGen.URL_GET_DATE}`, {
          method: "GET",
        });
        const rta = await response.json();
        var temp = rta.unixtime;
        IdGen.diferenciaFechaServidor = new Date().getTime() - temp;
        resolve(temp);
        return;
      };

      const usarDiferencia = function () {
        var temp = new Date().getTime();
        resolve(temp - IdGen.diferenciaFechaServidor);
      };

      if (IdGen.diferenciaFechaServidor == null) {
        if (IdGen.diferidoInvocacion == null) {
          IdGen.diferidoInvocacion = sincronizar();
        } else {
          IdGen.diferidoInvocacion.then(function () {
            //Ya se puede usar la diferencia
            usarDiferencia();
          });
        }
      } else {
        usarDiferencia();
      }
    });
  }

  static async edad(birthday) {
    // birthday is a date
    const fecha = await ahora();
    var ageDifMs = fecha - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    var ans = Math.abs(ageDate.getUTCFullYear() - 1970);
    return ans;
  }

  static darInicioDia(epoch) {
    var start = new Date(epoch);
    start.setHours(0, 0, 0, 0);
    return start.getTime();
  }

  static darFinDia(epoch) {
    var end = new Date(epoch);
    end.setHours(23, 59, 59, 999);
    return end.getTime();
  }

  static darInicioMes(epoch) {
    var start = new Date(epoch);
    var firstDay = new Date(start.getFullYear(), start.getMonth(), 1);
    return firstDay.getTime();
  }

  static darFinMes(epoch) {
    var start = new Date(epoch);
    var lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);
    return lastDay.getTime();
  }

  //Solo año/mes/día
  static epoch2Text(tiempo) {
    if (typeof tiempo == "number") {
      var fecha = new Date(tiempo);
      return (
        fecha.getFullYear() +
        "/" +
        (fecha.getMonth() + 1) +
        "/" +
        fecha.getDate()
      );
    } else {
      return "";
    }
  }

  static getDateParts(tiempo) {
    var fecha = new Date(tiempo);
    const remplazos = {
      YYYY: fecha.getFullYear(),
      MM: IdGen.addZero(fecha.getMonth() + 1),
      DD: IdGen.addZero(fecha.getDate()),
      HH: IdGen.addZero(fecha.getHours()),
      mm: IdGen.addZero(fecha.getMinutes()),
      ss: IdGen.addZero(fecha.getSeconds()),
      zz: IdGen.addZero(fecha.getMilliseconds()),
      EPOCH: fecha.getTime(),
    };
    remplazos.yyyy = remplazos.YYYY;
    remplazos.dd = remplazos.DD;
    return remplazos;
  }

  //Año/mes/día hora:mm:ss
  static epoch2Text2(tiempo) {
    if (typeof tiempo == "number") {
      var partes = IdGen.getDateParts(tiempo);
      return (
        partes.YYYY +
        "/" +
        partes.MM +
        "/" +
        partes.DD +
        " " +
        partes.HH +
        ":" +
        partes.mm +
        ":" +
        partes.ss
      );
    } else {
      return "";
    }
  }

  static addZero(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }

  static async nuevo(epoch, useDayBounds) {
    if (typeof epoch == "number") {
      if (typeof useDayBounds == "boolean") {
        if (useDayBounds === true) {
          epoch = IdGen.darInicioDia(epoch);
        } else {
          epoch = IdGen.darFinDia(epoch);
        }
        return IdGen.num2ord(epoch, useDayBounds);
      } else {
        return IdGen.num2ord(epoch);
      }
    } else {
      const fecha = await IdGen.ahora();
      return IdGen.num2ord(fecha, useDayBounds);
    }
  }

  static async nuevoIni(epoch = null) {
    return await nuevo(epoch, true);
  }

  static async nuevoFin(epoch) {
    return await nuevo(epoch, false);
  }

  static ord2num(id) {
    var temp = parseInt(id, 36);
    temp = temp / IdGen.RANDOM_SPACE_MULT;
    return temp;
  }

  static num2ord(num, esInicio) {
    if (typeof num == "number") {
      let nuevo;
      if (typeof esInicio == "boolean") {
        if (esInicio === true) {
          nuevo = num * IdGen.RANDOM_SPACE_MULT;
        } else {
          nuevo = num * IdGen.RANDOM_SPACE_MULT + (IdGen.RANDOM_SPACE_MULT - 1);
        }
      } else {
        nuevo =
          num * IdGen.RANDOM_SPACE_MULT +
          Math.floor(Math.random() * IdGen.RANDOM_SPACE_MULT);
      }
      //console.log(num, nuevo);
      let temp = nuevo.toString(36);
      const diff = IdGen.MAX_LENGTH_ORD_TEXT - temp.length;
      if (diff > 0) {
        temp = new Array(diff).join("0") + temp;
      }
      //Intencionalmente, se cambia el último aleatorio por una 'a'
      return temp.slice(0, -1) + "a";
    }
    return null;
  }

  static num2ordIni(num) {
    return num2ord(num, true);
  }

  static num2ordFin(num) {
    return num2ord(num, false);
  }
}

module.exports = {
  IdGen
};