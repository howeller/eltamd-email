// Node & NPM packages
const del = require('del'),
			fs = require('fs'),
			merge = require('merge-stream'),
			path = require('path'),
			pngquant = require('imagemin-pngquant'),
			imagemin = require('gulp-imagemin'),
			buffer = require('vinyl-buffer'),
			gulp = require('gulp'),
			gch = require('gulp-compile-handlebars'),
			emailBuilder = require('gulp-email-builder-min'),
			rename = require('gulp-rename'),
			zip = require('gulp-zip');

// Custom modules & config
const ef = require('./lib/htmlEmailTextFormatting'),
			util = require('./lib/fsUtils');

// Directory structure
const dir = {
	content:'./src/content.json',
	css:'./src/templates/css/',
	cssToLine:'./src/templates/cssCache/',
	dist:'./build/emails/',
	emails:'./src/emails/',
	images:'./src/shared_images/',
	modules:'./src/templates/modules/',
	preview:'./preview/categories/eng/',
	templates:'./src/templates/',
	zips:'build/zips/'
}

const inliner = emailBuilder({ encodeSpecialChars: true, juice: {preserveImportant: true, applyWidthAttributes:false} }),
	srcFolders = util.getFolders(dir.emails),
	useCdnImgPath = false; // Use relative paths or CDN paths set inside the config

const serverPath = (scope=this) => (useCdnImgPath && scope.image_path) ? scope.image_path : 'images/';

// const checkHex = (color) => (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color)) ? color : false; //	Validate Hex Number

function buildEmail(){

	let task = srcFolders.map(function(folder) {
		let _src = path.join(dir.emails, folder),
				_dist = util.mkDirByPathSync(path.join(dir.dist, folder)),//Path to final production files
				_content = JSON.parse(fs.readFileSync(dir.content)),
				_name = path.basename(folder),
				_data = _content['Emails'][_name],
				_template = dir.templates+'/main.html.hbs';

		_data['global'] = _content['global'];
		_data['name'] = _name; // Store the folder name as a new JSON key/value. Avoids repeating the key name in JSON.

		// Configure gulp-compile-handlebars options
		let hbsOptions = {	
			ignorePartials:false,
			batch:[_src, dir.modules, dir.templates],
			helpers : {
				getName : function(arg){ return arg },
				// getBgColor: function(arg, root){ return (checkHex(arg)) ? arg : root.groupGlobal.baseColor },// check if value is hex and return 
				serverPath: function(scope){ return serverPath(scope) },
				formatList: 			ef.formatList,
				formatParagraph: 	ef.formatParagraph,
				formatLine: 			ef.replaceLastSpace,
				formatCtaTxt: 		ef.formatCtaTxt
			}
		}

		// console.log('• '+_name);
		let _html = gulp.src(_template)
			.pipe(gch(_data, hbsOptions))
			.pipe(inliner.build())
			.pipe(rename('index.html'))
			.pipe(gulp.dest(_dist));

		// let _images = gulp.src([_src+'/images/**', dir.images+'/**'])// pipe "images" and contents
		// 	.pipe(gulp.dest(_dist+'/images'));
		
		return merge( _html);
	});
	let lastStream = task[task.length-1];
	return lastStream;
}

function compileCss(){
	let _content = JSON.parse(fs.readFileSync(dir.content)),
		hbsOptions = {	
			ignorePartials:false,
			batch:[dir.css, dir.templates],
			helpers : {
				getName : function(arg){return arg},
				getGroup : function(){return getModule(name)}
			}
		}

  return gulp.src([dir.css+'inlinedStyles.css.hbs', dir.css+'embeddedStyles.css.hbs', dir.emails+'**/*.css.hbs'])
		.pipe(gch(_content, hbsOptions))
		.pipe(rename(function (path) {
			return { basename:path.basename, dirname:'', extname:'' };
		}))
		.pipe(gulp.dest(dir.cssToLine));
  // return gulp.src([dir.css+'*.css.hbs', dir.emails+'**/*.css.hbs'])
		// .pipe(gch(_content, hbsOptions))
		// .pipe(rename(function (path) {
		// 	return { basename:path.basename, dirname:'', extname:'' };
		// }))
		// .pipe(gulp.dest(dir.cssToLine));
}
/*function copyHtml(){

	let task = srcFolders.map(function(folder) {
		let _dist = path.join(dir.dist, folder),
				_name = path.basename(folder);

		return gulp.src(_dist+'/index.html')
			.pipe(rename(_name+'.html'))
			.pipe(gulp.dest(_dist));

	});
	let lastStream = task[task.length-1];
	return lastStream;
}*/

function optimizeImages(){

	let task = srcFolders.map(function(folder) {
		let _src = path.join(dir.emails, folder),
			_dist = path.join(dir.dist, folder);

		let pngs = gulp.src([dir.images+'*.png', _src+'/images/*.png'])
			.pipe(buffer())// DEV: We must buffer our stream into a Buffer for imagemin
			.pipe(imagemin([pngquant({quality: [0.2, 0.5]})]));

		let jpgs = gulp.src([dir.images+'*.jpg', _src+'/images/*.jpg']);
			
		return merge(pngs, jpgs)
			.pipe(gulp.dest(_dist+'/images/'));

	});
	let lastStream = task[task.length-1];
	return lastStream;
}

function zipFiles() {

	let task = srcFolders.map(function(folder) {	
		const _src = path.join(dir.emails, folder),
			_dist = path.join(dir.dist, folder),
			_name = path.basename(folder);
			// _dest = dir.zips,
			// _images = _dist+'/images/';

		// Zip up HTML and images
		const _html = gulp.src(_dist+'/index.html').pipe(rename(_name+'.html'));

		const _images = gulp.src(_dist+'/images/**/*', {base:_dist});

		return merge( _html, _images)
			.pipe(zip(_name+'.zip'))
			.pipe(gulp.dest(dir.zips));
			
		// return gulp.src([_dist+'/images/**/*',_dist+'/'+_name+'.html'],{base:_dist})
		// 	.pipe(zip(_name+'.zip'))
		// 	// .pipe(rename(function(file){file.basename = folder + file.basename;}))
		// 	.pipe(gulp.dest(_dest));

	});
	let lastStream = task[task.length-1];
	return lastStream;
}

function previewCatConfig(){

	let _data = JSON.parse(fs.readFileSync(dir.content)),
		_option = { ignorePartials:false }

	return gulp.src(dir.templates+'js/contentData4Email.js.hbs')
		.pipe(gch(_data, _option))
		.pipe(rename('contentData.js'))
		.pipe(gulp.dest(dir.preview));
}

// Tasks
gulp.task('build', buildEmail);
gulp.task('css', compileCss); 
gulp.task('img', optimizeImages); 
gulp.task('clean:css', () => { return del(dir.cssToLine+'/*.css') });
gulp.task('clean:html', () => { return del(dir.dist+'**/*'); });
gulp.task('clean:zips', () => { return del(dir.zips+'**/*'); });
gulp.task('clean', () => { return gulp.parallel('clean:zips', 'clean:html')});
gulp.task('default', gulp.series('clean:css','css', 'build'));
gulp.task('all', gulp.series('clean:css','css', 'build', 'img'));
// gulp.task('copy', copyHtml);
gulp.task('watch', () => { gulp.watch([ dir.emails+'**/**.hbs', dir.templates+'**/**.hbs', './lib/**', dir.content], gulp.series('default')) });
gulp.task('preview', previewCatConfig);
gulp.task('zip', gulp.series('clean:css','css', 'build', 'img', zipFiles));
