(function(){
  "use strict";
  angular.module('app')
    .service('sharedProperties', ['$http', function ($http) {
        var folderName = '';
        var maxAvatars = 0;
        var maxBookPages = 0;
        var maxChildren = 0;

        return {
            setFolderName: function () {
                //return folderName;
                $http({
                    method: "GET",
                    url: "/setFolderName"
                  }).then(function success(data){
                      folderName = JSON.parse(data.data).result;
                    }, function fail(data){
                      console.warn(data);
                    });
            },
            getFolderName: function() {
                return folderName;
            },
            getMaxAvatars: function () {
                return maxAvatars;
            },
            setMaxAvatars: function(value) {
                maxAvatars = value;
            },
            getMaxBookPages: function () {
                return maxBookPages;
            },
            setMaxBookPages: function(value) {
                maxBookPages = value;
            },
            getMaxChildren: function () {
                return maxChildren;
            },
            setMaxChildren: function(value) {
                maxChildren = value;
            }
        };
    }]);
})();