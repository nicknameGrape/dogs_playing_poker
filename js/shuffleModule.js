/*
** Shuffles array in place.
** @param {Array} a items The array containing the items.
*/
define(function () {
	function shuffle(a) {
			var j, x, i;
			for (i = a.length; i; i -= 1) {
					j = Math.floor(Math.random() * i);
					x = a[i - 1];
					a[i - 1] = a[j];
					a[j] = x;
			}
	}

	return shuffle;
});
