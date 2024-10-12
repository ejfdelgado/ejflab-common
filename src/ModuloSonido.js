"use strict";

/*
const response = await ModuloSonido.preload([
'/assets/sounds/finish.mp3',
]);
await ModuloSonido.play('/assets/sounds/finish.mp3');
*/

class ModuloSonido {
	static sonidos = {};
	static createAudio({ source, volume = 100, loop = false }) {
		return new Promise((resolve, reject) => {
			const audio = new Audio();
			audio.volume = volume / 100;
			audio.loop = loop;
			audio.addEventListener("error", (err) => {
				reject(new Error(`Error leyendo el audio ${source}`));
			});
			audio.addEventListener("loadeddata", () => {
				let duration = audio.duration;
				console.log(`duration:${duration}`);
				resolve(audio);
			});
			audio.src = source;
		});
	}

	static async preload(lista = []) {
		const promesas = [];
		lista.forEach((llave) => {
			if (llave in ModuloSonido.sonidos) {
				promesas.push(Promise.resolve(ModuloSonido.sonidos[llave]));
			} else {
				const promesa = ModuloSonido.createAudio({ source: llave });
				promesa.then((audio) => {
					ModuloSonido.sonidos[llave] = audio;
				});
				promesas.push(promesa);
			}
		});
		return await Promise.all(promesas);
	};


	static async play(llave, loop = false, volume = 1) {
		let ref = null;
		if (llave in ModuloSonido.sonidos) {
			ref = ModuloSonido.sonidos[llave];
		} else {
			ref = (await ModuloSonido.preload([llave]))[0];
		}
		ref.volume = volume;
		let isPlaying = ref.currentTime > 0 && !ref.paused && !ref.ended
			&& ref.readyState > 2;
		if (!isPlaying) {
			ref.loop = loop;
			ref.play();
		}
	};

	static stop(llave) {
		const sonido = ModuloSonido.sonidos[llave];
		if (sonido) {
			sonido.pause();
			sonido.currentTime = 0;
		}
	}

	static stopAll() {
		const llaves = Object.keys(ModuloSonido.sonidos);
		for (let i = 0; i < llaves.length; i++) {
			const llave = llaves[i];
			const sonido = ModuloSonido.sonidos[llave];
			sonido.pause();
			sonido.currentTime = 0;
		}
	}
}

module.exports = {
	ModuloSonido
};