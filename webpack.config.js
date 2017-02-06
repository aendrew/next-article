const nWebpack = require('@financial-times/n-ui/webpack');

module.exports = nWebpack({
	entry: {
		'./public/main.js': './client/main.js',
		'./public/main.css': './client/main.scss',
		'./public/comments.js': './client/comments.js',
		'./public/comments.css': './client/comments.scss'
	},
	nUiExcludes: ['o-viewport']
})
