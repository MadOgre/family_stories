(function(){
  "use strict";
  angular.module("app").controller("Preview", ['sharedProperties', '$http', '$location', Preview]);

  function Preview(sharedProperties, $http, $location) {

    var vm = this;
    vm.folderName = "";
    vm.previewFolderName = "";
    vm.loaded = false;
    vm.folder2loaded = false;
    vm.currency = "USD";
    vm.price = 3000; //price is in cents by default
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
                      $http({
                    method: "GET",
                    url: "/setPreviewFolderName"
                    }).then(function success(data){
                      vm.previewFolderName = JSON.parse(data.data).result;
                      //alert(vm.folderName);
                      vm.folder2loaded = true;
                    }, function fail(data){
                      console.warn(data);
                    });
                        $http({
                    method: "GET",
                    url: "/getCurrencyAndPrice"
                    }).then(function success(data){
                      vm.currency = data.data[0].currency_code;
                      console.log("CURRENCY: " + vm.currency);
                      alert(vm.currency);
                      vm.price = data.data[0].price;
                      console.log("PRICE: " + vm.currency);
                      alert(vm.price);
                    }, function fail(data){
                      console.warn(data);
                    });
    //alert(vm.folderName);

    //note by MGS7664 must correct this later, number of pages currently hardcoded
    vm.numberOfImages = parseInt(sharedProperties.getMaxBookPages());
    vm.receipt = null;

    vm.submitPreview = function() {
      //alert("submitted!");
      $http({
        method: "GET",
        url: "/setFolderName"
      }).then(function success(data){
          // alert(JSON.stringify(data.data));
          //alert(JSON.parse(data.data).result);
          //sharedProperties.setFolderName(JSON.parse(data.data).result);
          //alert(sharedProperties.getFolderName());
          //$location.url('/getpreview');
          //$scope.$apply();
          // $('#myModal').on('hidden.bs.modal', function () {
            $location.url('/previewbook');
            // $scope.$apply();
          // });
          // $("#myModal").modal('hide');
        }, function fail(data){
          console.warn(data);
        });
    };


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