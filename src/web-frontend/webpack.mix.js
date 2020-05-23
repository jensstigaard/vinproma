const mix = require('laravel-mix')

require('laravel-mix-tailwind')


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

mix.js('src/app.js', 'dist/public/js')
   .sass('src/app.sass', 'dist/public/css')
   .sass('src/dark.sass', 'dist/public/css')
   .setPublicPath('dist/public')
   .tailwind()

mix
   .disableNotifications()
   .sourceMaps()
