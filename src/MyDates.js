const offset = new Date().getTimezoneOffset() / 60;

// https://www.npmjs.com/package/dateformat

class MyDates {
    static getSelectedLanguage() {
        const urlParams = new URLSearchParams(window.location.search);
        const lan = urlParams.get('l');
        return lan;
    }
    static configureLocale(i18n, masks, lan = "es") {
        if (lan == "es") {
            i18n.dayNames = [
                "Dom",
                "Lun",
                "Mar",
                "Mié",
                "Jue",
                "Vie",
                "Sab",
                "Domingo",
                "Lunes",
                "Martes",
                "Miércoles",
                "Jueves",
                "Viernes",
                "Sábado",
            ];

            i18n.monthNames = [
                "Ene",
                "Feb",
                "Mar",
                "Abr",
                "May",
                "Jun",
                "Jul",
                "Ago",
                "Sep",
                "Oct",
                "Nov",
                "Dic",
                "Enero",
                "Febrero",
                "Marzo",
                "Abril",
                "Mayo",
                "Junio",
                "Julio",
                "Agosto",
                "Septiembre",
                "Octubre",
                "Noviembre",
                "Diciembre",
            ];
        } else if (lan == "en") {
            i18n.dayNames = [
                "Sun",
                "Mon",
                "Thu",
                "Wed",
                "Thr",
                "Fri",
                "Sat",
                "Sunday",
                "Monday",
                "Thuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ];

            i18n.monthNames = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ];
        }

        i18n.timeNames = ["a", "p", "am", "pm", "A", "P", "AM", "PM"];

        masks.opcion1 = 'dddd, mmmm d, yyyy';
        masks.opcion2 = 'dddd, mmmm d';

        masks.simple1 = 'ddd d mmm, yyyy';
        masks.simple2 = 'ddd d mmm';

        masks.opcion3 = 'h:MM TT';

        // yyyy-MM-ddTHH:mm:ss
        // https://www.npmjs.com/package/dateformat
        masks.opcionPayu = 'yyyy-mm-dd"T"HH:MM:ss';

        masks.completo1 = 'ddd d mmm, yyyy h:MM:ss TT';
        masks.completo2 = 'ddd d mmm h:MM:ss TT';
    }
    static getDates(epoch) {
        let hoy;
        if (typeof epoch == "number") {
            hoy = new Date(epoch);
        } else {
            hoy = new Date();
        }
        const manana = new Date(hoy.getTime());
        manana.setDate(manana.getDate() + 1);
        const mananaInicio = new Date(manana.getUTCFullYear(), manana.getUTCMonth(), manana.getUTCDate());
        const ayer = new Date(hoy.getTime());
        ayer.setDate(ayer.getDate() - 1);
        const actual = MyDates.getDayAsContinuosNumber(hoy);
        const siguiente = MyDates.getDayAsContinuosNumber(manana);
        const anterior = MyDates.getDayAsContinuosNumber(ayer);
        return {
            actual,
            siguiente,
            anterior,
            deadline: (mananaInicio.getTime() - hoy.getTime()),
        };
    }
    // MyDates.getDefaults(args)
    static getDefaults(args, currentYear, nextYears, myDefault = "") {
        if (args instanceof Array) {
            if (args.length == 1) {
                currentYear = args[0];
                nextYears = args[0];
            } else if (args.length == 2) {
                currentYear = args[0];
                nextYears = args[1];
            }
            if (args.length >= 3) {
                myDefault = args[2];
            }
        }
        return {
            currentYear,
            nextYears,
            myDefault
        };
    }

