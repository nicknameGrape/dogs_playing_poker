//draw image to fit given area, keeping image aspect ratio
define(function () {
	//usage 1: drawFit(context, img)
	//usage 2: drawFit(context, img, x, y, w, h)
	//usage 3: drawFit(context, subx, suby, subw, subh, img, x, y, w, h)
	function drawFit() {
		var context;
		var img;
		var subx;
		var suby;
		var subw;
		var subh;
		var x;
		var y;
		var w;
		var h;
		var gravity;
		if (arguments.length <= 3) {
			context = arguments[0];
			img = arguments[1];
			subx = 0;
			suby = 0;
			subw = img.width;
			subh = img.height;
			x = 0;
			y = 0;
			w = context.canvas.width;
			h = context.canvas.height;
			gravity = arguments[2];
		} else if (arguments.length <= 7) {
			context = arguments[0];
			img = arguments[1];
			subx = 0;
			suby = 0;
			subw = img.width;
			subh = img.height;
			x = arguments[2];
			y = arguments[3];
			w = arguments[4];
			h = arguments[5];
			gravity = arguments[6];
		} else if (arguments.length <= 11) {
			context = arguments[0];
			img = arguments[1];
			subx = arguments[2];
			suby = arguments[3];
			subw = arguments[4];
			subh = arguments[5];
			x = arguments[6];
			y = arguments[7];
			w = arguments[8];
			h = arguments[9];
			gravity = arguments[10];
		} else {
		console.log("2, 6 or 10 arguments")
		}

		var fitWidth = subw/subh > w/h ? w : h * subw/subh;
		var fitHeight = fitWidth * subh/subw;
		var fitX, fitY;

		if (gravity === "s") {
			fitX = (w - fitWidth) / 2 + x;
			fitY = (h - fitHeight) + y;
		} else if (gravity === "n") {
			fitX = (w - fitWidth) / 2 + x;
			fitY = y;
		} else {
			fitX = (w - fitWidth) / 2 + x;
			fitY = (h - fitHeight) / 2 + y;
		}
		context.drawImage(img, subx, suby, subw, subh, fitX, fitY, fitWidth, fitHeight);
	}

	return drawFit;
});
