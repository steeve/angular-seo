var system = require('system');
var util = require('./util.js');

if (system.args.length < 1) {
  console.log("Missing arguments.");
  phantom.exit();
}

var server = require('webserver').create();
var port = parseInt(system.args[1]);

var renderHtml = function(url, callback) {
  var page = require('webpage').create();
  page.settings.loadImages = false;
  page.settings.localToRemoteUrlAccessEnabled = true;

  page.onConsoleMessage = function(msg) {
    console.log(msg);
  };

  page.onCallback = function(data) {
    callback(page.content);
    page.close();
  };

  page.onLoadFinished = function(status) {
    page.evaluate(function() {
      window.callPhantom();
    });
  };
  page.open(url);
};

server.listen(port, function (request, response) {
  var url = util.getUrl(request);

  renderHtml(url, function(html) {
    html = util.removeScriptTags(html);

    response.statusCode = 200;
    response.write(html);
    response.close();
  });
});

console.log('Listening on ' + port + '...');
console.log('Press Ctrl+C to stop.');
