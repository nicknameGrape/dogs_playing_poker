"use strict"

requirejs.config({
baseUrl: '../js',
paths: {
	dogs: '../dogs_playing_poker',
}
});

var game = {
	"players": [],
	"cards": [],
	"images": {}
}

require(["fitText", "fitImage", "Loader", "mousetrap.min", "dogs/janken"], function (fitText, fitImage, Loader, Mousetrap, playJanken) {
	function renderTable() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		var prevFillStyle = context.fillStyle;
		//Players
		game.players.forEach(function (element, index, array) {
				var player = game.players[index];
				context.save();
				context.translate(canvas.width / 2, canvas.height / 2);
				context.rotate(Math.PI / 2 * index + Math.PI / 4);
				fitImage(context, player.img, -canvas.width * .1, -canvas.height / 2, canvas.width * .2, canvas.height * .35);
				context.rotate(-Math.PI / 10);
				if (element.janken !== null) {
					fitImage(context, game.images[element.janken], -canvas.width * .1, -canvas.height*.43, canvas.width * .2, canvas.height * .25);
				}
				context.restore();
			});
		//Table
		context.fillStyle = "green";
		context.beginPath();
		context.arc(canvas.width / 2, canvas.height / 2, canvas.height / 4, 0, 2 * Math.PI);
		context.fill();
		//Player Cards
		game.players.forEach(function (element, index, array) {
				var player = game.players[index];
				context.save();
				context.translate(canvas.width / 2, canvas.height / 2);
				context.rotate(Math.PI / 2 * index + Math.PI / 4);
				for (var i=0; i<player.cards.length; i++) {
				fitImage(context, game.images.back, canvas.width * (-.05 + i * .01), -canvas.height / 4, canvas.width * .07, canvas.height * .07 * 4/3);
				}
				context.restore();
				});

		//Deck
		for (var i=0; i<deck.length; i++) {
			var rows = 3;
			var cols = deck.length/rows;
			fitImage(
				context, game.images.back,
				canvas.width*(.4+.2/cols*(i%cols)),
				canvas.height*(.35+.3/rows*Math.floor(i/cols)),
				canvas.width*.2/cols,
				canvas.height*.3/rows,
			);
		}
		context.fillStyle = prevFillStyle;
	}
	function renderHand() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		var prevFillStyle = context.fillStyle;

		//Opposite Players
		game.players.forEach(function (el, index, array) {
				var offset = (array.length + index - turn - progress) % array.length;
				fitImage(context, el.img,
						((offset - .5) / 4 - .1) * canvas.width * 1.4,
						//(offset - .5) / 4 * canvas.width,
						-Math.sin(Math.PI / 4 * (offset - .5) * 1.4) * canvas.height/5 + canvas.height / 6,
						canvas.width / 4,
						canvas.height/2
						);
				});

		//Table
		context.fillStyle = "green";
		context.beginPath();
		context.arc(canvas.width / 2, canvas.height * 3, canvas.width * 1.5, 0, 2 * Math.PI);
		context.fill();

		//Deck
		for (var i=0; i<deck.length; i++) {
			if (deck[i] !== answer && deck[i] !== null) {
				var rows = 3;
				var cols = deckStartLength/rows;
				fitImage(
					context, game.images.back,
					canvas.width*(.3+.4/cols*(i%cols)),
					canvas.height*(.5+.3/rows*Math.floor(i/cols)),
					canvas.width*.4/cols,
					canvas.height*.3/rows,
				);
			}
		}

		//OppositeCards
		game.players.forEach(function (el, index, array) {
				//if (index !== turn) {
				for (var i=0; i<el.cards.length; i++) {
				var offset = (array.length + index - turn - progress) % array.length;
				fitImage(context, game.images.stationery,
						el.cards[i]*subimageWidth,
						0,
						subimageWidth,
						subimageHeight,
						((offset - .5) / 4 - .02 * i) * canvas.width * 1.4,
						-Math.sin(Math.PI / 4 * (offset - .5) * 1.4) * canvas.height/8 + canvas.height * .2,
						canvas.width / 16,
						canvas.height/2
						);
				}
				//}
				});

		//Active Cards
		if (answer !== null) {
			fitImage(context, game.images.stationery, 
				answer*subimageWidth,
				0,
				subimageWidth,
				subimageHeight,
				progress * 2.5 * canvas.width,
				canvas.height*.6,
				canvas.width*.3,
				canvas.height*.4
			);
		}
		var cards = game.players[turn].cards;
		for (var i=0; i<cards.length; i++) {
			console.log(cards[i]);
			fitImage(context, game.images.stationery, 
				cards[i]*subimageWidth,
				0,
				subimageWidth,
				subimageHeight,
				canvas.width*(progress * 2.5 + .5 + .5*i/(deck.length+1)),
				canvas.height * .7,
				canvas.height*.3/Math.sqrt(2),
				canvas.height*.3
			);
		}
		//Next Active Cards
		var cards = game.players[(turn + 5)%4].cards;
		for (var i=0; i<cards.length; i++) {
			fitImage(context, game.images.stationery, 
					cards[i] * subimageWidth,
					0,
					subimageWidth,
					subimageHeight,
					(-1 + progress) * canvas.width + i * .3 * canvas.height / Math.sqrt(2),
					canvas.height * .7,
					canvas.width/6,
					canvas.height * .3
					);
		}

		//Active Player
		context.globalAlpha = .2;
		fitImage(context, game.players[turn].img,
				(progress * 2.5) * canvas.width,
				canvas.height / 3,
				canvas.width / 2,
				canvas.height
				);
		//Next Active Player
		fitImage(context, game.players[(turn + 5)%4].img,
				(-1 + progress) * canvas.width,
				canvas.height / 3,
				canvas.width / 2,
				canvas.height
				);
		context.globalAlpha = 1;

		context.fillStyle = prevFillStyle;
	}
	var canvas = document.getElementById("myCanvas");
	var context = canvas.getContext("2d");
	var loader = new Loader("./img/");
	var onload;
	var subimageWidth;
	var subimageHeight;
	var deck = [0, 1, 2, 3, 4, 5, 6, 7, 8], answer, guesses, junban;
