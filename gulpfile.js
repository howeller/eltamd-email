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
	eh = require('./lib/htmlEmailHelpers'),
	tf = require ('./lib/txtFormatting'),
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
	txt:'./src/templates/txt/',
	preview:'./preview/categories/eng/',
	templates:'./src/templates/',
	zips:'build/zips/'
}

const inliner = emailBuilder({ encodeSpecialChars: true, juice: {preserveImportant: true, applyWidthAttributes:false} }),
	srcFolders = util.getFolders(dir.emails);

let	useCdnImgPath = true;  // Use relative paths or CDN paths set inside the config

const serverPath = (scope=this) => (useCdnImgPath && scope.image_path) ? scope.image_path : 'images/';

// const checkHex = (color) => (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color)) ? color : false; //	Validate Hex Number

// const pxToPts = num => Math.round(num * 0.75);
/*const pxToPts = function(num){
	return Math.round(num * 0.75);
}*/

function buildEmail(useCdn=false){

	useCdnImgPath = useCdn;
	// console.log(`useCdnImgPath? `,useCdnImgPath);

	let task = srcFolders.map(function(folder) {
		let _src = path.join(dir.emails, folder),
				_dist = util.mkDirByPathSync(path.join(dir.dist, folder)),//Path to final production files
				_content = JSON.parse(fs.readFileSync(dir.content)),
				_name = path.basename(folder),
				_data = _content['Emails'][_name],
				_template = dir.templates+'main.html.hbs';

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
				pxToPts: 					eh.pxToPts,
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
}

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

function buildTxt(){
	let task = srcFolders.map(function(folder) {
		let _src = path.join(dir.emails, folder),
				_dist = path.join(dir.dist, folder),
				_content = JSON.parse(fs.readFileSync(dir.content)),
				_name = path.basename(folder),
				_data = _content['Emails'][_name],
				_template = dir.templates+'main.txt.hbs';

		_data['global'] = _content['global'];

		let hbsOptions = {	
			ignorePartials:false,
			batch:[_src, dir.txt, dir.templates],
			helpers : {
				getName : function(arg){ return arg },
				formatTxt : tf.formatTxt
			}
		}
		
		return gulp.src(_template)
				.pipe(gch(_data, hbsOptions))
				.pipe(rename(_name+'.txt'))
				.pipe(gulp.dest(_dist));
	});
	let lastStream = task[task.length-1];
	return lastStream;
};

function zipFiles() {

	let task = srcFolders.map(function(folder) {	
		const _src = path.join(dir.emails, folder),
			_dist = path.join(dir.dist, folder),
			_name = path.basename(folder);

		// Zip up HTML and images
		const _html = gulp.src(_dist+'/index.html').pipe(rename(_name+'.html'));

		const _images = gulp.src(_dist+'/images/**/*', {base:_dist});

		const _txt = gulp.src(_dist+'/*.txt');

		return merge( _html, _images, _txt)
			.pipe(zip(_name+'.zip'))
			.pipe(gulp.dest(dir.zips));

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
// gulp.task('build', buildEmail);
gulp.task('build:test', () => { return buildEmail(true)});// Run build and force to use cdn image path
gulp.task('build:final', () => { return buildEmail(false)});// Run build and force to use relative image path
gulp.task('build:txt', buildTxt);
gulp.task('build:css', compileCss); 
gulp.task('img', optimizeImages); 
gulp.task('clean:css', () => { return del(dir.cssToLine+'/*.css') });
gulp.task('clean:html', () => { return del(dir.dist+'**/*'); });
gulp.task('clean:zips', () => { return del(dir.zips+'**/*'); });
gulp.task('clean', () => { return gulp.parallel('clean:zips', 'clean:html')});
//gulp.task('default', gulp.series('build:txt'));
gulp.task('default', gulp.series('clean:css','build:css', 'build:test'));
gulp.task('all', gulp.series('clean:css','build:css', 'build:final', 'img', 'build:txt'));
gulp.task('watch', () => { gulp.watch([ dir.emails+'**/**.hbs', dir.templates+'**/**.hbs', './lib/**', dir.content], gulp.series('default')) });
gulp.task('preview', previewCatConfig);
gulp.task('zip', gulp.series('clean:css','build:css', 'build:final', 'img', 'build:txt', zipFiles));
