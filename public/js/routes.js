(function() {
  'use strict';
  angular.module('app')
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $routeProvider
      .when("/", {
        templateUrl: "/partials/landing.html",
        controller: "Main",
        controllerAs: "main"
      })
      .when("/avatarbuilder", {
        templateUrl: "/partials/main.html",
        controller: "Main",
        controllerAs: "main"
      })
      .when("/previewfamily", {
        templateUrl: "/partials/pfpreview_1.html",
        controller: "Preview",
        controllerAs: "preview"
      })
      .when("/previewbook", {
        templateUrl: "/partials/pfpreview_2.html",
        controller: "Preview",
        controllerAs: "preview"
      })
      .when("/dedication", {
        templateUrl: "/partials/pfpreview_3.html",
        controller: "Preview",
        controllerAs: "preview"
      })
      .when("/oldmain", {
        templateUrl: "/partials/old_main.html",
        controller: "Main",
        controllerAs: "main"
      })
      .when("/getpreview", {
        templateUrl: "/partials/preview.html",
        controller: "Preview",
        controllerAs: "preview"        
      })
      .otherwise({
        redirectTo: '/'
      });


    $locationProvider.html5Mode(true).hashPrefix('!');
  }]);
}());
