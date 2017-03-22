const SPECIAL_REPORT = 'MjBkZDZhODAtYTQzOS00YmM1LWI4ZTItN2VjM2QwZmI0NTMw-QnJhbmRz';
const FT_SERIES = 'ZjIwNzVmMDQtNzU3OC00NDY4LTg3MmItNGUyYmQ5ZjY3NGY3-QnJhbmRz';

module.exports = (metadata) => {
	if(!metadata) {
		return;
	}

	const brand = metadata.find(tag => [SPECIAL_REPORT, FT_SERIES].includes(tag.idV1));

	if(brand) {
		return Object.assign({
			inSentence: brand.idV1 === FT_SERIES ? 'series' : brand.prefLabel
		}, brand);
	} else {
		return {
			inSentence: 'series'
		};
	}
}
