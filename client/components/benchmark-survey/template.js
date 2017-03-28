/**
 * This would make a lot more sense as a React component TBTH
 *
 * @param  {String} [headline=''] Headline copy
 * @param  {String} [copy='']     Main descriptive microcopy
 * @param  {String} [cta='']      Button call-to-action text
 * @param  {Boolean|String} [tcs=false}]  Either `false` or a URL to a Terms & Conditions page
 * @return String                 Rendered template code
 */
const template = ({headline = '', copy = '', cta = '', tcs = false}) =>
`<i class="benchmark-survey--close-button"></i>
<div class="benchmark-survey--graphic-header">
	<i class="benchmark-survey--speech-icon"></i>
	<i class="benchmark-survey--speech-icon-right"></i>
</div>
<h2 class="benchmark-survey--headline o-typography-subhead">${headline}</h2>
<p class="benchmark-survey--copy">${copy}</p>
<button class="benchmark-survey--cta">${cta}</button>
${tcs ? `<p class="benchmark-survey--tcs"><a href="${tcs}">T&Cs apply</a></p>`: ''}`;

export default template;
