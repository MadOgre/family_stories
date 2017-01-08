(function(){
	"use strict";
	angular.module("app")
	.directive("bodyPropertyColors", function(){
		return {
			restrict: "E",
			bindToController: {
				property: "=",
				colorCodes: "="
			},
			scope: {},
			controller: function(){},
			controllerAs: "ctrl",
			templateUrl: "js/directives/bodyPropertyColors.html"
		};
	});
})();