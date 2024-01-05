async function convertMS(ms) {
    let d, h, m, s;
	s = Math.floor(ms / 1000);
	m = Math.floor(s / 60);
	s = s % 60;
	h = Math.floor(m / 60);
	m = m % 60;
	d = Math.floor(h / 24);
	h = h % 24;

	var pad = function (n) { return n < 10 ? '0' + n : n; };
	let result = '';
	if (d !== 0) {
		result = result + d + 'd.';
	}
	if (pad(h) !== '00') {
		result = result + pad(h) + 'h:';
	}
	result = result + pad(m) + 'm:' + pad(s) + 's';
    return result;
}
module.exports.convertMS = convertMS;