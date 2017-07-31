var modules_obj = require('./modules.js');
var modules = modules_obj.modules;
var argv = require('minimist')(process.argv.slice(2));

if (!String.prototype.splice) {
    String.prototype.splice = function (start, delCount, newSubStr) {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
    };
}

exports.init = function (code) {
    var scriptFiles = ['anychart-bundle.min.js', 'anychart.min.js', 'anystock.min.js', 'anymap.min.js', 'anygantt.min.js'];
    var acBase = !argv.l ? '<script src="https://cdn.anychart.com/js/_AC-VERSION_/anychart-base.min.js"></script>' :
        '<script src="_LOCAL-PATH_/anychart-base.min.js"></script>';
    var version = '8.0.0';
    var acModules = [];
    var module;
    var localPath;

    /*get modules list from code*/
    for (var i = 0; i < modules.length; i++) {
        for (var j = 0; j < modules[i].keys.length; j++) {
            if (~code.indexOf(modules[i].keys[j])) {
                for (var k = 0; k < modules[i].module.length; k++) {
                    module = !argv.l ? '\n\t<script src="https://cdn.anychart.com/js/_AC-VERSION_/' + modules[i].module[k] + '.min.js"></script>' :
                    '\n\t<script src="_LOCAL-PATH_/' + modules[i].module[k] + '.min.js"></script>';
                    acModules.push(module);
                }
                break;
            }
        }
    }
    /**/

    /*replace ac-script to ac-base*/
    for (i = 0; i < scriptFiles.length; i++) {
        if (~code.indexOf(scriptFiles[i])) {
            var pos = code.indexOf(scriptFiles[i]);
            var scriptToReplace = code.slice(code.lastIndexOf('<script', pos), code.indexOf('</script>', pos) + '</script>'.length);

            localPath = scriptToReplace.substring(scriptToReplace.lastIndexOf('src=', scriptToReplace.indexOf(scriptFiles[i])) + 'src='.length + 1, scriptToReplace.indexOf(scriptFiles[i]));
            code = code.replace(scriptToReplace, acBase);
            break;
        }
    }
    /**/

    if (pos) {
        /*remove old js files*/
        scriptFiles.push('data-adapter.min.js','anychart-ui.min.js');
        for (i = 0; i < scriptFiles.length; i++) {
            if (~code.indexOf(scriptFiles[i])) {
                scriptToReplace = code.slice(code.lastIndexOf('<script', code.indexOf(scriptFiles[i])), code.indexOf('</script>', code.indexOf(scriptFiles[i])) + '</script>'.length);
                code = code.replace(scriptToReplace, '');
            }
        }
        /**/

        /*add modules*/
        var insertPosition = code.indexOf('</script>', code.indexOf('anychart-base.min.js')) + '</script>'.length;
        code = code.splice(insertPosition, 0, acModules.join('')).replace(/_AC-VERSION_/g, version);
        /**/

        /*replace path*/
        var pathToJs = argv.l === 'true' ? true : argv.l === 'false' ? false : argv.l;
        if (pathToJs) {
            code = code.replace(/_LOCAL-PATH_\//g, typeof pathToJs === 'boolean' ? localPath : pathToJs);
        }
        /**/
    }

    return code
};

