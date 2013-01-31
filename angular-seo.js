!function(window, document, undefined) {
    var getModule = function(angular) {
        return angular.module('seo', [])
            .run(function($rootScope) {
                $rootScope.htmlReady = function() {
                    $rootScope.$evalAsync(function() { // fire after $digest
                        setTimeout(function() { // fire after DOM rendering
                            var evt = document.createEvent('Event');
                            evt.initEvent('__htmlReady__', true, true);
                            document.dispatchEvent(evt);
                        }, 0);
                    });
                };
            });
    };
    if (typeof define == 'function' && define.amd)
        define(['angular'], getModule);
    else
        getModule(angular);
}(window, document);
