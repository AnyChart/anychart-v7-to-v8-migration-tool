#!/usr/bin/env node

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
var migrate = require('./src/migration').migrate;
var program = require('commander');
var argv = require('minimist')(process.argv.slice(2));
var optionsMap = require('./src/options-map').options;

program.option('-p, --port <number>', 'server port')
    .option('-t, --tag-manager', 'add google tag manager to page');

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp()
} else {
    init();
}

function init() {
    var app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    app.get('/', function (req, res) {
        var normalPath = path.normalize(__dirname + '/index.html');

        // html content
        var content = fs.readFileSync(normalPath, 'utf-8');

        // add tag manager
        if (argv.t) {
            content = addTagManager(content);
        }

        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(content);
        res.end();
    });

    app.post('/migrate', function (req, res) {
        var code;
        
        for (option in optionsMap) {
            if (optionsMap.hasOwnProperty(option)) {
                if (req.body[option]) {
                    addProcessArgv(option);
                } else if (option === 'path' || option === 'replacer' || option === 'bundle') {
                    removeProcessArgv(option);
                }
            }
        }

        try {
            code = migrate(req.body.code);
        } catch (err) {
            code = {};
            code.code = req.body.code;
            code.error = true;
        }

        // response
        res.send(code);

        function addProcessArgv(opt) {
            if (!~process.argv.indexOf(optionsMap[opt])) {
                process.argv.push(optionsMap[opt], req.body[opt]);
            } else {
                process.argv[process.argv.indexOf(optionsMap[opt]) + 1] = req.body[opt];
            }
        }

        function removeProcessArgv(opt) {
            var pos = process.argv.indexOf(optionsMap[opt]);

            if (~pos) {
                process.argv.splice(pos, 2);
            }
        }
    });

    app.listen(argv.p, function () {
        console.log('Start server on port: ' + argv.p);
    });
}

function addTagManager(code) {
    var tagManager = "<script>(function (w, d, s, l, i) {w[l] = w[l] || [];w[l].push({'gtm.start': new Date().getTime(), event: 'gtm.js'});var f = d.getElementsByTagName(s)[0],j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';j.async = true;j.src ='https://www.googletagmanager.com/gtm.js?id=' + i + dl;f.parentNode.insertBefore(j, f);})(window, document, 'script', 'dataLayer', 'GTM-5B8NXZ');</script>"
    var _tagManager = '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5B8NXZ"  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>';

    code = code.replace('</head>', tagManager + '</head>');
    code = code.replace('<body>', '<body>' + _tagManager);

    return code
}
