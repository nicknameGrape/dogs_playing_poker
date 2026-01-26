define(["shuffleModule"], function (shuffle) {
	function HatDraw(array) {
		this.choices = array.slice(0);
		this.undrawn = this.choices.slice(0);
		shuffle(this.undrawn);
		this.drawn = [];
		this.drawOne = function () {
			if (this.undrawn.length === 0) {
				//this.undrawn = this.choices.slice(0);
				this.undrawn = this.drawn.slice(1);
				shuffle(this.undrawn);
				//this.undrawn.splice(Math.floor(Math.random() * this.undrawn.length - 1) + 1, 0, this.drawn[0])
				this.undrawn.push(this.drawn[0]);
				this.drawn = [];
			}
			var randIndex = Math.floor(Math.random() * this.undrawn.length);
			var draw = this.undrawn.splice(randIndex, 1)[0];
			//var draw = this.undrawn.shift();
			this.drawn.unshift(draw);

			return draw;
		};
		this.undo = function () {
			if (this.drawn.length > 1) {
				this.undrawn.unshift(this.drawn.shift());
			}
		}
	}

	return HatDraw;
});
