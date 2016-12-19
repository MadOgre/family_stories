(function(){
  "use strict";
  angular.module("app").controller("Preview", ['sharedProperties', '$http', '$location', Preview]);

  function Preview(sharedProperties, $http, $location) {

    var vm = this;
    vm.folderName = "";
    vm.previewFolderName = "";
    vm.loaded = false;
    vm.folder2loaded = false;
    vm.priceandcurrencyloaded = false;
    vm.maxBookPages = 0;
    vm.currency = "";
        $http({
          method: 'GET',
          url: '/getproperty/MAX_BOOK_PAGES'          
        }).then(function(data){
          //sharedProperties.setMaxBookPages(data.data[0].property_value);
          vm.maxBookPages = +(data.data[0].property_value);
        });
    vm.price = 987; //price is in cents by default
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
                      //console.log("CURRENCY: " + vm.currency);
                      //alert(vm.currency);
                      vm.price = data.data[0].price;
                      //console.log("PRICE: " + vm.currency);
                      //alert(vm.price);
                      vm.priceandcurrencyloaded = true;
                    }, function fail(data){
                      console.warn(data);
                    });
    //alert(vm.folderName);

    //note by MGS7664 must correct this later, number of pages currently hardcoded

    //vm.numberOfImages = parseInt(sharedProperties.getMaxBookPages());
        // alert(vm.numberOfImages);
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
    // $('.flipbook').turn({
    //       // Width

    //       width:960,
          
    //       // Height

    //       height:480,

    //       // Elevation

    //       elevation: 50,
          
    //       // Enable gradients

    //       gradients: true,
          
    //       // Auto center this flipbook
    //       display: 'double',
    //       // autoCenter: true

    //   }
    // );
(function () {
    'use strict';

    var module = {
        ratio: 2.83,
        init: function (id) {
            var me = this;
                    // var size = me.resize();
                    // $(me.el).turn('size', size.width, size.height);
            // if older browser then don't run javascript
            if (document.addEventListener) {
                this.el = document.getElementById(id);
                this.resize();
                this.plugins();

                // on window resize, update the plugin size
                window.addEventListener('resize', function (e) {
                    var size = me.resize();
                    $(me.el).turn('size', size.width, size.height);
                });
            }
        },
        resize: function () {
            // reset the width and height to the css defaults
            this.el.style.width = '';
            this.el.style.height = '';

            var width = this.el.clientWidth,
                height = Math.round(width / this.ratio),
                padded = Math.round(document.body.clientHeight * 0.9);

            // if the height is too big for the window, constrain it
            if (height > padded) {
                height = padded;
                width = Math.round(height * this.ratio);
            }

            // set the width and height matching the aspect ratio
            this.el.style.width = width + 'px';
            this.el.style.height = height + 'px';

            return {
                width: width,
                height: height
            };
        },
        plugins: function () {
            // run the plugin
            $(this.el).turn({
                gradients: true,
                acceleration: true
            });
            var me2 = this;
            setTimeout(function(){
            var size = me2.resize();
            //alert(JSON.stringify(size));
            $(me2.el).turn('size', size.width, size.height);
          },2000);
            // hide the body overflow
            document.body.className = 'hide-overflow';
        }
    };

    module.init('flipbook');
}());
    $(".flipbook").turn('peel', 'tl');
    $(".flipbook").turn('peel', 'tr');
    };
    vm.imageList = function() {
      //alert(vm.numberOfImages);
      return new Array(vm.maxBookPages);
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

    vm.nextPage = function() {
      $("#flipbook").turn("next");
    }

    vm.prevPage = function() {
      $("#flipbook").turn("previous");
    }

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