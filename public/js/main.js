(function() {
  'use strict';
  angular.module('app').controller('Main', ['$http', '$scope', Main]);

  function Main($http, $scope) {
    var vm = this;
    vm.isLoaded = false;
    vm.schema = [];
    vm.avatarNames = [];
    vm.avatarMaleDefaults = ["1","4","7", "25", "28", "31"];
    vm.results = [];
    vm.currentAvatar = {
      name: "",
      images: ["1","4","7", "25", "28", "31"]
    };
    vm.imageUrls = {};
    vm.currentUser = "";
    vm.currentAvatarIndex = 0;
    vm.newAvatar = true;

    vm.getImageById = function(id) {
      return imageUrls[id];
    };
    
    vm.getSchema = function() {
    	$http({
        method: 'GET',
        //url: '/schema.json'
        // url: 'http://default-environment.ymuptkfrgv.us-west-2.elasticbeanstalk.com/getAdultMaleParts'
        //url: 'http://178.62.255.163:8080/FamilyStoryWebService/getAdultMaleParts'
        url: '/getAdultMaleParts'
      }).then(function success(data){
      	vm.schema = data.data;
        vm.schema.forEach(function(item){
          item.values.forEach(function(value){
            vm.imageUrls[value.image_id] = {
              location: value.image_location,
              image_x: value.image_x,
              image_y: value.image_y
            };
          });
        });
        // console.log(JSON.stringify(vm.imageUrls));
      	vm.isLoaded = true;
      }, function fail(data){

      });
    };
    vm.getSchema();
    vm.postPerson = function(user) {
      console.log("post person called");
      var response = {
        user_id: user || vm.currentUser,
        avatar_name: vm.currentAvatar.name,
        image_id_list: vm.currentAvatar.images.map(function(item){return parseInt(item);}),
        replace: vm.newAvatar ? null : vm.avatarNames[vm.currentAvatarIndex]
      }
      // vm.schema.forEach(function(item){
      //   response.image_id_list += $('input[name=' + item.image_type + ']:checked').val() + ",";
      // });
      // response.image_id_list = response.image_id_list.slice(0, -1);
      // console.log("About to send response: " + JSON.stringify(response));
      $http({
        method: 'POST',
        // url: 'http://default-environment.ymuptkfrgv.us-west-2.elasticbeanstalk.com/setUserSelection',
        //url: 'http://178.62.255.163:8080/FamilyStoryWebService/setUserSelection',
        url: '/setUserSelection',
        headers: {
          "Content-Type": "application/json"
        },
        data: response
      }).then(function(data){
        console.log("POST request finished");
        if (data.data.result = "SUCCESS") {
          // alert("Saved!");

          //if avatar exists
          // var index = vm.results.find(function(item){
          //   return item.name === vm.currentAvatar.name;
          // });
          // if (index === -1) {

          // }
          if (vm.newAvatar) {
            // alert("avatar is new");
            //avatar is new
            vm.results.push(Array.prototype.slice.call(vm.currentAvatar.images));
            vm.avatarNames.push(vm.currentAvatar.name);
            vm.currentAvatar.name = "";
            vm.currentAvatar.images = Array.prototype.slice.call(vm.avatarMaleDefaults);
            // vm.currentAvatarIndex++;
          } else {
            // alert("avatar is old");
            vm.results[vm.currentAvatarIndex] = Array.prototype.slice.call(vm.currentAvatar.images);
            vm.avatarNames[vm.currentAvatarIndex] = vm.currentAvatar.name;
            // if (vm.currentAvatarIndex >= vm.avatarNames.length) {
            //   vm.newAvatar = true;
            //   vm.currentAvatar.name = "";
            //   vm.currentAvatar.images = Array.prototype.slice.call(vm.avatarMaleDefaults);              
            // } else {
            //   vm.currentAvatar.images = Array.prototype.slice.call(vm.results[vm.currentAvatarIndex]);
            //   vm.currentAvatar.name = vm.avatarNames[vm.currentAvatarIndex];
            // }
          }


        }
        console.log(data);
        console.log(vm.avatarNames);
        console.log(vm.results);
      });
    }

    vm.nextAvatar = function() {
      console.log("FIRED RIGHT!");
      if (vm.currentAvatarIndex < vm.avatarNames.length - 1) {
        console.log("in the if block");
        vm.postPerson();
        vm.currentAvatarIndex++;
        vm.currentAvatar.images = vm.results[vm.currentAvatarIndex];
        vm.currentAvatar.name = vm.avatarNames[vm.currentAvatarIndex];
      } else {
        console.log("in the else block");
        vm.postPerson();
        vm.currentAvatarIndex++;
        vm.newAvatar = true;
        vm.currentAvatar.images = Array.prototype.slice.call(vm.avatarMaleDefaults);
        vm.currentAvatar.name = "";
      }
    }

    vm.prevAvatar = function() {
      console.log("FIRED LEFT!")
      if (vm.currentAvatarIndex > 0) {
        vm.postPerson();
        vm.newAvatar = false;
        vm.currentAvatarIndex--;
        console.log("CAI: " + vm.currentAvatarIndex);
        vm.currentAvatar.images = Array.prototype.slice.call(vm.results[vm.currentAvatarIndex]);
        vm.currentAvatar.name = vm.avatarNames[vm.currentAvatarIndex];
      }
    }

    // vm.switchImages = function(image_type, location, image_x, image_y) {
    //   console.log("called");
    //   console.log(image_type + ": " + location);
    //   switch (image_type) {
    //     case "ADULT_BODY":
    //       $scope.bodypath = location;
    //       $scope.bodycoords.x = image_x;
    //       $scope.bodycoords.y = image_y;
    //       $(".img-body").css("top", $scope.bodycoords.y);
    //       console.log(vm.bodycoords.y);
    //       break;
    //     case "ADULT_FACE":
    //       $scope.facepath = location;
    //       $scope.facecoords.x = image_x;
    //       $scope.facecoords.y = image_y;
    //       $(".img-face").css("top", $scope.facecoords.y);
    //       break;
    //     case "ADULT_EYES":
    //       $scope.eyespath = location;
    //       $scope.eyescoords.x = image_x;
    //       $scope.eyescoords.y = image_y;
    //       $(".img-eyes").css("top", $scope.eyescoords.y);
    //       break;  
    //   };
    // }
  }
}());
