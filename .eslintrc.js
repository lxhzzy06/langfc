module.exports = {
	env: {
		commonjs: true,
		es2021: true,
		node: true
	},
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'es2021'
	},
	plugins: ['@typescript-eslint'],
	excludedFiles: '*.js',
	rules: {
		'indent': ['error', 'tab'],
		'linebreak-style': ['error', 'unix'],
		'quotes': ['error', 'single'],
		'semi': ['error', 'always'],
		'no-var': 2,
		'space-infix-ops': 2,
		'no-trailing-spaces': 2,
		'no-whitespace-before-property': 2,
		'no-empty-function': 2,
		'no-multi-spaces': 2,
		'eqeqeq': 2,
		'no-dupe-args': 2,
		'no-dupe-keys': 2,
		'no-eval': 2,
		'no-self-compare': 2,
		'no-self-assign': 2,
		'no-const-assign': 2,
		'no-func-assign': 2,
		'no-mixed-spaces-and-tabs': 2,
		'@typescript-eslint/no-non-null-assertion': 0,
		'@typescript-eslint/ban-ts-comment': 2,
		'@typescript-eslint/no-explicit-any': 0
	}
};
