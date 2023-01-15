/*
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018, 2019, 2020, 2021 Aleksander Mazur
 *
 * iDom-fe is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * iDom-fe is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with iDom-fe. If not, see <https://www.gnu.org/licenses/>.
 */

"use strict"
const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

function kebabCase(camelCase) {
	let result = ''
	for (const c of camelCase) {
		const lc = c.toLowerCase()
		if (lc !== c)
			result += '-'
		result += lc
	}
	return result
}

module.exports = function(env, argv) {
	const productionMode = argv.mode === 'production'
	const variant = env && env.variant ? env.variant : 'local'
	console.log('MODE=' + argv.mode + ' VARIANT=' + variant)

	const outdirUpper = path.resolve(__dirname, 'output')
	const outdir = path.resolve(outdirUpper, variant)

	const configuration = {
		//devtool: 'source-map',
		entry: './output/intermediate/index.js',
		resolve: {
			extensions: ['.js'],
		},
		output: {
			path: outdir,
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					loader: 'babel-loader',
					sideEffects: false,
				},
				{
					test: /\.css$/,
					use: [
						MiniCssExtractPlugin.loader,
						{
							loader: 'css-loader',
							/*
							options: {
								sourceMap: true,
							},
							*/
						}
					],
					sideEffects: true,
				},
				{
					test: /\.(woff2?|ttf|eot|svg|png|jpg|jpeg)$/,
					exclude: /node_modules/,
					loader: 'file-loader',
					sideEffects: true,
				}
			]
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: 'src/' + variant + '.html',
				minify: {
					html5: true,
					removeComments: true,
					collapseWhitespace: true,
					preserveLineBreaks: true,
					removeAttributeQuotes: true,
					useShortDoctype: true
				},
				//favicon: 'favicon.ico'
			}),
			new MiniCssExtractPlugin(),
		],
		optimization: {
			minimizer: [
				new TerserPlugin({
					parallel: true,
					//sourceMap: true,
					terserOptions: {
						ecma: 5,
						//warnings: true,
						toplevel: true,
						compress: {
							passes: 2,
							toplevel: true,
							keep_fargs: false,
							pure_getters: true,
							hoist_funs: true,
							//unsafe: true,
							unsafe_math: true,
						},
						mangle: {
							toplevel: true,
						},
						output: {
							semicolons: false,
						},
					},
					//warningsFilter: (source) => !source || !/\/node_modules\//.test(source),
				}),
				new CssMinimizerPlugin(),
			]
		},
	}

	configuration.plugins.push(new webpack.DefinePlugin({
		VARIANT: JSON.stringify(variant),
		DEVELOPMENT: !productionMode,
	}))

	configuration.externals = []
	/*
	if (variant !== 'cloud')
		configuration.externals.push(function(context, request, callback) {
			if (/^@?firebase/.test(request))
				return callback(null, undefined)
			callback()
		})
	*/

	if (variant !== 'local') {
		configuration.externals.push({
			'normalize.css': 'undefined',
			'vue': 'Vue',
			'vue-router': 'VueRouter',
			'@fortawesome/fontawesome-svg-core': 'window FontAwesome',
			'@fortawesome/vue-fontawesome': ['window', 'vue-fontawesome'],
		})
		/*
		configuration.externals.push(function({ context, request }, callback) {
			let style
			if (/^@fortawesome\/free-brands-svg-icons\//.test(request))
				style = 'fab'
			else if (/^@fortawesome\/free-solid-svg-icons\//.test(request))
				style = 'fas'
			else
				return callback()
			const camel = request.split('/')[2]
			let kebab = kebabCase(camel)
			kebab = kebab.substring(kebab.indexOf('-') + 1)
			const result = `{ "${camel}": window.FontAwesome.findIconDefinition({ prefix: ${JSON.stringify(style)}, iconName: ${JSON.stringify(kebab)} }) }`
			return callback(null, result)
		})
		*/
	}

	switch (argv.mode) {
		case 'development':
			configuration.devtool = 'source-map'
			break
		case 'production':
			break
	}

	return configuration
}
