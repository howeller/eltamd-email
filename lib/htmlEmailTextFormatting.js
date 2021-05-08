/*
	@version: 2.1.0
	@author: 	howeller, eric@howellstudio.com
	@desc: 		Methods to format text blocks in html emails.
	@usage: 	
		
*/
const stripHtml = require("string-strip-html");
const { removeWidows } = require("string-remove-widows");

/*
	Replace last space in string with non-breakable-space for single sentence
*/
const formatLine = str => replaceLastSpace(str);

/*
	Replace all spaces in CTA copy with non-breakable spaces
*/
const formatCtaTxt = str => replaceAllSpace(str);

/*
	Replace last space of each paragraph with &nbsp; & inject break tags
*/
const formatParagraph = function(array){
	let newArray = array.map(_line => replaceLastSpace3(_line));
	return newArray.join('<br/><br/>\n');// return array as single string separated with break tags
}
// TEMP FUNCTION until we sort out the conflict with replaceLastSpace & when tags are used with last word. 
const formatParagraphWithTags = function(array){
//	let newArray = array.map(_line => _line);
	let newArray = array.map(_line => replaceLastSpace3(_line));
	return newArray.join('<br/><br/>\n');// return array as single string separated with break tags
}

/*
	Replace last space of each paragraph with &nbsp; & inject single break tag
*/
const formatList = function(array){
	let newArray = array.map(_lines => replaceLastSpace(_lines));
	return newArray.join('<br/>\n');// return array as single string separated with single break tag
}
/*
	Replace last space in string with non-breakable-space
*/
function replaceLastSpace4(str){
	const tagRanges = stripHtml(str, { returnRangesOnly: true });// array where HTML tags are located
	// console.log(tagRanges);
	let noWidowsStr = removeWidows(str, {tagRanges}).res;
	// console.log(noWidowsStr);
	return noWidowsStr;
}
function replaceLastSpace3(str){
	let noWidowsStr = removeWidows(str, {targetLanguage: "html", ignore: [
			{heads:"<span ", tails: ">"},
			// {heads:" target", tails: ">"},
			{heads:" href", tails: ">"}
		] }).res;
	// console.log(noWidowsStr);
	return noWidowsStr;
}
function replaceLastSpace(str){
	let lastIndex = str.lastIndexOf(' ');
	return str.substr(0, lastIndex) + '&nbsp;' + str.substr(lastIndex + 1);
}
function replaceLastSpace2(str){
	let noWidowsStr = str.replace(/\s+([^\s]+)\s*$/, '\xA0' + '$1');
	console.log(noWidowsStr);
	return noWidowsStr;
	/*let tagsRegEx = /<[^>]*>/,
			textNoTags = str.split(tagsRegEx).join(),
			lastIndex = textNoTags.lastIndexOf(' ');

	let result = str.matchAll(tagsRegEx) || [];

	console.log(result);*/

	// console.log(textNoTags.substr(0, lastIndex) + '&nbsp;' + textNoTags.substr(lastIndex + 1));

	/*let lastIndex = str.lastIndexOf(' ');	//string.lastIndexOf(searchvalue, start) 
	// THIS FINDS ALL SPACES OUTSIDE <TAGS> AND REPLACES... NEED TO UPDATE TO ONLY REPLACE LAST SPACE
	let result = str.replace(/(<[^>]*>)| /gi, function (_,g1) {
    return (g1==undefined)? '&nbsp;':g1;
	});
	return result;
	let lastIndex = str.lastIndexOf(' ');	//string.lastIndexOf(searchvalue, start) 
	str = str.substr(0, lastIndex) + '&nbsp;' + str.substr(lastIndex + 1);*/
	return str;
}

/*
	Replace all spaces in string with non-breakable-space
*/
function replaceAllSpace(str){
	str = str.replace(/\s/g, "&nbsp;");
	return str;
}

module.exports = { formatLine, formatCtaTxt, formatList, formatParagraph, formatParagraphWithTags, replaceLastSpace, replaceAllSpace};
