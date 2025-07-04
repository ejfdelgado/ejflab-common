
class MyCookies {
    static setCookie(cname, cvalue, exdays = 10000) {
        const d = new Date();
        d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
        let expires = 'expires=' + d.toUTCString();
        document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
    }

    static getCookie(cname, def = null) {
        let name = cname + '=';
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return def;
    }

    static deleteCookie(cname) {
        document.cookie =
            cname + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
}

module.exports = {
    MyCookies
};