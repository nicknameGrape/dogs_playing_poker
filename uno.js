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

require(["fitText", "fitImage", "Loader", "mousetrap.min"], function (fitText, fitImage, Loader, Mousetrap) {
	var canvas = document.getElementById("myCanvas");
	var context = canvas.getContext("2d");
	var loader = new Loader("./img/");
	var onload = function () {
		console.log(loader.assetsLoaded);
		if (loader.assetsLoaded) {
			Mousetrap.bind("space", function () {state.start();});
		}
	}
	var subimageWidth;
	var subimageHeight;
	var deck = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
	var turn = 0;
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
				fitText(context, "Card Uno", 0, canvas.height/10, canvas.width, canvas.height/5);
				game.images["characters"] = [];
				game.images.characters.push(loader.newImageAsset("anpanman.png", onload));
				game.images.characters.push(loader.newImageAsset("kumamon.png", onload));
				game.images.characters.push(loader.newImageAsset("miffy.png", onload));
				game.images.characters.push(loader.newImageAsset("kuruppa.png", onload));
				game.images["rock"] = loader.newImageAsset("rock.png", onload);
				game.images["paper"] = loader.newImageAsset("paper.png", onload);
				game.images["scissors"] = loader.newImageAsset("scissors.png", onload);
				game.images.cards = loader.newImageAsset("uno.jpg", function () {
					subimageWidth = game.images.cards.width / deck.length;
					subimageHeight = game.images.cards.height;
					for (var i=0; i<deck.length; i++) {
						fitImage(context, game.images.cards, 
							i * subimageWidth,
							0,
							subimageWidth,
							subimageHeight,
							(i%8) * canvas.width/8,
							Math.floor(i/8)*canvas.height/3 + canvas.height*.3,
							canvas.width/8,
							canvas.height/4);
					}
					onload();
				});
				game.images.back = loader.newImageAsset("back.jpg", onload);
			},
			"onTable": function () {
				game.players = [];
				game.players.push(new Player());
				game.players.push(new Player());
				game.players.push(new Player());
				game.players.push(new Player());
				function playJanken () {
					game.players.forEach(function (el) {
						if (el.canJanken) {
							var rand = Math.random();
							if (rand < 1/3) {
								el.janken = "rock";
							} else if (rand < 2/3) {
								el.janken = "scissors";
							} else {
								el.janken = "paper";
							}
						} else {
							el.janken = null;
						}
					});
					var rflag = false;
					var sflag = false;
					var pflag = false;
					game.players.forEach(function (p) {
						if (p["janken"] === "rock") {
							rflag = true;
						} else if (p["janken"] === "scissors") {
							sflag = true;
						} else if (p["janken"] === "paper") {
							pflag = true;
						}
					});
					var count = 0;
					game.players.forEach(function (p) {
						if (p["canJanken"]) {
							count += 1;
						}
					});
					if (count > 2) {
						if (rflag && sflag && pflag) {
							console.log("draw");
						} else if (rflag + sflag + pflag === 1) {
						} else {
							game.players.forEach(function (p) {
								if (!rflag && p["janken"] === "paper") {
									p["canJanken"] = false;
								}
								if (!sflag && p["janken"] === "rock") {
									p["canJanken"] = false;
								}
								if (!pflag && p["janken"] === "scissors") {
									p["canJanken"] = false;
								}
							});
						}
					} else {
						game.players.forEach(function (p) {
							if (rflag && p["janken"] === "scissors") {
								p["canJanken"] = false;
							}
							if (sflag && p["janken"] === "paper") {
								p["canJanken"] = false;
							}
							if (pflag && p["janken"] === "rock") {
								p["canJanken"] = false;
							}
						});
					}
				};

				renderTable();
				Mousetrap.bind("space", function () {
					if (deck.length > 0) {
						game.players[turn].cards.push(deck.splice([Math.floor(Math.random() * deck.length)], 1)[0]);
						turn = (turn + 1)%game.players.length;
						renderTable();
					} else {
						Mousetrap.reset();
						Mousetrap.bind("j", function () {
							playJanken();
							renderTable();
						});
						Mousetrap.bind("1", function () {turn = 0; state.play();});
						Mousetrap.bind("2", function () {turn = 1; state.play();});
						Mousetrap.bind("3", function () {turn = 2; state.play();});
						Mousetrap.bind("4", function () {turn = 3; state.play();});
					}
				});
				
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
						if (element.janken !== null) {
							fitImage(context, game.images[element.janken], -canvas.width * .1, -canvas.height / 2, canvas.width * .2, canvas.height * .35);
						}
						context.restore();
					});
					//Number Players
					game.players.forEach(function (element, index, array) {
						var player = game.players[index];
						context.save();
						context.translate(canvas.width / 2, canvas.height / 2);
						context.rotate(Math.PI / 2 * index + Math.PI / 4);
						fitText(context, index + 1, -canvas.width * .1, -canvas.height * .65, canvas.width * .2, canvas.height * .15);
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
						fitImage(context, game.images.back, canvas.width * .45, canvas.height * (.35 - .02 * i), canvas.width * .1, canvas.width * .1 * .4 / .3);
					}
					context.fillStyle = prevFillStyle;
				}
			},
			"onHand": function () {
				//animation vars
				var progress = 0, request, lastTime, pile = [];

				function keyHandler(ev) {
					console.log(game.players[turn].cards, ev.key);
					var cards = game.players[turn].cards;
					var choice = parseInt(ev.key - 1);
					if (choice >= 0 && choice < cards.length) {
						pile.push(cards.splice(choice, 1)[0]);
						renderHand();
					}
				}

				renderHand();
				Mousetrap.reset();
				addEventListener("keydown", keyHandler);

				Mousetrap.bind("left", function () {
					removeEventListener("keydown", keyHandler);
					progress = 0;
					lastTime = performance.now();
					request = requestAnimationFrame(loop);
					//turn = (turn+1)%game.players.length;
					//renderHand();
				});
				Mousetrap.bind("0", function () {
					//game.players[turn].pointCards = pile;
					game.players[turn].pointCards = game.players[turn].pointCards.concat(pile);
					pile = []
					renderHand()
				});

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

					//OppositeCards
					game.players.forEach(function (el, index, array) {
						var offset = (array.length + index - turn - progress) % array.length;
						var points = el.pointCards;
						for (var i=0; i<el.cards.length; i++) {
							fitImage(context, game.images.back,
								((offset - .5) / 4 - .02 * i) * canvas.width * 1.4,
								//((offset - .3) / 4 + .02 * i) * canvas.width,
								-Math.sin(Math.PI / 4 * (offset - .5) * 1.4) * canvas.height/8 + canvas.height * .2,
								canvas.width / 16,
								canvas.height/2
							);
						}
						context.save()
						context.translate(
							((offset - .7) / 4) * canvas.width * 1.4,
							-Math.sin(Math.PI / 4 * (offset - .5) * 1.4) * canvas.height/8 + canvas.height * .65
						);
						context.rotate(-Math.PI / 2);
						for (var i=0; i<points.length; i++) {
							fitImage(context, game.images.cards, 
								points[i] * subimageWidth,
								0,
								subimageWidth,
								subimageHeight,
								0,
								(i - progress) * canvas.width * .03,
								canvas.width*.06,
								canvas.width*.06*subimageHeight/subimageWidth
							);
							context.fillStyle = "red";
							context.globalAlpha = .2;
							context.fillRect(
								0,
								(i - progress) * canvas.width * .03,
								canvas.width*.06,
								canvas.width*.06*subimageHeight/subimageWidth
							);
							context.globalAlpha = 1;
						}
						context.restore();
					});
					
					//Deck
					for (var i=0; i<pile.length; i++) {
						fitImage(context, game.images.cards, 
							pile[i] * subimageWidth,
							0,
							subimageWidth,
							subimageHeight,
							(.45 + .01 * (i % 3)) * canvas.width,
							(.45 - .015 * i) * canvas.height,
							//(.4 - i * .05) * canvas.height,
							canvas.width * .2,
							canvas.height * .3
						);
					}

					//Active Cards
					var points = game.players[turn].pointCards;
					context.save()
					context.translate(canvas.width*.5, canvas.height*.93);
					context.rotate(-Math.PI / 2);
					for (var i=0; i<points.length; i++) {
						fitImage(context, game.images.cards, 
							points[i] * subimageWidth,
							0,
							subimageWidth,
							subimageHeight,
							0,
							i * canvas.width * .05 +progress * 2.5 * canvas.width,
							canvas.width*.12,
							canvas.width*.12*subimageHeight/subimageWidth
						);
						context.fillStyle = "red";
						context.globalAlpha = .2;
						context.fillRect(
							0,
							i * canvas.width * .05 +progress * 2.5 * canvas.width,
							canvas.width*.12,
							canvas.width*.12*subimageHeight/subimageWidth
						);
						context.globalAlpha = 1;
					}
					context.restore();
					var cards = game.players[turn].cards;
					for (var i=0; i<cards.length; i++) {
						fitImage(context, game.images.cards, 
							cards[i] * subimageWidth,
							0,
							subimageWidth,
							subimageHeight,
							progress * 2.5 * canvas.width + i * .3 * canvas.height / Math.sqrt(2),
							canvas.height * .7,
							canvas.width/6,
							canvas.height * .3
						);
					}
					//Next Active Cards
					var cards = game.players[(turn + 5)%4].cards;
					for (var i=0; i<cards.length; i++) {
						fitImage(context, game.images.cards, 
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

				function loop(time) {
					//if (!lastTime) {lastTime = performance.now();}
					var dt = time - lastTime;
					lastTime = time;
					//progress = (progress + dt/2000);
					progress = (progress + dt/300);
					renderHand();
					console.log("looping");
					if (progress < 1) {
						request = requestAnimationFrame(loop);
					} else {
						turn = (turn+1)%game.players.length;
						progress = 0;
						addEventListener("keydown", keyHandler);
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
