(function(){
  "use strict";
  angular.module("app").controller("Preview", ['sharedProperties', Preview]);

  function Preview(sharedProperties) {
    var vm = this;
    vm.numberOfImages = parseInt(sharedProperties.getMaxBookPages());
    vm.finished = function() {
    $('.flipbook').turn({
          // Width

          width:992,
          
          // Height

          height:175,

          // Elevation

          elevation: 50,
          
          // Enable gradients

          gradients: true,
          
          // Auto center this flipbook
          display: 'double',
          autoCenter: true

      }
    );
    $(".flipbook").turn('peel', 'tl');
    $(".flipbook").turn('peel', 'tr');
    }
    vm.imageList = function(num) {
      return new Array(num);
    }
    vm.folderName = sharedProperties.getFolderName();
  }

})();