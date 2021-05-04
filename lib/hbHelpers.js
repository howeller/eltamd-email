/*
	@version: 0.0.0
	@author: 	howeller, eric@howellstudio.com
	@desc: 		Helpful Handlebars helpers
	@usage: 	
*/

exports.if_eq = if_eq;
exports.propCheck = propCheck;

/*
	Check to see if obj property matches a value
*/
function if_eq(a, b, opts){
	if (a == b) {
		return opts.fn(this);
	} else {
		return opts.inverse(this);
	}
}
/*
	Check to see if a property exists in json object
*/
function propCheck(obj, prop){
	// console.log('propCheck : '+obj._name+' ? '+obj[prop]);
	return (obj[prop]) ? true:false;
}
