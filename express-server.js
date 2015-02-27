require('newrelic');
var app = require('express')(),
  port = process.argv[2],
  prefix = process.argv[3],
  phantom = require('phantom'),
  noCache = '--disk-cache=no',
  noSSL = '--ignore-ssl-errors=true',
  noImages = '--load-images=false',
  allowRemote = '--local-to-remote-url-access=yes',
  REGEX = /_escaped_fragment_=([^&]+)/,
  portCounter = 12300;

var parse_qs = function(s) {
  var fragment = s.match(REGEX);
  if (fragment.length > 1) {
    return fragment[1];
  }

};

var renderHtml = function(url, cb) {
  portCounter += 1;

  console.log('PhantomJS query: ' + url + ' using port ' + portCounter + '.');

  phantom.create(noCache, noSSL, noImages, allowRemote, {port: portCounter}, function (ph) {
    ph.createPage(function (page) {

      page.set('onLoadFinished', function() {
        page.get('content', function (content) {
          cb(content);
          page.release();
          page.close();
          page = null;
          if (portCounter > 13300) {
            portCounter = 12300;
          }


        });

      });

//      page.onConsoleMessage = function(msg, lineNum, sourceId) {
//          console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
//      };
//      page.onResourceReceived = function(response) {
//        console.log('Response (#' + response.id + ', stage "' + response.stage + '"): ' + JSON.stringify(response));
//      };

      page.set('onInitialized', function() {
        page.evaluate(function() {
          setTimeout(function() {
            window.callPhantom();
          }, 10000);
        });
      });

      page.open(url);
    })
  });



};

app.get('/', function (req, res) {
  var route = parse_qs(req.url),
    callback = function (html) {
      res.send(html);
    },
    url = prefix
      + req.url.slice(1, req.url.indexOf('?'))
      + '?phantomjs=true'
      + '#!' + decodeURIComponent(route);

  renderHtml(url, callback);

});

app.listen(port);


console.log('Listening on ' + port + '...');
console.log('Press Ctrl+C to stop.');
