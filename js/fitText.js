//draw image to fit given area, keeping image aspect ratio
define(function () {
	//var f = new FontFace("test", "./Chalkboard.ttc");
	//f.load();

	function fitText(context, text, x, y, w, h, padding) {
		var canvas = context.canvas;

		if ( typeof x === "undefined" ){
			x = 0;
		}
		if ( typeof y === "undefined" ){
			y = 0;
		}
		if ( typeof w === "undefined" ){
			w = canvas.width - x;
		}
		if ( typeof h === "undefined" ){
			h = canvas.height - y;
		}
		if ( typeof padding === "undefined" ){
			padding = .1
		}

		var prevFont = context.font;
		var fontSize = h;
		context.font = fontSize + "px Comic Sans MS";
		while (context.measureText(text).width > w*(1-padding)) {
			fontSize = fontSize * .9;
			context.font = fontSize + "px Comic Sans MS";
		}

		var prevAlign = context.textAlign;
		var prevLineWidth = context.lineWidth;

		context.textAlign = "center";
		context.lineWidth = fontSize / 25;
		context.strokeText(text, x + w / 2, y + fontSize * .8 + (h - fontSize) / 2);
		context.fillText(text, x + w / 2, y + fontSize * .8 + (h - fontSize) / 2);
		context.textAlign = prevAlign;

		context.font = prevFont;
		context.lineWidth = prevLineWidth;
	}

	return fitText;
});
