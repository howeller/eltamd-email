/*
	@version: 1.0.1
	@author: 	howeller, eric@howellstudio.com
	@desc: 		Handlebars.js helper function to format .txt email files
	@usage:
		* Register the helper 
			const tf = require ('./txtFormatting');
			helpers : { formatTxt : tf.formatTxt }

		* Inside txt handlebars file
			{{formatTxt my_imported_text}}
*/

const formatTxt = function(data){

	if(Array.isArray(data)){
		let _array = data.map(function(str){
			// Apply TXT formatting to each line in the array
			return applyAllFormats(str);
		});
		// Join the new array together with an extra line break
		return _array.join('\n');
	}
	else if(isString(data)){
		// For single strings
			return applyAllFormats(data);
	}
}
module.exports = {
	formatTxt:formatTxt
}

const charMap ={
	'&nbsp;': ' ',
	'&amp;'	: '&',
	'<br>'	: ' ',
	'<br/>'	: ' ',
	'’'			: "'",
	'“'			: '"',
	'”'			: '"',
	'&reg;'	: '(R)',
	'&copy;': '(C)'
}

function applyAllFormats(str){
	str = charReplace(str); 		// Replace special characters
	str = strippedString(str);	// Strip out HTML tags
	str = wordWrap(str); 				// Insert line breaks for wordWrapping
	return str;
}
// Strip HTML Tags from string
const strippedString = (str) => str.replace(/(<([^>]+)>)/ig,'');

function isString(obj) { return typeof obj === 'string'; }

function charReplace(str){
	var regex = new RegExp( Object.keys(charMap).join('|'), 'g');
	return str.replace(regex,function(match) { return charMap[match]; })
}

// Adds a line break at defined column of a string.
function wordWrap(str, width=66, prefix='', postfix='\n') {
	// console.log(str+'\n');
	if (str.length > width) {
		let p = width;
		for (; p > 0 && !/\s/.test(str[p]); p--) {}
		if (p > 0) {
			let left = str.substring(0, p);
			let right = str.substring(p + 1);
			return prefix + left + postfix + wordWrap(right, width, prefix, postfix);
		}
	}
	return prefix + str + postfix;
}
