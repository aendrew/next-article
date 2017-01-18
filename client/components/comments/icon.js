const createIcon = {
	init: function () {
		const oCommentCount = require('o-comment-count');
		oCommentCount.init();

		const articleComments = document.querySelectorAll('.article__share__comments');
		for (let i = 0; i < articleComments.length; i++) {
			articleComments[i].style.visibility = 'visible';
		}
	}
}

module.exports = createIcon;
