// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
//import vue from 'eslint-plugin-vue'
// TODO: reenable vue
// https://github.com/vuejs/eslint-plugin-vue/issues/1291

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	//vue.configs.recommended,
	{
		rules: {
			'indent': ['error', 'tab', {
				'MemberExpression': 0,
				'SwitchCase': 1,
				'flatTernaryExpressions': true,
			}],
			'linebreak-style': ['error', 'unix'],
			'quotes': ['error', 'single'],
			'semi': ['error', 'never'],
			'no-empty': ['error', { "allowEmptyCatch": true }],
			/*
			'vue/return-in-computed-property': ['error', {
				'treatUndefinedAsUnspecified': false,
			}],
			'vue/no-mutating-props': ['warn'],	// TODO
			'vue/no-reserved-component-names': ['warn'],	// TODO
			*/
			'@typescript-eslint/no-unused-vars': ['error', {
				"caughtErrorsIgnorePattern": "^_",
			}],
		},
	},
)
