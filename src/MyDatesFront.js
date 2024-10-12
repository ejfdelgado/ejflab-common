const dateformat = require('dateformat');
const { MyDates } = require('./MyDates.js');

class MyDatesFront extends MyDates {
    static timeDifference = 0;
    static {
        // Se captura la fecha del html
        const serverTime = document
            .getElementById('meta_time')
            ?.getAttribute('content');
        if (typeof serverTime == 'string' && serverTime.length > 0) {
            this.timeDifference = new Date().getTime() - parseInt(serverTime);
        }
    }
    static formatDate(now, ...args) {
        return MyDates.formatDateBasic(dateformat.default, now, args);
    }
    static formatDateCompleto(now, ...args) {
        return MyDates.formatDateCompletoBasic(dateformat.default, now, args);
    }
    static formatDateSimple(now, ...args) {
        return MyDates.formatDateSimpleBasic(dateformat.default, now, args);
    }
    static formatTime(now, ...args) {
        return MyDates.formatTimeBasic(dateformat.default, now, args);
    }
    static getServerTime() {
        return new Date().getTime() - this.timeDifference;
    }
    static autoConfigure(lan = null) {
        if (!lan) {
            lan = MyDates.getSelectedLanguage();
        }
        MyDates.configureLocale(dateformat.i18n, dateformat.masks, lan);
    }
}
MyDatesFront.autoConfigure();

module.exports = {
    MyDatesFront
};