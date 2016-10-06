(function() {
  'use strict';
  angular.module('app')
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $routeProvider
      .when("/", {
        templateUrl: "/partials/main.html",
        controller: "Main",
        controllerAs: "main"
      })
      .when("/getpreview", {
        templateUrl: "/partials/preview.html",
        controller: "Preview",
        controllerAs: "preview"
      })
      .when("/oldmain", {
        templateUrl: "/partials/old_main.html",
        controller: "Main",
        controllerAs: "main"
      })
      .otherwise({
        redirectTo: '/'
      });


    $locationProvider.html5Mode(true).hashPrefix('!');
  }]);
}());
