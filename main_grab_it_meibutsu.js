"use strict"

requirejs.config({
baseUrl: '../js',
paths: {
	grab_it: '../grab_it'
}
});

require(["fitText", "fitImage", "Loader", "mousetrap.min", "fitTextArray", "HatDraw"], function (fitText, fitImage, Loader, Mousetrap, fitTextArray, HatDraw) {
	function Button(data, x, y, w, h) {
		this.data = data;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.containsPoint = function (x, y) {
			return x >= this.x && y >= this.y && x < this.x + this.w && y < this.y + this.h;
		}
	}

	function Restaurant(color, x, y, w, h) {
		var scramble = [];
		var buttonOrder = [];
		for (var i=0;i<meibutsu.length;i++) {
			scramble.push(i);	
		}
		while (scramble.length > 0) {
			var rIndex = scramble.splice(Math.floor(Math.random()*scramble.length), 1)[0];
			buttonOrder.push(rIndex);
		}
		this.color = color;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.buttons = [];
		this.choice = null;
		this.containsPoint = function (x, y) {
			return x >= this.x && y >= this.y && x < this.x + this.w && y < this.y + this.h;
		}
		//24 menu items, 8 rows 3 cols
		var ROWS = 7;
		var COLS = 3;
		var tileW = this.w/COLS;
		var tileH = this.h/ROWS;
		for (var i=0;i<ROWS;i++) {
			for (var j=0;j<COLS;j++) {
				if (buttonOrder.length > 0) {
					this.buttons.push(new Button(buttonOrder.pop(), this.x + j*tileW, this.y + i*tileH, tileW, tileH));
				}
			}
		}
		this.render = function () {
			//if (startTime === null) {
			//	context.fillStyle = "white";
			//} else {
			//	context.fillStyle = "lime";
			//}
			if (this.choice === null) {
				context.fillStyle = this.color;
				context.fillRect(this.x, this.y, this.w, this.h);
				this.buttons.forEach(function (b) {
					console.log(b);
					if (meibutsu[b.data].chosen) {
						context.fillRect(b.x, b.y, b.w, b.h);
					} else {
						fitImage(context, meibutsu[b.data].img, b.x, b.y, b.w, b.h);
					}
				});
			} else {
				context.fillStyle = this.color;
				context.fillRect(this.x, this.y, this.w, this.h);
				fitImage(context, meibutsu[this.choice].img, this.x, this.y, this.w, this.h, "n");
				//context.fillStyle = "black";
				//fitText(context, ((performance.now() - startTime)/1000).toFixed(2) + " s", this.x, this.y, this.w, this.h/2);
			}
		};
	}

	function resize() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		render();
	}

	function onload() {
		if (loader.assetsLoaded) {
			state.loaded();
		}
	}
	var canvas = document.getElementById("myCanvas");
	var context = canvas.getContext("2d");
	var loader = new Loader("./img_meibutsu/");
	var meibutsu;
	var restaurants = [];
	//var startTime = null;
	var players = 6;
	var render = function () {};
	var COLORS = [
		"pink",
		"skyblue",
		"orange",
		"green",
		"yellow",
		"red"
	];
	var MEIBUTSU = [
		"meibutsu_crab.png",
		"meibutsu_grapes.png",
		"meibutsu_green_tea.png",
		"meibutsu_lemons.png",
		"meibutsu_lobster.png",
		"meibutsu_mango.png",
		"meibutsu_natto.png",
		"meibutsu_oranges_iyakan.png",
		"meibutsu_peach.png",
		"meibutsu_peanuts.png",
		"meibutsu_pears.png",
		"meibutsu_pineapple.png",
		"meibutsu_rice.png",
		"meibutsu_sweet_potato.png",
		"meibutsu_takoyaki.png",
		"meibutsu_apple.png",
		"meibutsu_castella.png",
		"meibutsu_cherries.png",
		"meibutsu_corn.png"
	];
	var state = new StateMachine({
		"init": "loading",
		"transitions": [
			{"name": "loaded", "from": "loading", "to": "splashReady"},
			{"name": "order", "from": "splashReady", "to": "touchpad"},
			{"name": "reset", "from": "touchpad", "to": "splashReady"}
		],
		"methods": {
			"onLeaveState": function () {
				Mousetrap.reset();
				render = null;
			},
			"onEnterState": function () {
				console.log(this.state);
				context.clearRect(0, 0, canvas.width, canvas.height);
			},
			"onLoading": function () {
				meibutsu = [];
				MEIBUTSU.forEach(function (str) {
					var o = {};
					o.img = loader.newImageAsset(str, onload);
					o.chosen = false;
					meibutsu.push(o);
				});
				render = function renderLoading() {
					fitText(context, "Loading...");
				}
				resize();
				render();
				console.log(meibutsu);
			},
			"onSplashReady": function () {
				render = function renderSplashReady() {
					var colors = COLORS.slice(0, players);
					var rWidth = canvas.width/colors.length;
					colors.forEach(function (c, i) {
						context.fillStyle = c;
						context.fillRect(i*rWidth, 0, rWidth, canvas.height);
					});
					context.fillStyle = "black";
					fitText(context, "This is for you.");
				}
				Mousetrap.bind("enter", function () {
					state.order();
				});
				render();
			},
			"onTouchpad": function () {
				function makeRestaurants() {
					var colors = COLORS.slice(0, players);
					var rWidth = canvas.width/colors.length;
					restaurants = [];
					colors.forEach(function (c, i) {
						restaurants.push(new Restaurant(c, i*rWidth, canvas.height*.3, rWidth, canvas.height*.7));
					});
					console.log(restaurants);
				}
				context.fillStyle = "white";
				context.fillRect(0, 0, canvas.width, canvas.height);
				makeRestaurants();
				render = function () {
					restaurants.forEach(function (r) {
						if (r.choice === null)
						r.render();
					});
				};
				render();
				Mousetrap.bind("enter", function () {
					state.reset();
				});
			}
		}
	});
	canvas.addEventListener("touchstart", function (e) {
		e.preventDefault();
		var touch = e.touches[0];
		var x = touch.clientX;
		var y = touch.clientY;
		console.log("touchstart", x, y);
		var restaurant = null;
		var button = null;
		restaurants.some(function (r) {
			restaurant = r;
			r.buttons.some(function (b) { 
				button = b;
				return b.containsPoint(x, y);
			})
			return r.containsPoint(x, y);
		});
		if (!button.containsPoint(x, y)) {
			button = null;
		} else {
			var item = meibutsu[button.data];
			if (restaurant.choice === null && item.chosen === false) {
				restaurant.choice = button.data;
				item.chosen = true;
				//restaurant.render();
				restaurants.forEach(function (o) {
					o.render();
				});
			}
		}
		//console.log(button.data.text);
	});
	window.addEventListener("resize", function () {
		resize();
		render();
	});
	window.addEventListener("keydown", function (e) {
		console.log(e.key)
		var keyAsInt = parseInt(e.key);
		if (Number.isInteger(keyAsInt)) {
			players = keyAsInt;
			render();
		}
	});
});
