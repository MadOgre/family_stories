(function(){
	"use strict";
	angular.module("app")
	.directive("avatarPartSelectorPanes", function(){
		return {
			restrict: "E",
			bindToController: {
				schema: "=",
				colorCodes: "=",
				currentAvatar: "="
			},
			scope: {},
			controller: ["$scope", function($scope){
				var self = this;
				this.avatarErrorDisplay = false;
				this.isPristine = true;
				this.getNamePlaceholder = function() {
			      if (self.currentAvatar.gender === 'male') {
			        if (self.currentAvatar.age === 'adult') {
			          return 'ex. Daddy';
			        } else {
			          return 'ex. Timmy';
			        }
			      } else {
			        if (self.currentAvatar.age === 'adult') {
			          return 'ex. Mommy';
			        } else {
			          return 'ex. Annie';
			        }
			      }
    			};
    			this.signalSchemaChange = function() {
    				$scope.$emit("change:schema");
    			}
			    $scope.$on("error:name:on", function(){
			      self.avatarErrorDisplay = true;
			    });

			    $scope.$on("error:name:off", function(){
			      self.avatarErrorDisplay = false;
			    })
			}],
			controllerAs: "ctrl",
			templateUrl: "js/directives/avatarPartSelectorPanes.html"
		};
	});
})();