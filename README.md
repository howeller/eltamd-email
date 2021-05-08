<img src="preview/assets/images/header_logo_2x.png" alt="" width="70"/> **EltaMD Emails**

[JIRA >>](https://hogarthdigital.atlassian.net/browse/CTUS-230) | 
[Preview Site >>](https://www.campaign.hogarthww.digital/ctus-colgate/colgate-h207077/preview/categories/eng/index.html)

---
### Local Build Notes

- All HTML use handlebars templates as modules and compiled via [gulp-compile-handlebars](https://www.npmjs.com/package/gulp-compile-handlebars)
- All CSS is inlined using via [gulp-email-builder-min](https://www.npmjs.com/package/gulp-email-builder-min)
- To run the gulp tasks run `npm install` from the command line to install `node_modules` (not included in this repo)
- The email templates are separated into modules so you can reuse/reorder different content blocks in each individual email. These are located inside `src/templates/modules/`.
- The email content and module order lives in `src/content.json`.
- For each html module in `src/templates/modules/` you should create a txt template and place inside `src/templates/txt/`.
- Images that are used in all emails are placed inside `src/shared_images/`.

---
### Gulp Tasks

Task Name     | What it Does
--------------|-----------
`build:test`  | Compiles the `main.html` handlebar template & modules into HTML and inlines the CSS. Uses CDN image paths if available.
`build:final` | Compiles the `main.html` handlebar template & modules into HTML and inlines the CSS. Uses relative image paths.
`build:css`   | Compiles all CSS handlebars `templates/css/`.
`build:txt`   | Compiles the `main.txt` handlebar template into backup TXT file.
`clean:css`   | Deletes everything inside `src/css/`.
`clean:html`  | Deletes everything inside `build/emails/`.
`clean:zips`  | Deletes everything inside `build/zips/`.
`clean`       | Runs  `clean:html` and `clean:zips` tasks.
`img`         | Compresses all pngs and copies all local images files into `build`.
`default`     | Runs `clean:css`, `build:css`, and then `build:test` tasks in a series.
`all`         | Runs `clean:css`,`build:css`, `build:final`, `img` tasks.
`preview`     | creates contentData.js for preview site.
`watch`       | Automatically runs the `default` task when changes to source files.
`zip`         | Runs the `all` tasks and then creates zip file for each email.

### Project Tree
```
├── README.md
├── build
│   ├── emails
│   └── zips
├── gulpfile.js
├── lib
├── node_modules
├── package-lock.json
├── package.json
├── PSD
├── preview
└── src
    ├── content.json
    ├── emails
    │   └── Elta_SCA_Email
    ├── shared_images
    └── templates
        ├── css
        ├── cssCache
        ├── js
        ├── main.html.hbs
        ├── main.txt.hbs
        ├── modules
        └── txt
```