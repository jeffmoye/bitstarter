#!/usr/bin/env node
/*
Automatically grade files for the presence of secified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://githib.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if (!isUrl(instr)) { //not url
      if (!fs.existsSync(instr)) { 
        //file does not exist locally
        console.log("%s does not exist. Exiting.", instr);
  	process.exit(1); //http://nodejs.org/api/process.html#process_process_exit_code
      }
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    if (isUrl(htmlfile)) {
      return getUrlFile(htmlfile);
    } else {
      return cheerio.load(fs.readFileSync(htmlfile));
    }
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var isUrl = function(url) {
    if (url.substr(0,6) == 'http://' || url.substr(0,7) == 'https://') {
       //filename is a http url, so assume it exists
       return true;
    };
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var getUrlFile = function(url) {
    //gets the file pointed to by a url using http
    rest.get(url).on('complete', function(result) {
      if (result instanceof Error) {
        console.log('Error getting web file:', result.message);
        this.retyr(5000); // try again in 5 seconds
      } else {
        return(result);
      }
    });
};

if(require.main == module) { //only run if invoked from command line
    program
      .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
      .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
      .parse(process.argv);
    var checkJson = checkHtmlFile(program.file, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}

