module.exports = {
	'env': {
		'browser': true,
		'es2021': true,
	},
	'extends': [
		'eslint:recommended',
		'plugin:vue/essential',
		'plugin:@typescript-eslint/recommended',
	],
	'parserOptions': {
		'ecmaVersion': 13,
		'parser': '@typescript-eslint/parser',
		'sourceType': 'module',
	},
	'plugins': [
		'vue',
		'@typescript-eslint',
	],
	'rules': {
		'indent': ['error', 'tab', {
			'MemberExpression': 0,
			'SwitchCase': 1,
			'flatTernaryExpressions': true,
		}],
		'linebreak-style': ['error', 'unix'],
		'quotes': ['error', 'single'],
		'semi': ['error', 'never'],
		'no-empty': ['error', { "allowEmptyCatch": true }],
		'vue/return-in-computed-property': ['error', {
			'treatUndefinedAsUnspecified': false,
		}],
		'vue/no-mutating-props': ['warn'],	// TODO
		'vue/no-reserved-component-names': ['warn'],	// TODO
	},
}
