(function(){
  "use strict";
  angular.module("app").controller("Preview", ['sharedProperties', Preview]);

  function Preview(sharedProperties) {
    var vm = this;
    vm.numberOfImages = 36;
    vm.imageList = function(num) {
      return new Array(num);
    }
    vm.folderName = sharedProperties.getFolderName();
  }

})();