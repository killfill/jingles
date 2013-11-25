# Jingles

This is the Web Control Panel of [FiFo](http://project-fifo.net/).


## Usage

Jingles is a 'one page web site', wich interacts with wiggle and howl backends.

You can run jingles on your notebook. To do this, please install the deps first:

    npm install
    bower install

Then, you can run it in 2 ways:

### Standalone mode

You can hack and fix jingles right on your computer, without even having a fifo backend available anywhere. Just run this:

    grunt server

It will generate some mockups for you.

### Proxy mode

You connect with a fifo backend, to wiggle and howl. Run the server like this:
 
    grunt server --proxy=fifo_backend


This way, jingles will try to use the backend at hostname or IP `fifo_backend`.


Tips
----

* `grunt --help`

* Run grunt bower-install after adding a new bower dependency.

* grunt-faker bug: https://github.com/chrisocast/grunt-faker/commit/1544e883016b62258f7f3ecf35cefdd920e52bc7#commitcomment-4144547

* Create new angular artifacts:
  
        yo angular:route name
        yo angular:controller name
        yo angular:view name

* How to **customize the colors** or the look
  - Change app/styles/styles.less
  - grunt server will generate main.css file automatically

## Add or complete a language translation
  - Extract the text from html to the catalog template (po/extracted.pot): grunt nggettext_extract
  - Open po/language.po in poEdit or create an new base from the extracted.pot (Menu->File->new catalog from pot)
    Use the 2 letters code for the language definition (file name + 'Language' property on the po file)
  - Menu -> Catalog -> Update from POT file
  - Have fun translating!
  - Save
  - Generate javascript translation file (app/scripts/lang.js): grunt nggettext_compile
  - Tip: uncomment app.js: gettextCatalog.debug = true; :P