
class ModuloVideos {
	static videos = {};
	static createVideo({ source }) {
		return new Promise((resolve, reject) => {
			const video = document.createElement("video");
			video.addEventListener("error", (err) => {
				reject(new Error(`Error leyendo el video ${source}`));
			});
			video.addEventListener("loadeddata", () => {
				const width = video.videoWidth;
				const height = video.videoHeight;
				console.log(`Loaded video ${width} x ${height}!`);
				resolve(video);
			});
			video.setAttribute("src", source);
			video.load();
		});
	}

	static destroyVideo(llave) {
		if (llave in ModuloVideos.videos) {
			const video = ModuloVideos.videos[llave];
			video.pause();
			video.removeAttribute('src');
			video.load();
			video.removeAllListeners('seeked');
			delete ModuloVideos.videos[llave];
		}
	}

	static async preload(lista = []) {
		const promesas = [];
		lista.forEach((llave) => {
			if (llave in ModuloVideos.videos) {
				promesas.push(Promise.resolve(ModuloVideos.videos[llave]));
			} else {
				const promesa = ModuloVideos.createVideo({ source: llave });
				promesa.then((video) => {
					ModuloVideos.videos[llave] = video;
				});
				promesas.push(promesa);
			}
		});
		return await Promise.all(promesas);
	};
}

module.exports = {
	ModuloVideos
};