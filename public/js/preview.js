(function(){
  "use strict";
  angular.module("app").controller("Preview", ['sharedProperties', '$http', Preview]);

  function Preview(sharedProperties, $http) {
    var vm = this;
    vm.numberOfImages = parseInt(sharedProperties.getMaxBookPages());
    vm.receipt = null;
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
          // autoCenter: true

      }
    );
    $(".flipbook").turn('peel', 'tl');
    $(".flipbook").turn('peel', 'tr');
    };
    vm.imageList = function(num) {
      return new Array(num);
    };

    vm.finalizepayment = function() {
      $http({
        method: 'GET',
        url: '/finalizetransaction'
      }).then(function(data){
        vm.receipt = data.data;
        console.log(JSON.stringify(data.data));
        vm.paymentinfo = null;
      });
    };

    vm.folderName = sharedProperties.getFolderName();

    // $http({
    //     method: 'GET',
    //     url: '/getFolderName'
    //   }).then(function(data){
    //     vm.folderName = data.result;
    //     alert(vm.folderName);
    //   });

    

    alert(vm.folderName);
      $http({
        method: 'GET',
        url: '/getPaymentInfo'
      }).then(function(data){
        vm.paymentinfo = data.data;
      });
  }

})();