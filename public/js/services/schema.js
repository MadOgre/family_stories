(function(){
	"use strict";
	angular.module("app")
	.factory("schema", ["$http", "$q", function($http, $q){
		var bodyPartUrls = {
	      adult: {
	        male: '/getAdultMaleParts',
	        female: '/getAdultFemaleParts'
	      },
	      child: {
	        male: '/getMaleChildParts',
	        female: '/getFemaleChildParts'
	      }
	    };
		var deferred = $q.defer();
		//$http.get("")
		return {
			getSchema: function() {
				return deferred.promise;
			}
		};
	}]);
})();