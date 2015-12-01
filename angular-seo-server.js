var system = require('system');

if (system.args.length < 3) {
    console.log("Missing arguments.");
    phantom.exit();
}

var server = require('webserver').create();
var port = parseInt(system.args[1]);
var urlPrefix = system.args[2];

function queryStringToMap(queryString) {
    if (!queryString) { return ''; }

    return queryString.split('&').reduce(function(memo, fragment) {
         var preKey = fragment.split('=')[0];
         var preVal = fragment.split('=')[1];
         var key = preKey.replace('?', '');
         var val = preVal.replace('\/', '');

         memo[key] = val;
         return memo;
    }, {});
}

var renderHtml = function(url, cb) {
    var page = require('webpage').create();
    page.settings.loadImages = false;
    page.settings.localToRemoteUrlAccessEnabled = true;
    page.onCallback = function() {
        cb(page.content);
        page.close();
    };
//    page.onConsoleMessage = function(msg, lineNum, sourceId) {
//        console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
//    };
    page.onInitialized = function() {
       page.evaluate(function() {
            setTimeout(function() {
                window.callPhantom();
            }, 10000);
        });
    };
    page.open(url);
};

server.listen(port, function (request, response) {
    var qLoc = request.url.indexOf('?');
    var query = qLoc !== -1 ?
      request.url.slice(qLoc, request.url.length) :
      '';

    var preQuery = request.url.slice(0, qLoc);
    var route = queryStringToMap(query);
    var fragment = route._escaped_fragment_ || '';
    var url = urlPrefix + preQuery + fragment;

    renderHtml(url, function(html) {
        response.statusCode = 200;
        response.write(html);
        response.close();
    });
});

console.log('Listening on ' + port + '...');
console.log('Press Ctrl+C to stop.');
