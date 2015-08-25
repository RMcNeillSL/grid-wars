/* global module */
module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['Gruntfile.js', 'scripts/**/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        less: {
            development: {
                files: {
                    'style/css/style.css': 'style/style.less'
                }
            }
        },
        watch: {
            files: ['style/**/*.less'],
            tasks: ['less']
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
};