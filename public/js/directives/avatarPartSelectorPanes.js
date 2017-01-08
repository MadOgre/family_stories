(function(){
	"use strict";
	angular.module("app")
	.directive("avatarPartSelectorPanes", function(){
		return {
			restrict: "E",
			bindToController: {
				property: "=",
				colorCodes: "=",
				currentAvatar: "="
			},
			scope: {},
			controller: function(){},
			controllerAs: "ctrl",
			templateUrl: "js/directives/avatarPartSelectorPanes.html"
		};
	});
})();