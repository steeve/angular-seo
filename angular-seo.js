!function(window, document, undefined) {
    var getModule = function(angular) {
        return angular.module('seo', [])
            .run([
                '$rootScope',
                function($rootScope) {
                    $rootScope.htmlReady = function() {
                        $rootScope.$evalAsync(function() { // fire after $digest
                            setTimeout(function() { // fire after DOM rendering
                                if (typeof window.callPhantom == 'function') {
                                    window.callPhantom();
                                }
                            }, 0);
                        });
                    };
                }
            ])
            .factory('SEOControllerInterceptor', [
                '$controller', '$q',
                function ($controller, $q) {
                    return {
                        intercept: function(controllerName, scope, isAsyncDataController) {
                            $q(function(resolve) {
                                scope.resolveAllData = resolve;
                                $controller(controllerName, {$scope: scope});
                                if(angular.isUndefined(isAsyncDataController) || !isAsyncDataController) {
                                    scope.resolveAllData();
                                }
                            }).then(function() {
                                scope.htmlReady();
                            });
                        }
                    }
                }
            ]);
    };
    if (typeof define == 'function' && define.amd)
        define(['angular'], getModule);
    else
        getModule(angular);
}(window, document);