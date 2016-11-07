(function(){
  "use strict";
  angular.module('app')
    .service('sharedProperties', ['$http', function ($http) {
        var folderName = '';
        var maxAvatars = 0;
        var maxBookPages = 0;
        var maxChildren = 0;

        return {
            getFolderName: function () {
                //return folderName;
                $http({
                    method: "GET",
                    url: "/getFolderName"
                  }).then(function success(data){
                      folderName = JSON.parse(data.data).result;
                      return folderName;
                    }, function fail(data){
                      console.warn(data);
                    });
            },
            setFolderName: function(value) {
                folderName = value;
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