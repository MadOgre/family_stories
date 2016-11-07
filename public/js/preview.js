(function(){
  "use strict";
  angular.module("app").controller("Preview", ['sharedProperties', '$http', Preview]);

  function Preview(sharedProperties, $http) {

    var vm = this;
    vm.folderName = "";
    vm.loaded = false;
    //vm.folderName = sharedProperties.getFolderName();
                    $http({
                    method: "GET",
                    url: "/setFolderName"
                  }).then(function success(data){
                      vm.folderName = JSON.parse(data.data).result;
                      //alert(vm.folderName);
                      vm.loaded = true;
                    }, function fail(data){
                      console.warn(data);
                    });
    //alert(vm.folderName);

    //note by MGS7664 must correct this later, number of pages currently hardcoded
    vm.numberOfImages = parseInt(sharedProperties.getMaxBookPages());
    vm.receipt = null;
    vm.finished = function() {
    $('.flipbook').turn({
          // Width

          width:960,
          
          // Height

          height:169,

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

    

    // $http({
    //     method: 'GET',
    //     url: '/getFolderName'
    //   }).then(function(data){
    //     vm.folderName = data.result;
    //     alert(vm.folderName);
    //   });

    

    //alert(vm.folderName);
      $http({
        method: 'GET',
        url: '/getPaymentInfo'
      }).then(function(data){
        vm.paymentinfo = data.data;
      });
  }

})();