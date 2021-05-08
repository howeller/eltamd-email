/*
	@version: 1.0.0
	@author: 	howeller, eric@howellstudio.com
	@desc: 		Handlebar helpers for html emails.
	@usage: 	
		
*/

/*
	Convert pixel number to pts for Windows Outlook VML properties
*/
const pxToPts = num => Math.round(num * 0.75);

module.exports = { pxToPts }