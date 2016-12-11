/*global angular, $*/
(function(){
  "use strict";
  angular.module("app").controller("login", ['$http', Login]);

  function Login($http) {
    var vm = this;

    $http({
      method: 'GET',
      url: '/getCurrentProfile'
    }).then(function success(data){
      vm.currentUserProfile = data.data;
    });
  }
})();