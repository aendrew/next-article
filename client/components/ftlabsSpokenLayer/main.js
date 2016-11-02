export default () => {

	const tag = document.createElement('script');

	tag.addEventListener('load', function (){
		const SpokenLayer = window.SpokenLayer || function (){};
		new SpokenLayer({
			'player-config-key':'d4341ec8-2059-4102-9528-e13bb795f5f3',
			'publication-id':'0be8df9d-8f7f-41b0-99ed-686e1f22a5db'
		});
	}, false);

	tag.src = 'https://embed.spokenlayer.com/v3/spokenlayer.js';
	document.body.appendChild(tag);

}
