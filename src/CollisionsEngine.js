class CollisionsEngine {
    constructor() {
        this.triggerCollide = [];
        this.triggerUncollide = [];
        this.sessionCollide = [];
        this.sessionUncollide = [];
    }
    static getCompoundKey(key, objectKey) {
        return `${key}:${objectKey}`;
    }
    collide(memory, key, objectKey) {
        let old = memory[key];
        if (!(old instanceof Array)) {
            old = [];
        }
        const indice = old.indexOf(objectKey);
        if (indice >= 0) {
            // Ya estaba, no tiene sentido el collide
            return false;
        }
        old.push(objectKey);
        memory[key] = old;
        const compoundKey = CollisionsEngine.getCompoundKey(key, objectKey);
        // Lo agrego a la detección de trigger de colisión
        const indiceTriggerCollide = this.triggerCollide.indexOf(compoundKey);
        if (indiceTriggerCollide < 0) {
            this.triggerCollide.push(compoundKey);
        }
        // Lo quito de la detección de dejar de colisionar
        const indiceTriggerUncollide = this.triggerUncollide.indexOf(compoundKey);
        if (indiceTriggerUncollide >= 0) {
            this.triggerUncollide.splice(compoundKey, 1);
        }
        return true;
    }
    uncollide(memory, key, objectKey) {
        let old = memory[key];
        if (!(old instanceof Array)) {
            old = [];
        }
        const indice = old.indexOf(objectKey);
        if (indice < 0) {
            // No estaba, no tiene sentido el uncollide
            return false;
        }
        old.splice(indice, 1);
        memory[key] = old;
        const compoundKey = CollisionsEngine.getCompoundKey(key, objectKey);
        // Lo quito de la detección de colisión
        const indiceTriggerCollide = this.triggerCollide.indexOf(compoundKey);
        if (indiceTriggerCollide >= 0) {
            this.triggerCollide.splice(indiceTriggerCollide, 1);
        }
        // Lo agrego a la detección de dejar de colisionar    
        const indiceTriggerUncollide = this.triggerUncollide.indexOf(compoundKey);
        if (indiceTriggerUncollide < 0) {
            this.triggerUncollide.push(compoundKey);
        }
        return true;
    }
    startSession() {
        this.sessionCollide = [];
        this.sessionUncollide = [];
    }
    endSession() {
        // Clear all readed collisions from triggerCollide
        let toErase = this.sessionCollide;
        for (let i = 0; i < toErase.length; i++) {
            const compoundKey = toErase[i];
            const indiceTriggerCollide = this.triggerCollide.indexOf(compoundKey);
            if (indiceTriggerCollide >= 0) {
                this.triggerCollide.splice(indiceTriggerCollide, 1);
            }
        }
        this.sessionCollide = [];
        // Clear all readed uncollisions from triggerUncollide
        toErase = this.sessionUncollide;
        for (let i = 0; i < toErase.length; i++) {
            const compoundKey = toErase[i];
            const indiceTriggerUncollide = this.triggerUncollide.indexOf(compoundKey);
            if (indiceTriggerUncollide >= 0) {
                this.triggerUncollide.splice(indiceTriggerUncollide, 1);
            }
        }
        this.sessionUncollide = [];

    }
    hadCollision(key, objectKey) {
        const compoundKey = CollisionsEngine.getCompoundKey(key, objectKey);
        const indiceTriggerCollide = this.triggerCollide.indexOf(compoundKey);
        if (indiceTriggerCollide >= 0) {
            if (this.sessionCollide.indexOf(compoundKey) < 0) {
                this.sessionCollide.push(compoundKey);
            }
            return true;
        }
        return false;
    }
    hadUncollision(key, objectKey) {
        const compoundKey = CollisionsEngine.getCompoundKey(key, objectKey);
        const indiceTriggerUncollide = this.triggerUncollide.indexOf(compoundKey);
        if (indiceTriggerUncollide >= 0) {
            if (this.sessionUncollide.indexOf(compoundKey) < 0) {
                this.sessionUncollide.push(compoundKey);
            }
            return true;
        }
        return false;
    }
    hasCollision(memory, key, objectKey) {
        //const compoundKey = CollisionsEngine.getCompoundKey(key, objectKey);
        // console.log(JSON.stringify(memory, null, 4));
        let old = memory[key];
        if (!(old instanceof Array)) {
            old = [];
        }
        const indice = old.indexOf(objectKey);
        if (indice >= 0) {
            return true;
        }
        return false;
    }
    hasNotCollision(memory, key, objectKey) {
        //const compoundKey = CollisionsEngine.getCompoundKey(key, objectKey);
        // console.log(JSON.stringify(memory, null, 4));
        let old = memory[key];
        if (!(old instanceof Array)) {
            old = [];
        }
        const indice = old.indexOf(objectKey);
        if (indice < 0) {
            return true;
        }
        return false;
    }
    hadUncollision(key, objectKey) {
        const compoundKey = CollisionsEngine.getCompoundKey(key, objectKey);
        const indiceTriggerUncollide = this.triggerUncollide.indexOf(compoundKey);
        if (indiceTriggerUncollide >= 0) {
            if (this.sessionUncollide.indexOf(compoundKey) < 0) {
                this.sessionUncollide.push(compoundKey);
            }
            return true;
        }
        return false;
    }
    static test() {
        const engine = new CollisionsEngine();
        const memory = {};

        const verifyCollision = (key, objectKey, mode, expected) => {
            let value;

            if (mode == "hadCollision") {// touched
                value = engine.hadCollision(key, objectKey);
            } else if (mode == "hasCollision") {// istouched
                value = engine.hasCollision(memory, key, objectKey);
            } else if (mode == "hasNotCollision") {// isnttouched es igual a !istouched
                value = engine.hasNotCollision(memory, key, objectKey);
            } else if (mode == "hadUncollision") {// untouched
                value = engine.hadUncollision(key, objectKey);
            }
            if (value == expected) {
                if (mode == "hadCollision") {
                    if (expected) {
                        console.log(`OK! "${key}" fires collision with "${objectKey}"`);
                    } else {
                        console.log(`OK! "${key}" does not fire collision with "${objectKey}"`);
                    }
                } else if (mode == "hasCollision") {
                    if (expected) {
                        console.log(`OK! "${key}" is in collision with "${objectKey}"`);
                    } else {
                        console.log(`OK! "${key}" isn't in collision with "${objectKey}"`);
                    }
                } else if (mode == "hasNotCollision") {
                    if (expected) {
                        console.log(`OK! "${key}" isn't in collision with "${objectKey}"`);
                    } else {
                        console.log(`OK! "${key}" is in collision with "${objectKey}"`);
                    }
                } else if (mode == "hadUncollision") {
                    if (expected) {
                        console.log(`OK! "${key}" fires uncollision with "${objectKey}"`);
                    } else {
                        console.log(`OK! "${key}" does NOT fire uncollision with "${objectKey}"`);
                    }
                }
            } else {
                if (mode == "hadCollision") {
                    if (expected) {
                        throw `"${key}" was expected fire collision with "${objectKey}"`;
                    } else {
                        throw `"${key}" was expected NOT to fire collision with "${objectKey}"`;
                    }
                } else if (mode == "hasCollision") {
                    if (expected) {
                        throw `"${key}" was expected to be in collision with "${objectKey}"`;
                    } else {
                        throw `"${key}" was expected NOT to be in collision with "${objectKey}"`;
                    }
                } else if (mode == "hasNotCollision") {
                    if (expected) {
                        throw `"${key}" was expected NOT to be in collision with "${objectKey}"`;
                    } else {
                        throw `"${key}" was expected to be in collision with "${objectKey}"`;
                    }
                } else if (mode == "hadUncollision") {
                    if (expected) {
                        throw `"${key}" was expected fire uncollision with "${objectKey}"`;
                    } else {
                        throw `"${key}" was expected NOT to fire uncollision with "${objectKey}"`;
                    }
                }
            }
        };

        engine.collide(memory, "police1.hand", "radio");
        engine.collide(memory, "police1", "zone1");

        engine.startSession();
        verifyCollision("police1.hand", "radio", "hadCollision", true);
        verifyCollision("police1.hand", "radio", "hasCollision", true);
        engine.endSession();

        engine.startSession();
        verifyCollision("police1.hand", "radio", "hadCollision", false);
        verifyCollision("police1.hand", "radio", "hasCollision", true);
        engine.endSession();

        engine.uncollide(memory, "police1.hand", "radio");

        engine.startSession();
        verifyCollision("police1.hand", "radio", "hadCollision", false);
        verifyCollision("police1.hand", "radio", "hasCollision", false);
        verifyCollision("police1.hand", "radio", "hasNotCollision", true);
        verifyCollision("police1.hand", "radio", "hadUncollision", true);
        engine.endSession();

        engine.startSession();
        verifyCollision("police1.hand", "radio", "hadUncollision", false);
        verifyCollision("police1.hand", "radio", "hasCollision", false);
        verifyCollision("police1.hand", "radio", "hasNotCollision", true);
        engine.endSession();
    }
}

module.exports = {
    CollisionsEngine
};

//CollisionsEngine.test();