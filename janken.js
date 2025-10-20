function playJanken(players) {
	var rflag = false;
	var sflag = false;
	var pflag = false;
	players.forEach(function (el) {
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
		if (el["janken"] === "rock") {
			rflag = true;
		} else if (el["janken"] === "scissors") {
			sflag = true;
		} else if (el["janken"] === "paper") {
			pflag = true;
		}
	});
	var count = 0;
	players.forEach(function (p) {
		if (p["canJanken"]) {
			count += 1;
		}
	});
	if ((rflag + sflag + pflag === 1) ||
		(rflag && sflag && pflag)) { //draw
		console.log("draw");
		return;
	}
	players.forEach(function (p) {
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
};
