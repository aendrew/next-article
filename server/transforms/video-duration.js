module.exports = duration => {
	if (duration) {
		const minutes = Math.floor(duration / 60000);
		const seconds = Math.round(duration / 1000) - minutes * 60;

		duration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}min`;
	}

	return duration;
};
