(function() {
  'use strict';
  angular.module('app').controller('Main', ['$http', '$scope', '$location', 'sharedProperties', Main]);

  function Main($http, $scope, $location, sharedProperties) {
    var vm = this;
    vm.results = [];
    function updateCurrentAvatar() {
      vm.currentAvatar.images = vm.results[vm.currentAvatarIndex-1].images.slice();
      vm.currentAvatar.name = vm.results[vm.currentAvatarIndex-1].name;      
    }
    function avatarModified() {
      return vm.currentAvatar.name !== vm.results[vm.currentAvatarIndex-1].name ||
        JSON.stringify(vm.currentAvatar.images) !== JSON.stringify(vm.results[vm.currentAvatarIndex-1].images);
    }

    vm.isLoaded = false;
    vm.schema = [];
    var avatarDefaults = [];

    vm.currentAvatar = {
      name: "",
      images: []
    };
    vm.imageUrls = {};
    vm.currentUser = "TestUser01"; //change this for production
    vm.currentAvatarIndex = 1;
    vm.totalAvatars = 1;
    vm.maxAvatars = 10;
    vm.newAvatar = true;
    vm.error = "";

    vm.clearNew = function() {
      if (vm.newAvatar) {
        vm.prevAvatar();
      }
    };

    vm.loadSavedAvatars = function() {
      $http({
        method: 'GET',
        url: '/testroute'
      }).then(function(data){
        //set avatar defaults
        vm.totalAvatars = data.data.length || 1;
        console.log("DATA-LENGTH: " + data.data.length);  
        var i = 0;
        for (; i < vm.maxAvatars; ++i) {
          vm.results[i] = {
            name: "",
            images: avatarDefaults.slice()
          };
        }
        i = 0;
        if (data.data.length !== 0) {
          for (; i < vm.totalAvatars; ++i) {
            vm.results[i] = {
              name: data.data[i].avatar_name,
              images: data.data[i].image_id_list.split(",")
            };
          }
        }
        for (; i < vm.maxAvatars; ++i) {
          vm.results.push({
            name: "",
            images: avatarDefaults.slice()
          });
        }
        vm.currentAvatarIndex = 1;
        updateCurrentAvatar();
        if (data.data.length > 0) {
          vm.newAvatar = false;
        }
      });
    };

    vm.getProperties = function() {
      $http({
        method: 'GET',
        url: '/getproperty/MAX_AVATARS'
      }).then(function(data){
        console.log(JSON.stringify(data.data));
        sharedProperties.setMaxAvatars(data.data[0].property_value);
        $http({
          method: 'GET',
          url: '/getproperty/MAX_BOOK_PAGES'          
        }).then(function(data){
          sharedProperties.setMaxBookPages(data.data[0].property_value);
        });
      });
    };

    vm.getSchema = function() {

      $http({
        method: 'GET',
        url: '/getCurrentProfile'
      }).then(function success(data){
        vm.currentUserProfile = data.data;
      });


    	$http({
        method: 'GET',
        //url: '/schema.json'
        // url: 'http://default-environment.ymuptkfrgv.us-west-2.elasticbeanstalk.com/getAdultMaleParts'
        //url: 'http://178.62.255.163:8080/FamilyStoryWebService/getAdultMaleParts'
        url: '/getAdultMaleParts'
      }).then(function success(data){
        //save all data in vm.schema
      	vm.schema = data.data;

        vm.schema.forEach(function(item){
          //save the first value for defaults
          avatarDefaults.push(item.values[0].image_id.toString());
          //fill the imageUrls
          item.values.forEach(function(value){
            vm.imageUrls[value.image_id] = {
              location: value.image_location,
              image_x: value.image_x,
              image_y: value.image_y
            };
          });
        });

        //set avatar defaults
        for (var i = 0; i < vm.maxAvatars; ++i) {
          vm.results.push({
            name: "",
            images: avatarDefaults.slice()
          });
        }

        //set current avatar
        updateCurrentAvatar();

        //set loaded flag
      	vm.isLoaded = true;
      }, function fail(data){
        console.warn(data);
      });
    };
    vm.getSchema();
    vm.getProperties();
    vm.loadSavedAvatars();

    vm.postPerson = function(cb) {
      console.log("post person called");
      var response = {
        user_id: vm.currentUser,
        avatar_name: vm.currentAvatar.name,
        image_id_list: vm.currentAvatar.images.map(function(item){return parseInt(item);}),
        replace: vm.newAvatar ? null : vm.results[vm.currentAvatarIndex-1].name
      };
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
        if (data.data.result === "success") {
          vm.results[vm.currentAvatarIndex-1].name = vm.currentAvatar.name;
          vm.results[vm.currentAvatarIndex-1].images = vm.currentAvatar.images.slice();
          if (cb) {
            cb(null);
          }
        } else {
          if (cb) {
            cb("Save Failed");
          }
        }
        console.log(data);
        console.log(vm.avatarNames);
        console.log(vm.results);
      });
    };

    function advanceAvatar() {
      vm.newAvatar = false;
      if (vm.currentAvatarIndex < vm.totalAvatars) {
        //if current avatar is not last, simply advance
        vm.currentAvatarIndex++;
        updateCurrentAvatar();
      } else {
        //if current avatar IS last
        //check to see whether more avatars are possible
        if (vm.currentAvatarIndex < vm.maxAvatars) {
          vm.currentAvatarIndex++;
          vm.totalAvatars++;
          updateCurrentAvatar();
          vm.newAvatar = true;
        }
      }
    }

    function retractAvatar() {
      vm.newAvatar = false;
      if (vm.currentAvatarIndex > 1) {
        //if currentAvatar is not first, simply retract
        vm.currentAvatarIndex--;
        updateCurrentAvatar();
      }
    }

    vm.nextAvatar = function() {
      console.log("FIRED RIGHT!");
      if (vm.currentAvatarIndex === vm.totalAvatars) {
        $("#avatar-name-input").focus();
      }
      if (vm.currentAvatar.name === "") {
        vm.error = "Avatar name may not be blank";
        return;
      }
      vm.error = "";
      if (avatarModified()) {
        vm.postPerson(function(){
          advanceAvatar();
        });
      } else {
        advanceAvatar();
      }
    };

    vm.prevAvatar = function() {
      console.log("FIRED LEFT!");
      vm.error = "";
      if (vm.newAvatar) {
        if (vm.currentAvatar.name !== "") {
          vm.postPerson(function(){
            retractAvatar();
          });
        } else {
          vm.results[vm.currentAvatarIndex-1].images = avatarDefaults.slice();
          if (vm.totalAvatars > 1) {
            vm.totalAvatars--;
          }
          retractAvatar();
        }
      } else {
        console.log("test1");
        if (avatarModified()) {
          console.log("test2");
          console.log("Current Avatar Name: " + vm.currentAvatar.name); 
          if (vm.currentAvatar.name === undefined) {
            console.log("test3");
            vm.error = "Avatar name may not be blank";
            return;
          }
          vm.postPerson(function(){
            retractAvatar();
          });
        } else {
          retractAvatar();
        }
      }
    };

    vm.submitPreview = function() {
      $http({
        method: "GET",
        url: "/getCurrentId"
      }).then(function(data){
        $http({
          method: "GET",
          url: "/proxy/http://178.62.255.163:8080/FamilyStoryWebService/publish/" + data.data + "+LOW"
        }).
        then(function success(data){
          //alert(JSON.stringify(data.data));
          sharedProperties.setFolderName(data.data.result);
          //alert(sharedProperties.getFolderName());
          $('#myModal').on('hidden.bs.modal', function () {
            $location.url('/getpreview');
            $scope.$apply();
          });
          $("#myModal").modal('hide');
        }, function fail(data){
          console.warn(data);
        });
      });
    };
  }
}());
