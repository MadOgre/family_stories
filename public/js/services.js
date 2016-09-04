(function(){
  "use strict";
  angular.module('app')
    .service('sharedProperties', function () {
        var folderName = '';

        return {
            getFolderName: function () {
                return folderName;
            },
            setFolderName: function(value) {
                folderName = value;
            }
        };
    });
})();