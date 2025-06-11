"use strict"

requirejs.config({
baseUrl: '../js',
paths: {
	dogs: '../dogs_playing_poker',
}
});

function Player(img, color) {
	this.img = img;
	this.hand = [0, 1, 2, 3, 4];
	this.show = null;
	this.discardPile = [];
	this.color = color;
	this.canJanken = false;
	this.janken = null;
}

var game = {
	"players": [],
	"images": {}
}

require(["fitText", "fitImage", "Loader", "mousetrap.min"], function (fitText, fitImage, Loader, Mousetrap) {
	var CARDS_SOURCE = "jobs.jpg";
	var NUMBER_OF_CARDS = 5;
	var canvas = document.getElementById("myCanvas");
	var context = canvas.getContext("2d");
	var loader = new Loader("./img/");
	var onload = function () {
		console.log(loader.assetsLoaded);
		if (loader.assetsLoaded) {
			subimageWidth = game.images.cards.width / NUMBER_OF_CARDS;
			subimageHeight = game.images.cards.height;
			var tileWidth = canvas.width/NUMBER_OF_CARDS;
			var MARGIN = canvas.width*.01;
			for (var n=0; n<=NUMBER_OF_CARDS; n++) {
				fitImage(
					context,
					game.images.cards,
					n * subimageWidth,
					0,
					subimageWidth,
					subimageHeight,
					n*tileWidth + MARGIN,
					0,
					tileWidth - 2*MARGIN,
					canvas.height
				);
			};
			context.fillStyle = "white";
			fitText(context, "Card Game: Job War", 0, 0, canvas.width, canvas.height/5);
			Mousetrap.bind("space", function () {state.start();});
		}
	}
	var subimageWidth;
	var subimageHeight;
	var turn = 0;
	var progress = 0;
	var state = new StateMachine({
		"init": "menu",
		"transitions": [
			{"name": "start", "from": "menu", "to": "table"},
			{"name": "end", "from": "table", "to": "results"},
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
				game.players.push(new Player(loader.newImageAsset("anpanman.png", onload), "red"));
				game.players.push(new Player(loader.newImageAsset("kumamon.png", onload), "black"));
				game.players.push(new Player(loader.newImageAsset("miffy.png", onload), "blue"));
				game.players.push(new Player(loader.newImageAsset("kuruppa.png", onload), "limeGreen"));
				game.images.cards = loader.newImageAsset(CARDS_SOURCE, onload);
				game.images.rock = loader.newImageAsset("rock.png", onload);
				game.images.paper = loader.newImageAsset("paper.png", onload);
				game.images.scissors = loader.newImageAsset("scissors.png", onload);
			},
			"onTable": function () {
				renderTable();
				//CHORAL
				console.log("CHORAL");
				Mousetrap.bind("space", function () {
					if (progress === 0) {
						//REVEAL
						console.log("REVEAL");
						game.players.forEach(function (p) {
							if (p.hand.length > 0) {
								p.show = p.hand.splice(Math.floor(p.hand.length*Math.random()), 1)[0];
							}
						});
						progress += 1;
					} else if (progress === 1) {
						//game.players.forEach(function (p) {
						//	p.discardPile.push(p.show);
						//	console.log(p, p.discardPile);
						//	p.show = null;
						//});
						//DISCARD IF POSSIBLE
						console.log("DISCARD");
						game.players.forEach(function (p, i) {
							var isSame = false;
							game.players.forEach(function (p2, i2) {
								if (
									i !== i2 &&
									p.show === p2.show
								) {
									isSame = true;
									p.canJanken = true;
								}
							});
							if (!isSame) {
								p.discardPile.push(p.show);
								console.log(p, p.discardPile);
								p.show = null;
							}
						});
						progress += 1;
					} else if (progress === 2) {
						//JANKEN
						console.log("JANKEN")
						game.players.forEach(function (p, i) {
							if (p.canJanken) {
								var r = Math.random();
								if (r < 1/3) {
									p.janken = "rock";
								} else if (r < 2/3) {
									p.janken = "paper";
								} else {
									p.janken = "scissors";
								}
							}
						});
					} else {
						game.players.forEach(function (p, i) {
							p.canJanken = false;
							p.janken = null;
						});
						progress = 0;
					}
					renderTable();
				});
				
				function renderTable() {
					context.clearRect(0, 0, canvas.width, canvas.height);
					var prevFillStyle = context.fillStyle;
					//Players
					game.players.forEach(function (p, index, array) {
						context.save();
						context.translate(canvas.width / 2, canvas.height / 2);
						context.rotate(Math.PI / 2 * index + Math.PI / 4);
						fitImage(context, p.img, -canvas.width * .1, -canvas.height / 2, canvas.width * .2, canvas.height * .35);
						context.restore();
					});
					//janken
					game.players.forEach(function (p, index, array) {
						context.save();
						context.translate(canvas.width / 2, canvas.height / 2);
						context.rotate(Math.PI / 2 * index + Math.PI / 4);
						if (p.janken !== null) {
							console.log(p.janken);
							fitImage(context, game.images[p.janken], -canvas.width * .1, -canvas.height / 2, canvas.width * .2, canvas.height * .35);
						}
						context.restore();
					});
					//Table
					context.fillStyle = "green";
					context.beginPath();
					context.arc(canvas.width / 2, canvas.height / 2, canvas.height / 4, 0, 2 * Math.PI);
					context.fill();

					//Player Cards
					game.players.forEach(function (p, index, array) {
						context.save();
						context.translate(canvas.width / 2, canvas.height / 2);
						context.rotate(Math.PI / 2 * index + Math.PI / 4);
						//hand
						for (var i=0; i<p.hand.length; i++) {
							context.fillStyle = "white";
							context.fillRect(canvas.width * (-.05 + i * .01), -canvas.height / 4, canvas.height * .07, canvas.height * .07 * 4/3);
							context.fillStyle = p.color;
							context.fillRect(canvas.width * (-.046 + i * .01), -.245*canvas.height, canvas.height * .057, canvas.height * .062 * 4/3);
						}
						//discard pile
						for (var i=0; i<p.discardPile.length; i++) {
							fitImage(context, game.images.cards, 
								p.discardPile[i] * subimageWidth,
								0,
								subimageWidth,
								subimageHeight,
								canvas.width * (.02),
								canvas.height * (-.25 - i * .01),
								canvas.width * .07,
								canvas.height * .07 * 4/3
							);
						}
						//show
						if (p.show !== null) {
							fitImage(context, game.images.cards, 
								p.show * subimageWidth,
								0,
								subimageWidth,
								subimageHeight,
								canvas.width * (-.05),
								canvas.height * -.25,
								canvas.width * .18,
								canvas.height * .18* 4/3
							);
						}
						context.restore();
					});
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
							(.25 + .09 * i) * canvas.width,
							.45 * canvas.height,
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
