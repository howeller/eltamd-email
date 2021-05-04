## EltaMD Emails

JIRA: https://hogarthdigital.atlassian.net/browse/CTUS-230

Preview: https://www.campaign.hogarthww.digital/ctus-colgate/colgate-h207077/preview/categories/eng/index.html

---
### Local Build Notes

- All HTML use handlebars templates as modules and compiled via [gulp-compile-handlebars](https://www.npmjs.com/package/gulp-compile-handlebars)
- All CSS is inlined using via [gulp-email-builder-min](https://www.npmjs.com/package/gulp-email-builder-min)
- To run the gulp tasks run `npm install` from the command line to install `node_modules` (not included in this repo)
- The email content lives in `src/content.json`.

---
### Gulp Tasks

Task Name    | What it Does
-------------|-----------
`build` 			| Compiles the handlebar templates into HTML and inlines the CSS.
`css` 				| Compiles all CSS handlebars `templates/css/`.
`clean:css` 	| Deletes everything inside `src/css/`.
`clean:html` 	| Deletes everything inside `build/emails/`.
`clean:zips` 	| Deletes everything inside `build/zips/`.
`clean`		 		| Runs  `clean:html` and `clean:zips` tasks.
`img`			 		| Compresses all pngs and copies all images files into `build`.
`default` 		| Runs `cleanCss`, `css`, and then `build` tasks in a series.
`all`					| Runs `clean:css`,`css`, `build`, `img` tasks.
`preview` 		| creates contentData.js for preview site.
`watch` 			| Automatically runs the `default` task when changes to source files.
`zip` 				| Runs the default task and then creates zip file for each email.