//	var deck = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], answer, guesses, junban;
	console.log(deck.length, "long deck");
	var deckStartLength = deck.length;
	var turn = 0, progress;
	var state = new StateMachine({
		"init": "menu",
		"transitions": [
			{"name": "start", "from": "menu", "to": "table"},
			{"name": "play", "from": "table", "to": "hand"},
			{"name": "end", "from": "table", "to": "results"},
			{"name": "back", "from": "hand", "to": "table"},
			{"name": "back", "from": "table", "to": "menu"},
			{"name": "back", "from": "results", "to": "table"}
		],
		"methods": {
			"onEnterState": function () {
				Mousetrap.reset();
				context.clearRect(0, 0, canvas.width, canvas.height);
				console.log(this.state);
			},
			"onMenu": function () {
				onload = function () {
					if (loader.assetsLoaded) {
						Mousetrap.bind("space", function () {state.start();});
					}
					subimageWidth = game.images.stationery.width/deck.length;
					subimageHeight = game.images.stationery.height;
					console.log(subimageWidth, subimageHeight);
					fitText(context, "How's the weather?", 0, 0, canvas.width, canvas.height / 2);
					var rows = 1
					for (var i=0; i<=deck.length; i++) {
						fitImage(context, game.images.stationery,
							i * subimageWidth,
							0,
							subimageWidth,
							subimageHeight,
							i%(deck.length/rows) * canvas.width/deck.length*rows,
							(2 + Math.floor(i/(deck.length/rows)))*canvas.height/4,
							canvas.width/deck.length*rows,
							canvas.height/4
						);
					}
				}
				game.images["characters"] = [];
				game.images.characters.push(loader.newImageAsset("anpanman.png", onload));
				game.images.characters.push(loader.newImageAsset("kumamon.png", onload));
				game.images.characters.push(loader.newImageAsset("miffy.png", onload));
				game.images.characters.push(loader.newImageAsset("miyakkii_arms_down.png", onload));
				game.images["rock"] = loader.newImageAsset("rock.png", onload);
				game.images["paper"] = loader.newImageAsset("paper.png", onload);
				game.images["scissors"] = loader.newImageAsset("scissors.png", onload);
				game.images.stationery = loader.newImageAsset("weather_strip.jpg", onload);
				game.images.back = loader.newImageAsset("back.jpg", onload);
			},
			"onTable": function () {
				game.players = [];
				game.players.push(new Player());
				game.players.push(new Player());
				game.players.push(new Player());
				game.players.push(new Player());
				renderTable();
				Mousetrap.bind("1", function () {turn = 0; state.play();});
				Mousetrap.bind("2", function () {turn = 1; state.play();});
				Mousetrap.bind("3", function () {turn = 2; state.play();});
				Mousetrap.bind("4", function () {turn = 3; state.play();});
				Mousetrap.bind("space", function () {
					console.log("playing Janken");
					playJanken(game.players);
					renderTable();
				});
				
			},
			"onHand": function () {
				//animation vars
				progress = 0, request, lastTime;
				answer = null, guesses = [], junban = 0;

				renderHand();
				Mousetrap.reset();
				Mousetrap.bind("space", function () {
					if (answer === null) {
						var possibilities = deck.filter(function (num) {
							return num !== null;
						});
						console.log(possibilities);
						console.log("CURRENT PLAYER DRAWS");
						answer = possibilities[Math.floor(Math.random()*possibilities.length)];
						var pool = possibilities.slice(0);
						guesses = [];
						while (pool.length > 0) {
							guesses.push(pool.splice(Math.floor(Math.random()*pool.length), 1)[0]);
						}
						guesses = guesses.slice(0,3);
						console.log(answer, guesses);
						renderHand();
					} else if (junban < game.players.length - 1) {
						console.log("PLAYERS", junban, "GUESSES");
						renderHand();
						context.globalAlpha = .7;
						fitImage(context, game.images.stationery, 
							guesses[junban]*subimageWidth,
							0,
							subimageWidth,
							subimageHeight,
							canvas.width/3*junban,
							0,
							canvas.width*.25,
							canvas.height*.3
						);
						fitText(context, "?",
							canvas.width/3*junban,
							0,
							canvas.width*.5,
							canvas.height*.3
						);
						context.globalAlpha = 1;
						junban += 1;
					} else {
						console.log("GIVING TO CURRENT PLAYER");
						game.players[turn].cards.push(deck[deck.indexOf(answer)]);
						//deck.splice(deck.indexOf(answer), 1);
						deck[deck.indexOf(answer)] = null;
						console.log(game.players);
						answer = null, guesses = [], junban = 0;
						renderHand();
					}
				});
				Mousetrap.bind("y", function () {
					game.players[(turn+junban)%game.players.length].cards.push(deck[deck.indexOf(answer)]);
					deck.splice(deck.indexOf(answer), 1);
					answer = null;
					console.log(game.players);
					renderHand();
				});
				Mousetrap.bind("left", function () {
					answer = null; guesses = []; junban = 0;
					progress = 0;
					renderHand();
					lastTime = performance.now();
					request = requestAnimationFrame(loop);
					//turn = (turn+1)%game.players.length;
					//renderHand();
				});


				function loop(time) {
					//if (!lastTime) {lastTime = performance.now();}
					var dt = time - lastTime;
					lastTime = time;
					//progress = (progress + dt/1000);
					progress = (progress + dt/300);
					renderHand();
					console.log("looping");
					if (progress < 1) {
						request = requestAnimationFrame(loop);
					} else {
						turn = (turn+1)%game.players.length;
						progress = 0;
						renderHand();
					}
				}
			},
			"onResults": function () {
				cancelAnimationFrame(request);
				fitText(context, "Results");
				Mousetrap.bind("esc", function () {state.back();});
			}
		},
		"data": {
		}
	});

	function Player () {
		this.img = game.images.characters.shift();
		this.cards = [];
		this.pointCards = [];
		this.janken = null;
		this.canJanken = true;
	}

	var request, lastTime;
	function loop(time) {
		if (!lastTime) {lastTime = performance.now();}
		var dt = time - lastTime;
		lastTime = time;
		//update(dt);
		turn = (turn + dt/1000) % game.players.length;
		//render(context);
		renderHand();
		console.log(turn, "looping");
		request = requestAnimationFrame(loop);
	}
});
