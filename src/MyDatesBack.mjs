import dateFormat, { masks, i18n } from "dateformat";
import { MyDates } from './MyDates.js';

MyDates.configureLocale(i18n, masks);
export default class MyDatesBack extends MyDates {
    static formatDate(now, ...args) {
        return MyDates.formatDateBasic(dateFormat, now, args);
    }
    static formatDateSimple(now, ...args) {
        return MyDates.formatDateSimpleBasic(dateFormat, now, args);
    }
    static formatTime(now, ...args) {
        return MyDates.formatTimeBasic(dateFormat, now, args);
    }
    static formatDateCompleto(now, ...args) {
        return MyDates.formatDateCompletoBasic(dateFormat, now, args);
    }
    static formatPayu(now) {
        return MyDates.formatPayu(dateFormat, now);
    }
}