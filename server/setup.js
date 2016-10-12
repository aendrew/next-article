// modules that need to be compiled by babel
const es6Modules = [
	'@financial-times/n-section',
	'@financial-times/n-ui',
	'o-date'
];

require('babel-register')({
	plugins: [
		require.resolve('babel-plugin-add-module-exports'),
		require.resolve('babel-plugin-transform-es2015-modules-commonjs')
	],
	presets: [
		require.resolve('babel-preset-react')
	],
	ignore: filename =>
		filename.includes('/node_modules/') && !es6Modules.some(module => filename.includes(`/node_modules/${module}`))
});