    static formatDateBasic(dateformat, now, ...args) {
        const {
            currentYear,
            nextYears,
            myDefault
        } = MyDates.getDefaults(args, "opcion2", "opcion1", "Día / Mes / Año");
        if (now instanceof Date) {
            if (new Date().getFullYear() == now.getFullYear()) {
                return dateformat(now, currentYear);
            } else {
                return dateformat(now, nextYears);
            }
        } else {
            return myDefault;
        }
    }
    static formatDateSimpleBasic(dateformat, now, ...args) {
        const {
            currentYear,
            nextYears,
            myDefault
        } = MyDates.getDefaults(args, "simple2", "simple1", "Día / Mes / Año");
        if (now instanceof Date) {
            if (new Date().getFullYear() == now.getFullYear()) {
                return dateformat(now, currentYear);
            } else {
                return dateformat(now, nextYears);
            }
        } else {
            return myDefault;
        }
    }
    static formatDateCompletoBasic(dateformat, now, ...args) {
        const {
            currentYear,
            nextYears,
            myDefault
        } = MyDates.getDefaults(args, "completo2", "completo1", "Día / Mes / Año Hora:Minutos:Segundos");
        if (now instanceof Date) {
            if (new Date().getFullYear() == now.getFullYear()) {
                return dateformat(now, currentYear);
            } else {
                return dateformat(now, nextYears);
            }
        } else {
            return myDefault;
        }
    }
    static formatTimeBasic(dateformat, now, ...args) {
        const {
            currentYear,
            nextYears,
            myDefault
        } = MyDates.getDefaults(args, "opcion3", "opcion3", "Hora / Minuto");
        if (now instanceof Date) {
            return dateformat(now, currentYear);
        } else {
            return myDefault;
        }
    }
    static formatPayu(dateformat, now) {
        if (now instanceof Date) {
            return dateformat(now, "opcionPayu");
        } else {
            return null;
        }
    }
    static createDuration(dias = 0, horas = 0, minutos = 0) {
        const actual = new Date(1970, 0, dias + 1, horas - offset, minutos).getTime();
        return actual;
    }
    static getDaysFromDuration(epoch) {
        return new Date(epoch).getUTCDate() - 1;
    }
    static getHoursFromDuration(epoch) {
        return new Date(epoch).getUTCHours();
    }
    static getMinutesFromDuration(epoch) {
        return new Date(epoch).getUTCMinutes();
    }
    static AAAAMMDD2unixUTC(aaaammdd) {
        let temporal = aaaammdd;
        const fecha = new Date(0);
        const dia = temporal % 100;
        temporal = Math.floor((temporal - dia) / 100);
        const mes = temporal % 100;
        const anio = Math.floor((temporal - mes) / 100);
        //console.log(`${anio} / ${mes} / ${dia}`);
        fecha.setUTCDate(dia);
        fecha.setUTCMonth(mes - 1);
        fecha.setUTCFullYear(anio);
        return fecha.getTime();
    }
    static AAAAMMDD2unix(aaaammdd) {
        let temporal = aaaammdd;
        const fecha = new Date(0);
        const dia = temporal % 100;
        temporal = Math.floor((temporal - dia) / 100);
        const mes = temporal % 100;
        const anio = Math.floor((temporal - mes) / 100);
        //console.log(`${anio} / ${mes} / ${dia}`);
        fecha.setDate(dia);
        fecha.setMonth(mes - 1);
        fecha.setFullYear(anio);
        return fecha.getTime();
    }
    static AAAAMMDDhhmmss2unixUTC(aaaammdd) {
        let temporal = aaaammdd;
        const fecha = new Date(0);
        const segundos = temporal % 100;
        temporal = Math.floor((temporal - segundos) / 100);
        const minutos = temporal % 100;
        temporal = Math.floor((temporal - minutos) / 100);
        const horas = temporal % 100;
        temporal = Math.floor((temporal - horas) / 100);
        const dia = temporal % 100;
        temporal = Math.floor((temporal - dia) / 100);
        const mes = temporal % 100;
        const anio = Math.floor((temporal - mes) / 100);
        //console.log(`${anio} / ${mes} / ${dia} - ${horas}:${minutos}:${segundos}`);
        fecha.setUTCSeconds(segundos);
        fecha.setUTCMinutes(minutos);
        fecha.setUTCHours(horas);
        fecha.setUTCDate(dia);
        fecha.setUTCMonth(mes - 1);
        fecha.setUTCFullYear(anio);
        return fecha.getTime();
    }
    static AAAAMMDDhhmmss2unix(aaaammdd) {
        let temporal = aaaammdd;
        const fecha = new Date(0);
        const segundos = temporal % 100;
        temporal = Math.floor((temporal - segundos) / 100);
        const minutos = temporal % 100;
        temporal = Math.floor((temporal - minutos) / 100);
        const horas = temporal % 100;
        temporal = Math.floor((temporal - horas) / 100);
        const dia = temporal % 100;
        temporal = Math.floor((temporal - dia) / 100);
        const mes = temporal % 100;
        const anio = Math.floor((temporal - mes) / 100);
        //console.log(`${anio} / ${mes} / ${dia} - ${horas}:${minutos}:${segundos}`);
        fecha.setSeconds(segundos);
        fecha.setMinutes(minutos);
        fecha.setHours(horas);
        fecha.setDate(dia);
        fecha.setMonth(mes - 1);
        fecha.setFullYear(anio);
        return fecha.getTime();
    }
    static getDayAsContinuosNumber(fecha) {
        const anio = fecha.getUTCFullYear();
        const mes = fecha.getUTCMonth() + 1;
        const dia = fecha.getUTCDate();
        return dia + 100 * mes + anio * 10000;
    }
    // Esta función es muy peligrosa porque supera MAX SAFE INTEGER constant is 
    //9007199254740991
    //20231204093015
    static getDayAsContinuosNumberHmmSSmmm(fecha) {
        const anio = fecha.getUTCFullYear();
        const mes = fecha.getUTCMonth() + 1;
        const dia = fecha.getUTCDate();
        const horas = fecha.getUTCHours();//00
        const minutos = fecha.getUTCMinutes();//00
        const segundos = fecha.getUTCSeconds();//00
        const milisegundos = fecha.getUTCMilliseconds();//000
        return milisegundos + 1000 * segundos + minutos * 100000 + horas * 10000000 + dia * 1000000000 + 100000000000 * mes + anio * 10000000000000;
    }
    static getDayAsContinuosNumberHmmSS(fecha) {
        const anio = fecha.getUTCFullYear();
        const mes = fecha.getUTCMonth() + 1;
        const dia = fecha.getUTCDate();
        const horas = fecha.getUTCHours();//00
        const minutos = fecha.getUTCMinutes();//00
        const segundos = fecha.getUTCSeconds();//00
        return segundos + minutos * 100 + horas * 10000 + dia * 1000000 + 100000000 * mes + anio * 10000000000;
    }
    static isToday(someDate) {
        const fecha = new Date(someDate);
        const ahora = new Date();
        const anio0 = ahora.getFullYear();
        const mes0 = ahora.getMonth();
        const dia0 = ahora.getDate();

        const isToday = (fecha.getFullYear() == anio0 && fecha.getMonth() == mes0 && fecha.getDate() == dia0);
        return isToday;
    }

