module.exports =  (data) => {
	const stylesheets = {
		inline: ['shared-head'],
		blocking: [],
		lazy: ['main']
	};

	if(data.type === 'package' || data.package) {
			stylesheets.inline.push('expander');	
			stylesheets.inline.push('package-head');	
			stylesheets.inline.push('topper-themed');	
			stylesheets.lazy.push('package-lazy');	
	}

	if(data.type !== 'package' && data.bodyHTML.indexOf('o-expander') >= 0) {
		stylesheets.lazy.push('expander');
	}

	if(data.type === 'video') {
		stylesheets.inline.push('video');
	} else if (data.contentStats && data.contentStats.videos > 0) {
		stylesheets.lazy.push('video');
	}

	if(data.topper && data.topper.layout !== 'basic') {
		stylesheets.inline.push('topper-themed');
	}

	if(data.topper && data.topper.template === 'basic') {
		stylesheets.inline.push('teasers');
	} else {
		stylesheets.lazy.push('teasers');
	}

	if(data.bodyHTML && data.bodyHTML.indexOf('ft-slideshow') >= 0) {
		stylesheets.lazy.push('gallery');
	}

	if(data.lightSignup && data.lightSignup.show) {
		stylesheets.lazy.push('light-signup');
	}

	if(data.inArticleBarrierHTML) {
		stylesheets.lazy.push('barrier');
	}

	return stylesheets;
}

