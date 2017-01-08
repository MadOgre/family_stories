(function(){
	"use strict";
	angular.module("app")
	.directive("bodyPropertyOptions", function($parse){
		return {
			restrict: "E",
			bindToController: {
				property: "=",
				colorCodes: "=",
				imageList: "="
			},
			scope: {},
			controller: function(){},
			controllerAs: "ctrl",
			templateUrl: "js/directives/bodyPropertyOptions.html"
		};
	})
})();