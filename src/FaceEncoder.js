const fromCharCode = String.fromCharCode;
class FaceEncoder {

    static serialize(listModel) {
        let response = "";
        for (let j = 0; j < listModel.length; j++) {
            const model = listModel[j];
            const { id, list } = model;
            const tam = list.length;
            response += id + ":" + tam + ":";
            for (let i = 0; i < list.length; i++) {
                const number = list[i];
                const buffer = new ArrayBuffer(8);
                new DataView(buffer).setFloat64(0, number, false);
                const temp = [].slice.call(new Uint8Array(buffer));
                response += fromCharCode(temp[0]) + fromCharCode(temp[1]) + fromCharCode(temp[2]) + fromCharCode(temp[3]) + fromCharCode(temp[4]) + fromCharCode(temp[5]) + fromCharCode(temp[6]) + fromCharCode(temp[7]);
            }
        }
        return Buffer.from(response, "ascii");
    }

    static deserialize(buff) {
        const todo = [];
        let startIndex = 0;
        do {
            const partes = /^([^:]+):(\d+):(.*)$/.exec(buff.subarray(0, 30));
            if (partes == null) {
                return null;
            }
            const response = {
                id: partes[1]
            };
            const tamanioName = partes[1].length + 2 + partes[2].length;
            const tam = parseInt(partes[2]);
            const list = [];
            for (let i = 0; i < tam; i++) {
                const octets = buff.subarray(tamanioName + i * 8, tamanioName + (i + 1) * 8);
                const buffer = new ArrayBuffer(8);
                new Uint8Array(buffer).set(octets);
                const numero = new DataView(buffer).getFloat64(0, false);
                list.push(numero);
            }
            response.list = list;
            todo.push(response);
            startIndex = tamanioName + tam * 8;
            buff = buff.subarray(startIndex);
        } while (buff.length > 0);
        return todo;
    }

    static test() {
        const serialized = FaceEncoder.serialize([
            { id: "c240hGuQdHQ7VKRYcCjr", list: [3333333333333.123456789, 3333333333333.123456789] },
            { id: "c250hGuQdHQ7VKRYcC25", list: [3345333333333.123456789, 6337333333333.123456789] }
        ]);
        console.log(serialized);
        console.log(serialized.length + " Bytes");
        console.log(100 * (4096 * 8 + 20 + 2) / 1024 / 1024 + " MB");
        const returned = FaceEncoder.deserialize(serialized);
        console.log(JSON.stringify(returned, null, 4));
    }
}

//FaceEncoder.test();