import replace from '@rollup/plugin-replace'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import css from 'rollup-plugin-import-css'

const variant = process.env && process.env.variant ? process.env.variant : 'local'
console.log('VARIANT=' + variant)

const external = []
const globals = {}
if (variant !== 'local') {
	[].push.apply(external, [
		'normalize.css',
		'vue',
		'vue-router',
		'@fortawesome/fontawesome-svg-core',
		'@fortawesome/vue-fontawesome',
	])
	globals.vue = 'Vue'
	globals['vue-router'] = 'VueRouter'
	globals['@fortawesome/fontawesome-svg-core'] = 'FontAwesome'
	globals['@fortawesome/vue-fontawesome'] = "window['vue-fontawesome']"
}

export default {
	input: 'output/intermediate/index.js',
	external,
	output: {
		file: `output/${variant}/main.js`,
		format: 'iife',
		globals,
	},
	treeshake: 'smallest',
	plugins: [
		replace({
			'process.env.NODE_ENV': JSON.stringify('production'),
			VARIANT: JSON.stringify(variant),
		}),
		nodeResolve(),
		css({
			output: 'main.css',
			minify: true,
		}),
		commonjs(),
		terser({
			ecma: 2023,
			warnings: true,
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
				comments: false,
			},
		}),
	],
}
