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

Then you must call `$scope.htmlReady()` when you think the page is complete. This is necessary because of the async nature of AngularJS (such as with AJAX calls).
```
function MyCtrl($scope) {
    Items.query({}, function(items) {
        $scope.items = items;
        $scope.htmlReady();
    });
}
```

##Using the SEOControllerInterceptor Service
If you are using the built-in $routeProvider in your app, or understand your custom router well enough, then you can also add some *magic* to your controllers so that you don't have to add ```$scope.htmlReady()``` to each one.
This service will wrap your controller creation and provide a way for ```$scope.htmlReady()``` to be called once the controller is constructed. It also provides a mechanism for allowing controllers that perform asynchronous data requests during construction to notify the service through a $q:resolve function call on its ```$scope```.

###Changes to $routeProvider controller definition
Standard Implementation

```
$routeProvider
    .when('/', {
        templateUrl: 'main.html',
        controller: 'MainController'
    })
    .when('/secondary', {
        templateUrl: 'secondary.html',
        controller: 'SecondaryController'
    })
    .otherwise({
        redirectTo: '/'
    });
```

SEOControllerInterceptor Service Implementation

```
$routeProvider
    .when('/', {
        templateUrl: 'main.html',
        controller: ['$scope', 'SEOControllerInterceptor', function($scope, SEOControllerInterceptor) {
            SEOControllerInterceptor.intercept('MainController', $scope); // The 3rd parameter can be ignored or set to false when the controller does not perform any asynchronous data initializations during construction
        }]
    })
    .when('/secondary', {
        templateUrl: 'secondary.html',
        controller: ['$scope', 'SEOControllerInterceptor', function($scope, SEOControllerInterceptor) {
            SEOControllerInterceptor.intercept('SecondaryController', $scope, true); // The 3rd parameter is set to true when the controller performs asynchronous data initialization during construction
        }]
    })
    .otherwise({
        redirectTo: '/'
    });
```

###Additional code within the controller
Within the service it will wrap the controller construction call in a ```$q``` promise. The resolve function is attached to the ```$scope``` that is passed in to newly created controller. If the controller performs any asynchronous data calls to initialize data then it will also need to call ```$scope.resolveAllData()``` once all of the data has been received. If the controller does not perform any asynchronous data calls and a falsy value was passed into the service, then the promise will be resolved immediately after the controller's constructor returns.
Once the ```$q``` promise resolves then ```$scope.htmlReady()``` is called by the service, alleviating your need to add a call to ```$scope.htmlReady()``` to all of your controllers.



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

Google and Bing replace `#!` (hashbang) with `?_escaped_fragment_=` so `http://localhost/app.html#!/route` becomes `http://localhost/app.html?_escaped_fragment_=/route`.

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

Of course you don't want regular users to see this, only crawlers.
To detect that, just look for an `_escaped_fragment_` in the query args.

For instance with Nginx:
```
if ($args ~ _escaped_fragment_) {
    # Proxy to PhantomJS instance here
}
```
[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/3a55c16a191c4c8222beddcf429c2608 "githalytics.com")](http://githalytics.com/steeve/angular-seo)