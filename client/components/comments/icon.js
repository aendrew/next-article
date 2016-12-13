const createIcon = {
	init: function () {
		const CommentCount = require('o-comment-count');
		const uuid = document.querySelector('article[data-content-id]').getAttribute('data-content-id');
		const articleShareList = document.querySelectorAll('.article__share');
		const articleShareArray = Array.prototype.slice.call(articleShareList);

		CommentCount.setConfig({
			'template': '{count}'
		});
		articleShareArray.forEach(function (articleShare) {
			let commentLink = document.createElement('a');
			new CommentCount(commentLink, {
				articleId: uuid
			});
			commentLink.setAttribute('href', '#comments');
			commentLink.setAttribute('data-trackable', 'view-comments');
			commentLink.className = 'article__share__comments';
			let commentPlusSave = document.querySelector('.comment_plus_save');
			commentPlusSave.insertBefore(commentLink, articleShare.querySelector('.article__save'));
		});
	}
}

module.exports = createIcon;
