const SPECIAL_REPORT = 'MjBkZDZhODAtYTQzOS00YmM1LWI4ZTItN2VjM2QwZmI0NTMw-QnJhbmRz';
const FT_SERIES = 'ZjIwNzVmMDQtNzU3OC00NDY4LTg3MmItNGUyYmQ5ZjY3NGY3-QnJhbmRz';

module.exports = (metadata) => {
	if(metadata.find(tag => tag.idV1 === SPECIAL_REPORT)) {
		return {
			full: 'Special Report',
			inSentence: 'Special Report'
		};
	} else if (metadata.find(tag => tag.idV1 === FT_SERIES)) {
		return {
			full: 'FT Series',
			inSentence: 'series'
		};
	}
}
