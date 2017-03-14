const { expect } = require('chai');

const subject = require('../../../../server/controllers/article-helpers/content-package');

describe('Content package', () => {

	context('guards', () => {
		it('if empty or nonexistent containedIn', () => {
			expect(subject({ id: '123', containedIn: [] })).eql({});
			expect(subject({ id: '123' })).eql({});
		});
		it('if no id', () => {
			expect(subject({ containedIn: [{id: '123'}] })).eql({});
		});
	});

	context('unordered', () => {
		it('should place current one second in contents if not first in package and package has enough subsequent pieces of content', () => {
			const packageArticleStub = {
				id: '456',
				containedIn: [{
					design: { theme: 'special-report' },
					contains: [
						{id: '123'},
						{id: '789'},
						{id: 'ghi'},
						{id: '456'},
						{id: 'jkl'},
						{id: 'mno'},
						{id: 'pqr'},
						{id: 'abc'},
						{id: 'def'},
					]
				}]
			};
			expect(subject(packageArticleStub).package.contents).eql([
				{id: 'ghi'},
				{id: '456'},
				{id: 'jkl'},
				{id: 'mno'},
				{id: 'pqr'},
				{id: 'abc'}
			]);
		});

		it('should place current one first in contents if first in package', () => {
			const packageArticleStub = {
				id: '123',
				containedIn: [{
					design: { theme: 'special-report' },
					id: '456',
					contains: [{id: '789'}, {id: 'abc'}, {id: '123'}]
				}]
			};
			expect(subject(packageArticleStub).package.contents).eql([
				{id: '789'},
				{id: 'abc'},
				{id: '123'}
			]);
		});

		it('should shorten a package', () => {
			const packageArticleStub = {
				id: '456',
				containedIn: [{
					design: { theme: 'special-report' },
					contains: [
						{id: '123'},
						{id: '789'},
						{id: 'abc'},
						{id: 'def'},
						{id: 'ghi'},
						{id: '456'},
						{id: 'jkl'},
						{id: 'mno'},
						{id: 'pqr'}
					]
				}]
			};
			expect(subject(packageArticleStub).package.contents).eql([
				{id: 'def'},
				{id: 'ghi'},
				{id: '456'},
				{id: 'jkl'},
				{id: 'mno'},
				{id: 'pqr'}
			]);
		});
	});

	it('should add context', () => {
		const packageArticleStub = {
			id: '123',
			containedIn: [{
				design: { theme: 'special-report' },
				id: 'ghi',
				contains: [{id: 'abc'}, {id: 'def'}, {id: '123'}, {id: 'jkl'}]
			}]
		};
		expect(subject(packageArticleStub).context).eql({
			prev: {id: 'def'},
			next: {id: 'jkl'},
			home: {id: 'ghi', contains: [{id: 'abc'}, {id: 'def'}, {id: '123'}, {id: 'jkl'}], design: { theme: 'special-report' }},
			current: {id: '123'},
			sequenceId: undefined
		});
	});

	it('should add sequenceId if exact-ordered and part-numbered', () => {
		const packageArticleStub = {
			id: '123',
			containedIn: [{
				id: '456',
				design: { theme: 'special-report' },
				contains: [{id: '456'}, {id: '123'}, {id: '789'}],
				tableOfContents: {
					sequence: 'exact-order',
					labelType: 'part-number'
				}
			}]
		};
		const data = subject(packageArticleStub);
		expect(data.package.contents).eql([
			{sequenceId: 'PART 1', id: '456'},
			{sequenceId: 'PART 2', id: '123'},
			{sequenceId: 'PART 3', id: '789'}
		]);
	});
});
