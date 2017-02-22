import oDate from 'o-date';
import crossDomainFetch from 'o-fetch-jsonp';
import {broadcast} from 'n-ui/utils';

const nImage = require('n-image');
const template = require('../../../node_modules/@financial-times/n-teaser/templates/heavy.html');

function correlator (len) {
	len = len || 16;
	function genRand (sig) {
		return parseInt(Math.random() * Math.pow(10, sig), 10);
	}

	return (new Date().getTime() + '' + genRand(16) + Math.random().toString(34).slice(2)).toString().substr(0, len);
}

// cachebuster to smartology must be the same across all impressions and clicks
const smCacheBuster = correlator(64);

const pageCorrelator = correlator(); // get correlator once for the page ad calls
const MAX_ATTEMPTS = 5; //stop after five total ad calls. This will prevent accidental infinite loops with trying to get a smartmatch ad that doesn't exist.
let attempts = 0;
let skipSmartmatch = false;

const getSmartmatchData = (adUnit, dfpResponse) => {
	const uuid = document.documentElement.getAttribute('data-content-id');

	//Smartmatch explicitly require this to be double encoded
	const contentUrl = encodeURIComponent(encodeURIComponent(`ft.com/content/${uuid}`));
	const splitAdUnit = adUnit.split('/');
	const section = splitAdUnit[splitAdUnit.length - 1];
	const domain = dfpResponse.smartmatchHost || 'https://c.smartology.co';
	const url = `${domain}/static/creative/${dfpResponse.creativeID}/key/${dfpResponse.smartmatchKey}/pcid/${contentUrl}/sct=${encodeURIComponent(section)};encode=false;?cacheBuster=${smCacheBuster}`
	return crossDomainFetch(url, {
		timeout: 4000,
		mode: 'cors'
	})
	.then(response => {
		if(response.ok) {
			return response.json();
		}
	})
	.then(data => {
		if(data && data.type && data.title) {
			//add the DFP impression URL to smartmatch impression URLS
			data.impressionURL = [].concat(data.impressionURL, dfpResponse.impressionURL);
			// change placeholder to cache buster value
			data.impressionURL = data.impressionURL.map(url => url.replace(/UNKNOWN_CACHE_BUSTER/g, smCacheBuster));
			if(dfpResponse.clickTrackingPrefix) {
				data.url = dfpResponse.clickTrackingPrefix + data.url.replace(/UNKNOWN_CACHE_BUSTER/g, smCacheBuster);
			}
			return data;
		} else {
			throw 'No smartmatch results';
		}
	});
}


const getAdJson = (data) => {

	const jsonResponse = typeof data === 'object' ? data : new Function('return ' + data)();
	const keys = jsonResponse ? Object.keys(jsonResponse) : [];
	const adUnitKey = keys.length ? keys[0] : null
	if(!adUnitKey && jsonResponse && jsonResponse[adUnitKey] && jsonResponse[adUnitKey]['_html_']) {
		return null;
	};
	const markup = jsonResponse[adUnitKey]['_html_'];
	const delimiter = '----------';
	if(markup && markup.length && markup.indexOf(delimiter) >= 0) {

		try {
			const jsonString = markup.split(delimiter)[1];
			const adCustomJson = JSON.parse(jsonString.replace(/\n/g, ''));
			adCustomJson.id = jsonResponse[adUnitKey]['_creative_ids_'][0];
			adCustomJson.lineItemId = jsonResponse[adUnitKey]['_adgroup2_ids_'][0];
			return adCustomJson;
		} catch(e) {
			return null;
		}
	} else {
		return null;
	}
}

