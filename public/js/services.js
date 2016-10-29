(function(){
  "use strict";
  angular.module('app')
    .service('sharedProperties', function () {
        var folderName = '';
        var maxAvatars = 0;
        var maxBookPages = 0;
        var maxChildren = 0;

        return {
            getFolderName: function () {
                return folderName;
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
    });
})();