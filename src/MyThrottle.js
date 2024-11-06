
// Low pressure implementation in two ways...

function debounce(fn, delay) {
    let timer = null;

    return (...args) => {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => fn(...args), delay)
    }
}

/*
const GAP_ms = 500;
Si quieres tener en cuenta solo la primera invocación e ignorar las repetidas invocaciones con intervalos de menos de gap:
new MyThrottle(GAP_ms, true);

Si quieres tener en cuenta solo la última invocación entre repetidas invocaciones con intervalos de menos de gap:
new MyThrottle(GAP_ms, false);
*/
class MyThrottle {
    constructor(timeGap, useFirst = true) {
        this.timeGap = timeGap;
        this.useFirst = useFirst;
        this.lastCalledTime = 0;
        this.isCalling = false;
        this.isIgnoring = false;
    }

    throttle(promisedFunction) {
        const afterGap = () => {
            if (this.useFirst) {
                if (calledTime == this.lastCalledTime) {
                    // Listen again
                    this.isIgnoring = false;
                } else {
                    console.log("Ignoring...");
                }
            } else {
                this.isIgnoring = false;
            }
        };
        const calledTime = new Date().getTime();
        this.lastCalledTime = calledTime;
        if (this.useFirst && this.isIgnoring) {
            setTimeout(afterGap, this.timeGap);
        }
        if (this.isCalling || this.isIgnoring) {
            // Ignore
            console.log("Ignoring...");
            return;
        }
        const afterCall = () => {
            this.isCalling = false;
        };
        if (this.useFirst) {
            // Use first
            this.isCalling = true;
            this.isIgnoring = true;
            promisedFunction().finally(afterCall);
            setTimeout(afterGap, this.timeGap);
        } else {
            // Use last
            setTimeout(() => {
                if (calledTime == this.lastCalledTime) {
                    // Call!
                    this.isCalling = true;
                    promisedFunction().finally(afterCall);
                } else {
                    console.log("Ignoring...");
                }
            }, this.timeGap);
        }
    }
}

module.exports = {
    MyThrottle,
    debounce
};