/*
	@version: 1.0.0
	@author: 	howeller, eric@howellstudio.com
	@desc: 		Handlebar helpers for html emails.
	@usage: 	pxToPts: style="width:{{pxToPts 600}}pt;"
*/

/*
	Convert pixel number to pts for Windows Outlook VML properties
*/
const pxToPts = num => Math.round(num * 0.75);

module.exports = { pxToPts }