const handleResponse = (el, response) => {

	if(!(el && response && response.title)) {
		return;
	}

	const idNormalized = response.id ? '' + response.id : response.advertiser.split(' ').join('-').toLowerCase();
	el.dataset.trackable = `type-${response.type} | id-${idNormalized}`;

	const container = document.querySelector('.promoted-content')
	container.classList.add('promoted-content--loaded');
	container.classList.add(`promoted-content--${response.type}`);

	response.colspan = '{"default": 12, "L": 6}';
	response.position = '{"default": "embedded"}';
	response.widths = '[500, 332]';
	response.type = response.type === 'smartmatch' ? 'promoted-content' : response.type;
	response.mods = [response.type, 'small'];

	if(response.advertiser) {
		response.promotedByPrefix = response.type === 'paid-post' ? 'Paid Post' : 'Promoted content';
	};

	if(response.image && !response.image.url) {
		delete response.image;
	}

	if(response.type === 'special-report') {
		response.genreTag = {
			prefLabel: 'Special Report'
		};
		delete response.image;
	}

	//TODO change data at source to new naming conventions
	response.standfirst = response.summary;
	if (response.image) {
		response.mainImage = response.image;
	}
	response.relativeUrl = response.url;
	response.publishedDate = response.lastPublished;
	response.initialPublishedDate = response.published;
	if (response.tag) {
		response.teaserTag = {
			prefLabel: response.tag.name,
			relativeUrl: response.tag.url
		};
	}

	el.innerHTML = template(response);

	[].concat(response.impressionURL).forEach(url => {
		//drop all the impression tracking pixels
		const image = new Image();
		image.src = url;
	});

	nImage.lazyLoad({ root: el });

	oDate.init(el);

	broadcast('oTracking.event', {
		action: 'native-render',
		category: 'ads',
		native_ad_type: response.type,
		native_ad_id: idNormalized
	});

};

function initPaidPost (el, flags, ads) {

	if(attempts++ >= MAX_ATTEMPTS) {
		return;
	};
	const slotParams = 'pos=native';
	const adTargeting = ads.targeting.get();
	const custParams = Object.keys(adTargeting).map(k => k + '=' + encodeURIComponent(adTargeting[k])).join('&');
	const adUnit = window.oAds.config('gpt').site ? `${window.oAds.config('gpt').network}/${window.oAds.config('gpt').site}/${window.oAds.config('gpt').zone}` : '5887/ft.com/home/UK';
	let url = `https://securepubads.g.doubleclick.net/gampad/ads?gdfp_req=1&correlator=${pageCorrelator}&output=json_html&impl=fif&sc=1&sfv=1-0-4&iu=%2F5887%2F${adUnit.replace(/\/?5887\//, '')}&sz=320x50&fluid=height&scp=${encodeURIComponent(slotParams)}&d_imp=1&ga_sid=${new Date().getTime()}&cust_params=${encodeURIComponent(custParams)}`;

	if(skipSmartmatch) {
		url += encodeURIComponent('&ftpb=1');
	}

	return crossDomainFetch(url, {
		timeout: 4000,
		mode: 'cors'
	})
	.then(response => {
		if(response.ok) {
			return response.text ? response.text() : response.json();
		}
	})
	.then(getAdJson)
	.then(data => {
		if(data && data.type && data.title && data.type !== 'smartmatch') {
			const secondEl = document.querySelector('.promoted-content__second');

			handleResponse(el, data, flags);


			if(data.type === 'special-report' && !secondEl.textContent) {
				skipSmartmatch = true;
				el.setAttribute('data-o-grid-colspan', '12 L6');
				secondEl.setAttribute('data-o-grid-colspan', '12 L6');
				initPaidPost(secondEl, flags, ads);
			}
		} else if (data && data.type === 'smartmatch') {
			getSmartmatchData(adUnit, data)
			.then(smartmatchResponse => {
				handleResponse(el, smartmatchResponse, flags);
			})
			.catch(() => {
				//no smartmatch results - make another ad call
				skipSmartmatch = true;
				initPaidPost(el, flags, ads);
			});
		}
	});
};

export default (flags) => {
	if(flags.get('nativeAds') && flags.get('nativeAdsArticle')) {

		const el = document.querySelector('.promoted-content__first');

		if(!el) {
			return;
		}

		if(window.oAds && window.oAds.isInitialised) {
			initPaidPost(el, flags, window.oAds);
		} else {
			document.addEventListener('oAds.initialised', e => {
				initPaidPost(el, flags, e.detail);
			});
		}


	}

}
