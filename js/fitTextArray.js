define(['fitText'], function (fitText) {
	//expects contents like:
	//[
	//	"Item 1",
	//	"Item 2"
	//]

	function fitTextArray (context, contents, x, y, w, h) {
		//defaults to full canvas
		if ( typeof x == "undefined" ){
			x = 0;
		}
		if ( typeof y == "undefined" ){
			y = 0;
		}
		if ( typeof w == "undefined" ){
			w = context.canvas.width;
		}
		if ( typeof h == "undefined" ){
			h = context.canvas.height;
		}

		var itemHeight = h / contents.length;

		var prevFont = context.font;
		var prevFillStyle = context.fillStyle;
		var prevTextAlign = context.textAlign;

		//context.fillStyle = "black";
		context.textAlign = "center";

		contents.forEach(function (item, index) {
			fitText(context, item, x, y + itemHeight * index, w, itemHeight);
		});
		//this.contents.forEach(function (item, index) {
		//	context.font =  itemHeight * .8 + "px Arial";
		//	var fontSize = parseInt(context.font);
		//	while (context.measureText(item).width > w) {
		//		fontSize = fontSize * .9;
		//		context.font = fontSize + "px Arial";

		//	}
		//	context.fillText(item, x + w / 2, y + itemHeight * index + fontSize * .8);
		//});
	}

	return fitTextArray;
});
