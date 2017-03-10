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
		it('should place current one first in contents', () => {
			const packageArticleStub = {
				id: '123',
				containedIn: [{
					id: '456',
					contains: [{id: '789'}, {id: 'abc'}, {id: '123'}]
				}]
			};
			expect(subject(packageArticleStub).package.contents).eql([
				{id: '123'},
				{id: '789'},
				{id: 'abc'}
			]);
		});
		it('should shorten a package', () => {
			const packageArticleStub = {
				id: '456',
				containedIn: [{
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
				{id: '456'},
				{id: 'abc'},
				{id: 'def'},
				{id: 'ghi'},
				{id: 'jkl'},
				{id: 'mno'}
			]);
		});
	});
	it('should add context', () => {
		const packageArticleStub = {
			id: '123',
			containedIn: [{
				id: 'ghi',
				contains: [{id: 'abc'}, {id: 'def'}, {id: '123'}, {id: 'jkl'}]
			}]
		};
		expect(subject(packageArticleStub).context).eql({
			prev: {id: 'def'},
			next: {id: 'jkl'},
			home: {id: 'ghi', contains: [{id: 'abc'}, {id: 'def'}, {id: '123'}, {id: 'jkl'}]},
			current: {id: '123'}
		});
	});
	it('should add sequenceId if exact-ordered and part-numbered', () => {
		const packageArticleStub = {
			id: '123',
			containedIn: [{
				id: '456',
				contains: [{id: '456'}, {id: '123'}, {id: '789'}],
				tableOfContents: {
					sequence: 'exact-order',
					labelType: 'part-number'
				}
			}]
		};
		expect(subject(packageArticleStub).package.contents).eql([
			{sequenceId: 'PART 1', id: '456'},
			{sequenceId: 'PART 2', id: '123'},
			{sequenceId: 'PART 3', id: '789'}
		]);
	});
});
