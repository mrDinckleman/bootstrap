'use strict'

const path    = require('path')
const babel   = require('rollup-plugin-babel')
const resolve = require('rollup-plugin-node-resolve')
const replace = require('rollup-plugin-replace')
const banner  = require('./banner.js')

const BUNDLE  = process.env.BUNDLE === 'true'

let fileDest  = 'bootstrap-md.js'
const external = ['jquery', 'popper.js', '@popperjs/core']
const plugins = [
  babel({
    exclude: 'node_modules/**', // Only transpile our source code
    externalHelpersWhitelist: [ // Include only required helpers
      'defineProperties',
      'createClass',
      'inheritsLoose',
      'defineProperty',
      'objectSpread2'
    ]
  }),
  replace({
    'process.env.NODE_ENV': '"production"'
  })
]
const globals = {
  jquery: 'jQuery', // Ensure we use jQuery which is always available even in noConflict mode
  'popper.js': 'Popper',
  '@popperjs/core': 'core'
}

if (BUNDLE) {
  fileDest = 'bootstrap-md.bundle.js'
  // Remove last entry in external array to bundle Popper
  external.pop()
  external.pop()
  delete globals['popper.js']
  delete globals['@popperjs/core']
  plugins.push(resolve())
}

module.exports = {
  input: path.resolve(__dirname, '../js/src/index.js'),
  output: {
    banner,
    file: path.resolve(__dirname, `../dist/js/${fileDest}`),
    format: 'umd',
    globals,
    name: 'bootstrap-md'
  },
  external,
  plugins
}
