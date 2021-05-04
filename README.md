## EltaMD Emails

JIRA: https://hogarthdigital.atlassian.net/browse/CTUS-000

Preview: https://www.campaign.hogarthww.digital/ctus-colgate/h207077/preview/categories/eng/
```
u: ctus-colgate
pw: VhiYtrba3D4+Fx3dTMFZFA==
```
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
`build` 		| Compiles the handlebar templates into HTML and inlines the CSS.
`cleanCss` 	| Deletes everything inside `src/css/`
`css` 			| Compiles all CSS handlebars templates/
`default` 	| Runs `cleanCss`, `css`, and then `build` tasks in a series.
`preview` 	| creates contentData.js for preview site.
`watch` 		| Automatically runs the `default` task when changes to source files.
`zip` 			| Runs the default task and then creates zip file for each email.
