module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // concat: {
        //     options: {
        //         // define a string to put between each file in the concatenated output
        //         separator: ';'
        //     },
        //     dist: {
        //         // the files to concatenate
        //         src: ['js/**/*.js', '!js/test/**/*.js'],
        //         // the location of the resulting JS file
        //         dest: 'dist/<%= pkg.name %>.js'
        //     }
        // },
        uglify: {
            options: {
                // banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
                sourceMap: true,
                toplevel: true,
                mangle: {
                    toplevel: true
                }
            },
            // dist: {
            //     files: {
            //         'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
            //     }
            // }
            // my_target: {
            //     files: {
            //         'dist/ccxt.min.js': [
            //             'js/**/*.js',
            //             '!js/test/**/*.js'
            //         ]
            //     }
            // }
            my_target: {
                files: [{
                    expand: true,
                    cwd: '.',
                    src: 'js/**/*.js',
                    dest: 'dist'
                }]
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['uglify']);
};