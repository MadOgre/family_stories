(function(){
	"use strict";
	angular.module("app")
	.directive("bodyPropertyOptions", function(){
		return {
			restrict: "E",
			bindToController: {
				property: "=",
				colorCodes: "=",
				currentImageId: "="
			},
			scope: {},
			controller: function(){},
			controllerAs: "ctrl",
			templateUrl: "js/directives/bodyPropertyOptions.html"
		};
	})
})();