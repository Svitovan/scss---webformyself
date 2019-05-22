const gulp = require('gulp');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const path = require('path');
const less = require('gulp-less');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const smartgrid = require('smart-grid');
const imageResize = require('gulp-image-resize');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();


let isDev = true;

// let isProd = !isDev;
// let isDev = process.argv.includes('--dev');
// console.log(process.argv);

let config = {
    src: './src/',
    build: './build/',
    html: {
        src: '**/*.html',
        dest: '/'
    },
    css: {
        src: 'css/*.*',
        dest: '/css'
    },
    img: {
        src: 'img/*',
        dest: '/img'
    }
};

function html(){
    return gulp.src(config.src + config.html.src)
        .pipe(gulp.dest(config.build + config.html.dest))
        .pipe(browserSync.stream());
}

function css(){
    return gulp.src(config.src + config.css.src)
        .pipe(gulpIf(isDev, sourcemaps.init()))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            browsers: ['last 3 version']           
        }))
        .pipe(cleanCSS({compatibility: 'ie8',
                        level: 1 }))
        .pipe(gulpIf(isDev, sourcemaps.write()))
        .pipe(gulp.dest(config.build + config.css.dest))
        .pipe(browserSync.stream());
        
}

function Less(){
    return gulp.src('./src/less/*.less')
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(concat('less.css'))
        .pipe(gulp.dest('./src/css/'));
}

function scss(){
    return gulp.src('./src/scss/**/*.scss')
    .pipe(sass())
    .pipe(concat('scss.css'))
    .pipe(gulp.dest('./src/css/'));
}

function img(){
    return gulp.src(config.src + config.img.src)
        .pipe(gulp.dest(config.build + config.img.dest));
}

// Images @x1 & @x2 + Compression | Required graphicsmagick (sudo apt update; sudo apt install graphicsmagick)
function imgx1(){
	return gulp.src('./src/img/*.*')
	.pipe(imageResize({ width: '50%' }))
	.pipe(imagemin())
	.pipe(gulp.dest('./build/img/@1x/'))
}

function imgx2(){
	return gulp.src('./src/img/*.*')
	.pipe(imageResize({ width: '100%' }))
	.pipe(imagemin())
	.pipe(gulp.dest('./build/img/@2x/'))
}

// SMARTGRID generating
function grid(done){
	let gridSettings = {
        outputStyle: 'scss',
		container: {
	        maxWidth: "900px",
	        fields: "30px"
	    },
		breakPoints: {
			
		}
	};

	smartgrid(config.src + 'scss', gridSettings);
	done();
}

function clear(){
    return del(config.build + '/*' ),
           del('./src/css/*')
}

// function watch(){
//     gulp.watch(config.src + config.css.src, css);
//     gulp.watch(config.src + config.html.src, html);
//     gulp.watch('./src/less/*.less', Less); 
// }


function watch(){
	
		browserSync.init({
	        server: {
	            baseDir: config.build
	        },
	        // tunnel: true
	    });
	

	gulp.watch(config.src + config.html.src, html);
    gulp.watch(config.src + config.css.src, css);
    // gulp.watch('./src/less/*.less', Less);
    gulp.watch('./src/scss/**/*.scss', scss);
}


gulp.task('html', html);
gulp.task('css', css); 
gulp.task('img', img);     
gulp.task('imgx1', imgx1); //manual
gulp.task('imgx2', imgx2); //manual
gulp.task('less', Less);
gulp.task('scss', scss);
gulp.task('grid', grid);   //manual
gulp.task('clear', clear);
gulp.task('watch', watch);



let build = gulp.series(clear, gulp.parallel(html, img, css, scss));

gulp.task('default', gulp.series(build, watch));


// gulp.task('build', build);
// gulp.task('dev', gulp.series(build, watch));

// gulp.task('default', gulp.series(build, watch));





