const { expect } = require('chai');

const subject = require('../../../../server/controllers/article-helpers/content-package');

describe('Content package article helper', () => {

	context('should return an empty object', () => {
		it('if called with empty or nonexistent containedIn', () => {
			expect(subject({ id: '123', containedIn: [] })).eql({});
			expect(subject({ id: '123' })).eql({});
		});
		it('if called with id-less content', () => {
			expect(subject({ containedIn: [{id: '123'}] })).eql({});
		});
	});

	context('when content package is part-numbered and current item is not first in list', () => {
		it('should place current item second in contents and add correct part numbers', () => {
			const packageArticleStub = {
				id: '456',
				containedIn: [{
					tableOfContents: { labelType: 'part-number' },
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
						{id: 'hij'},
						{id: 'klm'},
						{id: 'nop'}
					]
				}]
			};
			expect(subject(packageArticleStub).package.contents).eql([
				{id: 'ghi', label: 'PART 3'},
				{id: '456', label: 'PART 4'},
				{id: 'jkl', label: 'PART 5'},
				{id: 'mno', label: 'PART 6'},
				{id: 'pqr', label: 'PART 7'},
				{id: 'abc', label: 'PART 8'},
				{id: 'def', label: 'PART 9'},
				{id: 'hij', label: 'PART 10'},
				{id: 'klm', label: 'PART 11'}
			]);
		});
	});

	context('when content package is unordered', () => {
		it('should place current item first in contents and add \'currently reading\' label', () => {
			const packageArticleStub = {
				id: '456',
				containedIn: [{
					design: { theme: 'special-report' },
					tableOfContents: { sequence: 'none' },
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
						{id: 'hij'},
						{id: 'klm'},
						{id: 'nop'}
					]
				}]
			};
			expect(subject(packageArticleStub).package.contents).eql([
				{id: '456', label: 'Currently reading:'},
				{id: 'jkl'},
				{id: 'mno'},
				{id: 'pqr'},
				{id: 'abc'},
				{id: 'def'},
				{id: 'hij'},
				{id: 'klm'},
				{id: 'nop'}
			]);
		});

		it('if the current article is towards the end of the package', () => {
			const packageArticleStub = {
				id: '456',
				containedIn: [{
					design: { theme: 'special-report' },
					tableOfContents: { sequence: 'none' },
					contains: [
						{id: '123'},
						{id: '789'},
						{id: 'abc'},
						{id: 'def'},
						{id: 'hij'},
						{id: 'klm'},
						{id: 'ghi'},
						{id: '456'},
						{id: 'jkl'},
						{id: 'mno'},
						{id: 'pqr'}
					]
				}]
			};
			expect(subject(packageArticleStub).package.contents).eql([
				{id: '456', label: 'Currently reading:'},
				{id: 'abc'},
				{id: 'def'},
				{id: 'hij'},
				{id: 'klm'},
				{id: 'ghi'},
				{id: 'jkl'},
				{id: 'mno'},
				{id: 'pqr'}
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
						{id: 'pqr'},
						{id: 'stu'},
						{id: 'vwx'},
						{id: 'yza'}
					]
				}]
			};
			expect(subject(packageArticleStub).package.contents).eql([
				{id: 'def'},
				{id: 'ghi'},
				{id: '456'},
				{id: 'jkl'},
				{id: 'mno'},
				{id: 'pqr'},
				{id: 'stu'},
				{id: 'vwx'},
				{id: 'yza'}
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
			{label: 'PART 1', id: '456'},
			{label: 'PART 2', id: '123'},
			{label: 'PART 3', id: '789'}
		]);
	});
});
