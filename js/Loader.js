define(function () {
	function Loader(defaultPath) {
		if (typeof defaultPath === "undefined") {
			defaultPath = "";
		}
		this.path = defaultPath;
		this.assetsToLoad = 0;
		this.assetsCount = 0;
		this.assetsLoaded = true;
		this.newImageAsset = function (source, onload) {
			this.assetsLoaded = false;
			this.assetsToLoad++;

			var img = new Image();
			if (arguments.length === 1) {
				onload = function () {};
			}
			img.onload = function () {
				this.assetsToLoad--;
				this.assetsCount++;
				console.log("img: " + img.src + " loaded");
				if (this.assetsToLoad === 0) {
					this.assetsLoaded = true;
				}
				onload();
			}.bind(this);
			img.src = this.path + source;

			return img;
		};
		this.newAudioAsset = function (source, onload) {
			this.assetsLoaded = false;
			this.assetsToLoad++;

			var audio = new Audio();
			if (arguments.length === 1) {
				onload = function () {};
			}
			audio.onloadedmetadata = function () {
				this.assetsToLoad--;
				this.assetsCount++;
				console.log("audio: " + audio.src + " loaded");
				if (this.assetsToLoad === 0) {
					this.assetsLoaded = true;
				}
				onload();
			}.bind(this);
			audio.src = this.path + source;

			return audio;
		};
		this.newVideoAsset = function (source, onload) {
			this.assetsLoaded = false;
			this.assetsToLoad++;

			var vid = document.createElement("video");
			if (arguments.length === 1) {
				onload = function () {};
			}
			vid.onload = function () {
				this.assetsToLoad--;
				this.assetsCount++;
				console.log("vid: " + vid.src + " loaded");
				if (this.assetsToLoad === 0) {
					this.assetsLoaded = true;
				}
				onload();
			}.bind(this);
			vid.src = source;

			return vid;
		};
	}

	return Loader;
});
