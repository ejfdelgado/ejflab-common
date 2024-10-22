class MyUtilities {
    static MIN_LENGTH_TOKENS = 3;
    static MAX_LENGTH_TOKENS = 25;
    static LISTA_NEGRA_TOKENS = [
        'de', 'en', 'con', 'para', 'el', 'él',
        'la', 'sin', 'mas', 'ella', 'ellos',
        'es', 'un', 'una', 'mas', 'pero', 'aún',
        'aunque', 'sino', 'que', 'no', 'porque', 'pues'];

    static stringify(circ) {
        const cache = [];
        const text = JSON.stringify(circ, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (cache.includes(value)) return;
                cache.push(value);
            }
            return value;
        });
        cache = null;
        return text;
    };
    static htmlEntities(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }
    static splitPageData(path) {
        const partes = /(\/[^/]+)(\/\d+|\/)?/ig.exec(path);
        let pageId = null;
        if (typeof partes[2] == "string") {
            pageId = parseInt(partes[2].replace("/", ""));
        }
        return {
            pageId,
            pageType: partes[1],
        };
    }
    static partirTexto(q, buscable = true, permisivo = false) {
        //solo minusculas
        q = q.toLowerCase();
        //Quito caracteres no validos
        if (!permisivo) {
            q = q.replace(/[^\w\d\sá-úü]/g, '');
        }
        //Reemplazar tildes dieresis 
        q = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        let tokens = q.split(/\s+/);
        // Elimino textos con tamaño pequeño
        tokens = tokens.filter((word) => { return word.length >= MyUtilities.MIN_LENGTH_TOKENS });

        // Elimino textos con tamaño grande
        tokens = tokens.filter((word) => { return word.length <= MyUtilities.MAX_LENGTH_TOKENS });

        // Elimino los que pertenecen a la lista negra
        tokens = tokens.filter((word) => { return MyUtilities.LISTA_NEGRA_TOKENS.indexOf(word) < 0 });

        if (buscable) {
            // Se debe partir en pedazos mas pequeños cada palabra
            tokens = tokens.reduce((acc, word, index) => {
                let temp = word;
                do {
                    acc.push(temp);
                    temp = temp.substring(0, temp.length - 1);
                } while (temp.length >= MyUtilities.MIN_LENGTH_TOKENS);
                return acc;
            }, []);

            //Elimino duplicados
            tokens = tokens.filter((word, index) => { return (index == tokens.indexOf(word)) });
        } else {
            tokens = tokens.filter((word, index) => { return (index == tokens.indexOf(word)) });
        }

        return tokens;
    }
    static isHidden(el) {
        let is = (el.offsetParent === null);
        if (!is) {
            const style = window.getComputedStyle(el);
            return (style.display === 'none');
        }
        return is;
    }
    static downloadTextData({ text = "", mime = "text/plain", filename = "file.txt" }) {
        function downloadBlob(blob, name) {
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = name;
            document.body.appendChild(link);
            link.dispatchEvent(
                new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                })
            );
            document.body.removeChild(link);
        }
        function text2Blob(bstr, mime) {
            return new Blob([bstr], { type: mime });
        }
        const blob2 = text2Blob(text, mime);
        downloadBlob(blob2, filename);
    }

    static async replaceAsync(str, regex, asyncFn) {
        const promises = [];
        str.replace(regex, (match, ...args) => {
            const promise = asyncFn(match, ...args);
            promises.push(promise);
        });
        const data = await Promise.all(promises);
        return str.replace(regex, () => data.shift());
    }

    static async replaceAsync2(str, regex, asyncFn) {
        const promises = [];
        str.replace(regex, (match, ...args) => {
            const promise = asyncFn(match, ...args);
            promises.push(promise);
        });
        const data = await Promise.all(promises);
        const copy = [...data];
        return {
            first: str.replace(regex, () => data.shift()[0]),
            second: str.replace(regex, () => copy.shift()[1]),
        }
    }

    // MyUtilities.removeRepeatedSlash(
    static removeRepeatedSlash(url) {
        if (/^https?:/.test(url)) {
            return url.replace(/^(https?:\/\/)(.*)$/g, (a, b, c) => {
                return b + c.replace(/[/]{2,}/g, '/');
            });
        } else {
            return url.replace(/[/]{2,}/g, '/');
        }
    }
}

module.exports = {
    MyUtilities
};