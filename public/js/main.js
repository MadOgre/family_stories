/*global angular, $*/
(function() {
  'use strict';
  angular.module('app').controller('Main', ['$http', '$scope', '$q', '$location', '$window', 'sharedProperties', Main]);

  function Main($http, $scope, $q, $location, $window, sharedProperties) {
    var vm = this;
    vm.results = [];
    function updateCurrentAvatar() {
      vm.currentAvatar.images = vm.results[vm.currentAvatarIndex-1].images.slice();
      vm.currentAvatar.name = vm.results[vm.currentAvatarIndex-1].name;
      vm.currentAvatarGender = vm.imageUrls[vm.currentAvatar.images[0]].gender;
      vm.currentAvatarAge = vm.imageUrls[vm.currentAvatar.images[0]].age;   
    }
    function avatarModified() {
      return vm.currentAvatar.name !== vm.results[vm.currentAvatarIndex-1].name ||
        JSON.stringify(vm.currentAvatar.images) !== JSON.stringify(vm.results[vm.currentAvatarIndex-1].images);
    }

    vm.isLoaded = false;
    vm.schema = [];
    vm.adultMaleSchema = [];
    vm.adultFemaleSchema = [];
    vm.childFemaleSchema = [];
    vm.childMaleSchema = [];
    vm.isPristine = true;
    var adultMaleAvatarDefaults = [];
    var adultFemaleAvatarDefaults = [];
    var childMaleAvatarDefaults = [];
    var childFemaleAvatarDefaults = [];
    var bodyPartUrls = {
      adult: {
        male: '/getAdultMaleParts',
        female: '/getAdultFemaleParts'
      },
      child: {
        male: '/getMaleChildParts',
        female: '/getFemaleChildParts'
      }
    };
    vm.currentAvatarAge = 'adult';
    vm.currentAvatarGender = 'male';

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

    vm.switchSchema = function() {
      if (vm.currentAvatarGender === 'male') {
        if (vm.currentAvatarAge === 'adult') {
          vm.schema = vm.adultMaleSchema;
          vm.currentAvatar.images = adultMaleAvatarDefaults.slice();
        } else {
          vm.schema = vm.childMaleSchema;
          vm.currentAvatar.images = childMaleAvatarDefaults.slice();
        }
      } else {
        if (vm.currentAvatarAge === 'adult') {
          vm.schema = vm.adultFemaleSchema;
          vm.currentAvatar.images = adultFemaleAvatarDefaults.slice();
        } else {
          vm.schema = vm.childFemaleSchema;
          vm.currentAvatar.images = childFemaleAvatarDefaults.slice();
        }
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
            images: adultMaleAvatarDefaults.slice()
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
          vm.results[i] = {
            name: "",
            images: adultMaleAvatarDefaults.slice()
          };
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

      var loadAdultFemaleSchema = $http({
        method: 'GET',
        url: bodyPartUrls.adult.female
      }).then(function success(data){
        vm.adultFemaleSchema = data.data;
        vm.adultFemaleSchema.forEach(function(item){
          adultFemaleAvatarDefaults.push(item.values[0].image_id.toString());
          //fill the imageUrls
          //vm.imageUrls = {};
          //console.log("IMG URLS before !!!: " + JSON.stringify(vm.imageUrls));
          item.values.forEach(function(value){
            vm.imageUrls[value.image_id] = {
              location: value.image_location,
              image_x: value.image_x,
              image_y: value.image_y,
              gender: 'female',
              age: 'adult'
            };
          });
          //console.log("IMG URLS after !!!: " + JSON.stringify(vm.imageUrls));
        });       
      }, function fail(err){
        console.warn(err);
      });

      var loadChildFemaleSchema = $http({
        method: 'GET',
        url: bodyPartUrls.child.female
      }).then(function success(data){
        vm.childFemaleSchema = data.data;
        vm.childFemaleSchema.forEach(function(item){
          childFemaleAvatarDefaults.push(item.values[0].image_id.toString());
          //fill the imageUrls
          //vm.imageUrls = {};
          //console.log("IMG URLS before !!!: " + JSON.stringify(vm.imageUrls));
          item.values.forEach(function(value){
            vm.imageUrls[value.image_id] = {
              location: value.image_location,
              image_x: value.image_x,
              image_y: value.image_y,
              gender: 'female',
              age: 'child'
            };
          });
          //console.log("IMG URLS after !!!: " + JSON.stringify(vm.imageUrls));
        });       
      }, function fail(err){
        console.warn(err);
      });

      var loadChildMaleSchema = $http({
        method: 'GET',
        url: bodyPartUrls.child.male
      }).then(function success(data){
        vm.childMaleSchema = data.data;
        vm.childMaleSchema.forEach(function(item){
          childMaleAvatarDefaults.push(item.values[0].image_id.toString());
          //fill the imageUrls
          //vm.imageUrls = {};
          //console.log("IMG URLS before !!!: " + JSON.stringify(vm.imageUrls));
          item.values.forEach(function(value){
            vm.imageUrls[value.image_id] = {
              location: value.image_location,
              image_x: value.image_x,
              image_y: value.image_y,
              gender: 'male',
              age: 'child'
            };
          });
          //console.log("IMG URLS after !!!: " + JSON.stringify(vm.imageUrls));
        });       
      }, function fail(err){
        console.warn(err);
      });

    	var loadAdultMaleSchema = $http({
        method: 'GET',
        //url: '/schema.json'
        // url: 'http://default-environment.ymuptkfrgv.us-west-2.elasticbeanstalk.com/getAdultMaleParts'
        //url: 'http://178.62.255.163:8080/FamilyStoryWebService/getAdultMaleParts'
        url: bodyPartUrls.adult.male
      }).then(function success(data){
        //save all data in vm.schema
      	vm.schema = data.data;
        vm.adultMaleSchema = data.data;
        //avatarDefaults = [];
        //vm.imageUrls = {};
        //console.log("Avatar Defaults !!!: " + JSON.stringify(avatarDefaults));
        vm.adultMaleSchema.forEach(function(item){
          //save the first value for defaults

          adultMaleAvatarDefaults.push(item.values[0].image_id.toString());
          //console.log("Avatar Defaults !!!: " + JSON.stringify(avatarDefaults));
          //fill the imageUrls
          //vm.imageUrls = {};
          //console.log("IMG URLS before !!!: " + JSON.stringify(vm.imageUrls));
          item.values.forEach(function(value){
            vm.imageUrls[value.image_id] = {
              location: value.image_location,
              image_x: value.image_x,
              image_y: value.image_y,
              gender: 'male',
              age: 'adult'
            };
          });
          //console.log("IMG URLS after !!!: " + JSON.stringify(vm.imageUrls));
        });

        //set avatar defaults
        for (var i = 0; i < vm.maxAvatars; ++i) {
          vm.results[i] = {
            name: "",
            images: adultMaleAvatarDefaults.slice()
          };
        }

        //set current avatar
        updateCurrentAvatar();
      }, function fail(data){
        console.warn(data);
      });

      $q.all([loadAdultFemaleSchema, loadAdultMaleSchema, loadChildFemaleSchema, loadChildMaleSchema]).then(function success(){
        vm.loaded = true;
      }, function fail(err){
        console.warn(err);
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
          vm.isPristine = true;
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
    
    vm.rightArrowClick = function() {
      if (vm.currentAvatarIndex !== vm.totalAvatars) {
        vm.nextAvatar();
      }
    };

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
          vm.switchSchema();
        });
      } else {
        advanceAvatar();
        vm.switchSchema();
      }
      //console.log("Switching Schema!");
      //vm.switchSchema();
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
          vm.results[vm.currentAvatarIndex-1].images = adultMaleAvatarDefaults.slice();
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
            vm.switchSchema();
          });
        } else {
          retractAvatar();
          vm.switchSchema();
        }
      }
      //console.log("Switching Schema!");
      //vm.switchSchema();
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
          //$location.url('/getpreview');
          //$scope.$apply();
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

    vm.saveChanges = function() {
      vm.postPerson(function(){
        alert("Changes saved!");
      });
    };

    vm.deleteAvatarsConfirm = function() {
      if (confirm("You are about to clear all created avatars")) {
        vm.deleteUserAvatars();
      }
    };

    vm.deleteUserAvatars = function() {
      $http({
        method: "GET",
        url: "/deleteUserAvatars"
      }).then(function success(){
        $window.location.reload();
      }, function fail(err){
        alert("there was an error deleting avatars");
      });
    };
  }
}());
