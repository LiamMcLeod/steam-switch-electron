// var gulp = require('gulp');
var elixir = require('laravel-elixir');
require('laravel-elixir-webpack-official')
// require('laravel-elixir-vue-2');

elixir(function (mix) {
    mix.sass(
            './public/css/main.scss',
            './public/app.css'
        )
        .webpack(
            './public/js/main.js',
            './public/app.js'
        );
});