import eslintJs from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';

export default [
	eslintJs.configs.recommended,
	jsdoc.configs['flat/recommended'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				'ShowConfirmDialog': true,
				'DoAgeGateSubmit': true,
				'ViewProductPage': true,
				'protobuf': true
			}
		}
	},
	{
		ignores: [
			'dist'
		]
	},
	{
		plugins: {
			'@stylistic': stylistic
		},
		rules: {
			'@stylistic/indent': [
				'error',
				'tab'
			],
			'@stylistic/linebreak-style': [
				'error',
				'unix'
			],
			'@stylistic/quotes': [
				'error',
				'single',
				{
					'avoidEscape': true
				}
			],
			'@stylistic/semi': [
				'error',
				'always'
			],
			'eqeqeq': [
				'error',
				'always'
			],
			'no-unused-vars': [
				'warn',
				{
					varsIgnorePattern: '^_'
				}
			],
			'@stylistic/space-before-function-paren': [
				'error',
				'always'
			],
			'@stylistic/function-call-spacing': [
				'error',
				'never'
			]
		}
	}
];
