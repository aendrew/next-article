export default () => {

	const articleUUID = document.querySelector('article').getAttribute('data-content-id');

	const holder = document.querySelector('.ftlabsaudioplayerholder');
	const audioElement = document.querySelector('audio.ftlabs-audio-player');

	function logPlayerInteractions (interaction){
		document.body.dispatchEvent( new CustomEvent('oTracking.event',
			{
				detail: {
					action: `ftlabsaudio-${interaction}`,
					category: 'audio',
					contentID: articleUUID,
					position: audioElement.currentTime
				}, bubbles: true
			}
		));

	};

	audioElement.addEventListener('play', () => { logPlayerInteractions('play') }, false);
	audioElement.addEventListener('pause', () => { logPlayerInteractions('pause') }, false);
	audioElement.addEventListener('seeked', () => { logPlayerInteractions('seek') }, false);
	audioElement.addEventListener('ended', () => { logPlayerInteractions('ended') }, false);

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
