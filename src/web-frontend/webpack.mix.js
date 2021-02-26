const mix = require('laravel-mix')

require('mix-tailwindcss')

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for your application, as well as bundling up your JS files.
 |
 */

mix.webpackConfig({
  module: {
    rules: [
      // https://vue-loader.vuejs.org/guide/pre-processors.html#pug
      {
        test: /\.pug$/,
        oneOf: [
          // this applies to `<template lang="pug">` in Vue components
          {
            resourceQuery: /^\?vue/,
            use: ['pug-plain-loader'],
          },
          // this applies to pug imports inside JavaScript
          {
            use: ['raw-loader', 'pug-plain-loader'],
          },
        ],
      },
    ],
  },
})

mix
  .setPublicPath('dist/public')
  .js('src/app.js', 'js')
  .sass('src/app.sass', 'css')
  .sass('src/dark.sass', 'css')
  .vue({ version: 2 })
  .tailwind()

mix
  // Disable notifications
  .disableNotifications()
  // Add source maps
  .sourceMaps()
