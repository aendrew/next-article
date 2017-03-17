const { expect } = require('chai');

const subject = require('../../../../server/controllers/article-helpers/topper-theme-map');

describe('Topper theme map', () => {
	context('sets up', () => {
		it('the regular article topper if the flag is off', () => {
			const topper = subject({ topper: { layout: 'split-text-left' } }, { articleTopper: false });
			expect(topper.template).to.equal('basic');
			expect(topper.backgroundColour).to.equal('pink');
			expect(topper.modifiers).to.deep.equal([ null ]);
		})

		it('the regular article topper if the flag is on but topper theme is unknown', () => {
			const topper = subject({topper: { theme: 'some-crazy-theme' }}, { articleTopper: true });
			expect(topper.template).to.equal('basic');
			expect(topper.backgroundColour).to.equal('pink');
			expect(topper.modifiers).to.deep.equal([ null ]);
		})

		it('the branded article topper', () => {
			const topper = subject({ designGenre: { headshot: true } }, { articleTopper: false });
			expect(topper.template).to.equal('basic');
			expect(topper.modifiers).to.deep.equal(['branded', 'has-headshot']);
		})

		it('the editorially selected topper if it exists & flag is on — overrides backgroundColour', () => {
			const topper = subject({topper: { layout: 'full-bleed-offset' }}, { articleTopper: true });
			expect(topper.template).to.equal('offset');
			expect(topper.backgroundColour).to.equal('pink');
		})

		it('topper with pink background color if none is defined', () => {
			const topper = subject({topper: { layout: 'split-text-center' }}, { articleTopper: true });
			expect(topper.template).to.equal('themed');
			expect(topper.backgroundColour).to.equal('pink');
		})
	});

	context('package article', () => {
		const articleContentFixture = {
			containedIn : [{ id: 123}],
			package: {
				design: {
					theme: 'extra'
				}
			}
		}

		const articleExtraWideFixture = {
			containedIn : [{ id: 123}],
			package: {
				design: {
					theme: 'extra-wide'
				}
			}
		}

		const packageContentFixture = {
			type: 'package',
			design: {
				theme: 'extra-wide'
			}
		}

		it('applies slate offset topper if package theme is extra', () => {
			const topper = subject(articleContentFixture, { contentPackages: true });
			expect(topper.backgroundColour).to.equal('slate');
			expect(topper.layout).to.equal('full-bleed-offset');
			expect(topper.template).to.equal('offset');
		});

		it('applies slate offset topper to article if package theme is extra-wide', () => {
			const topper = subject(articleExtraWideFixture, { contentPackages: true });
			expect(topper.backgroundColour).to.equal('slate');
			expect(topper.layout).to.equal('full-bleed-offset');
			expect(topper.template).to.equal('offset');
			expect(topper.modifiers[1]).to.equal('package-extra');
		});

		it('applies slate full-bleed-sliced topper if package landing page theme is extra-wide', () => {
			const topper = subject(packageContentFixture, { contentPackages: true });
			expect(topper.backgroundColour).to.equal('slate');
			expect(topper.layout).to.equal('full-bleed-sliced');
			expect(topper.template).to.equal('sliced');
		})
	});
});
