Angular-SEO
-----------

SEO for AngularJS apps made easy. Based on [PhantomJS](http://phantomjs.org/) and [yearofmoo's article](http://www.yearofmoo.com/2012/11/angularjs-and-seo.html).


Requirements
============

You will need [PhantomJS](http://phantomjs.org/) to make this work, as it will render the application to HTML.


How to use
==========

The solution is made of 3 parts:
- small modification of your static HTML file
- an AngularJS module, that you have to include and call
- PhantomJS script


Modifying your static HTML
==========================

Just add this to your `<head>` to enable AJAX indexing by the crawlers.
```
    <meta name="fragment" content="!" />
```

AngularJS Module
================

Just include `angular-seo.js` and then add the `seo` module to you app:
```
angular.module('app', ['ng', 'seo']);
```

If you are using [RequireJS](http://requirejs.org/), the script will detect it and auto define itself *BUT* you will need to have an `angular` shim defined, as `angular-seo` requires it:
```
requirejs.config({
    paths: {
        angular: 'http://cdnjs.cloudflare.com/ajax/libs/angular.js/1.0.3/angular.min',
    },
    shim: {
        angular: {
            exports: 'angular'
        }
    }
});
```

Then you must call `$scope.htmlReady()` when you think the page is complete. This is nescessary because of the async nature of AngularJS (such as with AJAX calls).
```
function MyCtrl($scope) {
    Items.query({}, function(items) {
        $scope.items = items;
        $scope.htmlReady();
    });
}
```

And that's all there is to do on the app side.


PhantomJS Module
================

For the app to be properly rendered, you will need to run the `angular-seo-server.js` with PhantomJS.
Make sure to disable caching:
```
$ phantomjs --disk-cache=no angular-seo-server.js [port] [URL prefix]
```

`URL prefix` is the URL that will be prepended to the path the crawlers will try to get.

Some examples:
```
$ phantomjs --disk-cache=no angular-seo-server.js 8888 http://localhost:8000/myapp
$ phantomjs --disk-cache=no angular-seo-server.js 8888 file:///path/to/index.html
```


Testing the setup
=================

Google and Bing replace `#!` (hashbang) with `?_escaped_fragment_=` so `htttp://localhost/app.html#!/route` becomes `htttp://localhost/app.html?_escaped_fragment_=/route`.

So say you app is running on `http://localhost:8000/index.html` (works with `file://` URLs too).
First, run PhantomJS:
```
$ phantomjs --disk-cache=no angular-seo-server.js 8888 http://localhost:8000/index.html
Listening on 8888...
Press Ctrl+C to stop.
```

Then try with cURL:
```
$ curl 'http://localhost:8888/?_escaped_fragment_=/route'
```

You should then have a complete, rendered HTML output.


Running in behind Nginx (or other)
==================================

If course you don't want regular users to see this, only crawlers.
To detect that, just look for an `_escaped_fragment_` in the query args.

For instance with Nginx:
```
if ($args ~ _escaped_fragment_) {
    # Proxy to PhantomJS instance here
}
```

Running using Node and Express
==============================

Running PhantomJS jobs as a daemon on the server can be very tricky. One solution is to wrap PhantomJS in a regular Node server. The Node server can be run as a daemon using [forever](https://github.com/nodejitsu/forever)

To use Express, first ```npm install``` to retrieve all Node dependencies. Next run something like ```node express-server.js 8888 http://myserver.com/``` or ```forever start express-server.js 8888 http://myserver.com/```

The Express server behaves very similarly to angular-seo-server.js; however, it does not at this time take any options as arguments. All PhantomJS options are hardcoded.

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/3a55c16a191c4c8222beddcf429c2608 "githalytics.com")](http://githalytics.com/steeve/angular-seo)

