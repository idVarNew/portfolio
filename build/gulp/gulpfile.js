var gulp = require( "gulp" );

//PLUGINS
var autoprefixer = require( "gulp-autoprefixer" ),
    concat = require( "gulp-concat" ),
    rename = require( "gulp-rename" ),
    uglify = require( "gulp-uglify" );


// autoprefixer
gulp.task( "ap", ap );
// concat rename uglify
gulp.task( "cru", cru );
// watch all
gulp.task( "watch", watch );


function ap() {
    return gulp.src( "../../assets/css/styles.css" )
        .pipe( autoprefixer() )
        .pipe( gulp.dest( "../../assets/css" ) )
}

function cru() {
    var js1 = "../js/external/*.js",
        js2 = "../js/main/*.js",
        jsDest = "../../assets/js";

    return gulp.src( [ js1, js2 ] )
        .pipe( concat( "scripts.js" ) )
        .pipe( gulp.dest( jsDest ) )
        .pipe( rename( "scripts.min.js" ) )
        .pipe( uglify() )
        .pipe( gulp.dest( jsDest ) );
}

function watch() {
    gulp.watch( "../js/main/*.js", [ "cru", ] );
    gulp.watch( "../../assets/css/styles.css", [ "ap", ] );
}