    static lPad2(n) {
        return ('0' + n).slice(-2);
    }

    static lPad3(n) {
        return ('00' + n).slice(-3);
    }

    static listGenerator(min, max, pad = false) {
        const response = [];
        if (!pad) {
            for (let i = min; i <= max; i++) {
                response.push({ label: "" + i, value: "" + i })
            }
        } else {
            for (let i = min; i <= max; i++) {
                response.push({ label: MyDates.lPad2(i), value: "" + i })
            }
        }
        return response;
    }

    static toAAAAMMDD(siguiente, predeterminado = "") {
        if (typeof siguiente == "string") {
            siguiente = parseInt(siguiente);
        }
        if (typeof siguiente == "number") {
            if (isNaN(siguiente)) {
                return predeterminado;
            }
            siguiente = new Date(siguiente);
        }
        if (!(siguiente instanceof Date)) {
            return predeterminado;
        }
        const anio1 = siguiente.getFullYear();
        const mes1 = siguiente.getMonth() + 1;
        const dia1 = siguiente.getDate();
        return anio1 + MyDates.lPad2(mes1) + MyDates.lPad2(dia1);
    }

    static toHHMMssmm(siguiente) {
        const esNegativo = (siguiente < 0);
        if (esNegativo) {
            siguiente *= -1;
        }
        const segundosTemp = Math.floor(siguiente / 1000);
        const milis = siguiente - 1000 * segundosTemp;
        const segundos = segundosTemp % 60;
        let minutosTemp = (segundosTemp - segundos) / 60;
        const minutos = minutosTemp % 60;
        const hora = (minutosTemp - minutos) / 60;
        if (hora > 0) {
            return `${esNegativo ? '-' : ''}${MyDates.lPad2(hora)}:${MyDates.lPad2(minutos)}:${MyDates.lPad2(segundos)}.${MyDates.lPad3(milis)}`;
        } else {
            if (minutos > 0) {
                return `${esNegativo ? '-' : ''}${MyDates.lPad2(minutos)}:${MyDates.lPad2(segundos)}.${MyDates.lPad3(milis)}`;
            } else {
                if (segundos > 0) {
                    return `${esNegativo ? '-' : ''}${MyDates.lPad2(segundos)}.${MyDates.lPad3(milis)}`;
                } else {
                    return `${esNegativo ? '-' : ''}00.${MyDates.lPad3(milis)}`;
                }
            }
        }
    }

    static toAAAAMMDDHHmmss(siguiente, predeterminado = "") {
        if (typeof siguiente == "string") {
            siguiente = parseInt(siguiente);
        }
        if (typeof siguiente == "number") {
            if (isNaN(siguiente)) {
                return predeterminado;
            }
            siguiente = new Date(siguiente);
        }
        if (!(siguiente instanceof Date)) {
            return predeterminado;
        }
        const anio1 = siguiente.getFullYear();
        const mes1 = siguiente.getMonth() + 1;
        const dia1 = siguiente.getDate();
        const hora = siguiente.getHours();
        const minutos = siguiente.getMinutes();
        const segundos = siguiente.getSeconds();
        return `${anio1}/${MyDates.lPad2(mes1)}/${MyDates.lPad2(dia1)} ${MyDates.lPad2(hora)}:${MyDates.lPad2(minutos)}:${MyDates.lPad2(segundos)}`;
    }

    static secondsToHms(d) {
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);

        var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
        var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
        var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
        return hDisplay + mDisplay + sDisplay;
    }
}

module.exports = {
    MyDates
};