export default () => {

	const articleUUID = document.querySelector('article').getAttribute('data-content-id');

	const holder = document.querySelector('.ftlabsaudioplayerholder');
	const audioElement = document.querySelector('audio.ftlabs-audio-player');

	fetch(`https://ftlabs-audio-available.herokuapp.com/check/${articleUUID}`)
		.then(res => {
			if(res.ok){
				return res
			} else {
				throw res;
			}
		})
		.then(res => res.json())
		.then(data => {
			if(data.haveFile === true){
				audioElement.src = data.url;
				if(audioElement.canPlayType('audio/mpeg;codecs=mp3')){
					holder.classList.remove('ftlabsaudioplayerholder--inactive');
				}
			}
		})
	;

}
