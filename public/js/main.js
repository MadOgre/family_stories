/*global angular, $*/
(function() {
  'use strict';
  angular.module('app').controller('Main', ['$http', '$scope', '$q', '$location', '$window', 'sharedProperties', 'preloader', Main]);

  function Main($http, $scope, $q, $location, $window, sharedProperties, preloader) {
    // $('.landing-slider').slick({
    //     speed: 300,
    //     slidesToShow: 1,
    //     useTransform: false
    // });
    // $(".slider").slick();
    var vm = this;
    vm.results = [];
    vm.colorCodes = {};
    vm.carousel_index = 0;
    vm.familyType = "3";
    vm.deleting = false;
    vm.avatarErrorDisplay = false;

    // $scope.$watch(, function (newVal) {
    //   console.log('Name changed to ' + newVal);
    // });

    vm.increaseFamily = function() {
      vm.familyType='3'
            setTimeout(function(){
              //alert("trying to spin back");
              vm.carousel_index++;
              //$scope.$apply();
              $scope.$digest();
            }, 200);
    }

    vm.selectFirstTab = function() {
      //console.log("checking for mobile");
      setTimeout(function(){
        if (vm.isMobile()) {
          //alert("is mobile");
          $("#tabs>div>div>ul>li:nth-child(2)>a").trigger("click");
          // alert($("#tabs>div>div>ul>li:nth-child(2)>a").html());
        } else {
          $("#tabs>div>div>ul>li:first-child>a").trigger("click");
        }
      }, 1000);
    };

    vm.selectFirstTab();

    vm.isMobile = function() {
      return ($("#mobile-hook").css("display") === "none");
    };

    // alert(vm.isMobile());

    $scope.$on("activate:first:tab", function(){
      //alert("received signal to activate tab");
      vm.selectFirstTab();
    })


    vm.getHelperArray = function(qty) {
      var result = [];
      var n = +qty;
      for (var i = 0; i < n; i++) {
        result.push(i);
      }
      return result;
    }

    // vm.getNamePlaceholder = function() {
    //   if (vm.currentAvatar.gender === 'male') {
    //     if (vm.currentAvatar.age === 'adult') {
    //       return 'ex. Daddy';
    //     } else {
    //       return 'ex. Timmy';
    //     }
    //   } else {
    //     if (vm.currentAvatar.age === 'adult') {
    //       return 'ex. Mommy';
    //     } else {
    //       return 'ex. Annie';
    //     }
    //   }
    // }

    $scope.$watch(angular.bind(this, function () {
      return this.carousel_index;
    }), function(v, old){
      $scope.$emit("activate:first:tab");
      ////console.log("SPINNING!");
      //alert("spinning, old value: " + old + " new value: " + v);
      if (v !== old && !vm.avatarNameError) {

        if (vm.currentAvatar.name === '' || !vm.currentAvatar.name) {
          switch(vm.currentAvatarIndex) {
            case 1:
              vm.currentAvatar.name = 'Timmy';
              break;
            case 2:
              vm.currentAvatar.name = 'Daddy';
              break;
            case 3:
              vm.currentAvatar.name = 'Mommy';
          }
          // //alert("Error triggered");
          // if (!vm.deleting) {
          //   vm.avatarNameError = true;
          //   //vm.avatarErrorDisplay = true;
          //   $scope.$broadcast("error:name:on");
          // //$(".tab-pane").removeClass("active");
          // //$("#tabs>ul>li").removeClass("active");
          // //$('#nameGender').addClass("active");
          // //$("#tabs>ul>li:nth-child(2)").addClass("active");
          // }
          // if (old < v) {
          //   //alert("trying to retract");
          //   setTimeout(function(){
          //     //alert("trying to spin back");
          //     if (v - old == 2) {
          //       vm.carousel_index-=2;
          //     } else {
          //       vm.carousel_index--;
          //     }
          //     //$scope.$apply();
          //     $scope.$digest();
          //   }, 200);
          // } else {
          //   //alert("trying to retract");
          //   setTimeout(function(){
          //     //alert("trying to spin back");
          //     vm.carousel_index++;
          //     //$scope.$apply();
          //     $scope.$digest();

          //   }, 200);
          // }
        } //else {
          if (!vm.deleting) {
            //alert("THIS SHOULD NOT HAPPEN WHEN DELETING");
            vm.postPerson(function(){
              vm.currentAvatarIndex = v+1;
              updateCurrentAvatar(); 
              $scope.$emit("activate:first:tab");     
            });
          } else {
            //alert("DELETING - DID NOT POST");
              //vm.currentAvatarIndex = v+1;
              updateCurrentAvatar(); 
            vm.deleting = false;
          }       
        //}
      } else {
        vm.avatarNameError = false;
      }
    }, true);  

    $scope.$watch(angular.bind(this, function () {
      return this.currentAvatar;
    }), function(v){
      ////console.log("Current Index: " + vm.currentAvatarIndex);
      if (vm.results[vm.currentAvatarIndex-1]) vm.results[vm.currentAvatarIndex-1].images = vm.currentAvatar.images.slice();
      //$scope.$apply();
    }, true);

    $scope.$watch(angular.bind(this, function () {
      return this.colorCodes;
    }), function(v){
      var body_property = "";
      var nose_property = "";
      for (var property in v) {
        if (property.endsWith("nose")) {
          nose_property = property;
        }
        if (property.endsWith("body")) {
          body_property = property;
        }
        colorSync(property);
      }
      // console.log("NOSE PROPERTY: " + nose_property);
      // console.log("BODY PROPERTY: " + body_property);
      vm.colorCodes[nose_property] = vm.colorCodes[body_property];
    }, true);

    function colorSync(prop) {
      vm.currentAvatar.images = vm.currentAvatar.images.map(function(imageId){
        if (!vm.imageUrls[imageId] || vm.imageUrls[imageId].image_type !== prop) {
          return imageId;
        } else {
          //console.log("GET ID OF COLOR: " + getIdOfColor(prop, imageId, vm.colorCodes[prop]));
          return getIdOfColor(prop, imageId, vm.colorCodes[prop]);
        }
      });
    }

    function getIdOfColor(prop, id, colorCode) {
      for (var i_item = 0; i_item < vm.schema.length; ++i_item) {
        if (vm.schema[i_item].image_type === prop) {
          for (var i_val = 0; i_val < vm.schema[i_item].values.length; ++i_val) {
            if (vm.schema[i_item].values[i_val].image_id === id) {
              //console.log("ID FOUND !");
              for (var i_val2 = 0; i_val2 < vm.schema[i_item].values.length; ++i_val2) {
                //console.log("CHECING " + vm.schema[i_item].values[i_val].image_name + " AGAINST " + vm.schema[i_item].values[i_val].image_name);
                //console.log("CHECING " + vm.schema[i_item].values[i_val2].color_code + " AGAINST " + colorCode);
                if (vm.schema[i_item].values[i_val].image_name === vm.schema[i_item].values[i_val2].image_name && vm.schema[i_item].values[i_val2].color_code === colorCode) {
                  return vm.schema[i_item].values[i_val2].image_id;
                }                                
              }
            }
          }
          
        }
      }
      // vm.schema.forEach(function(item){
      //   if (item.image_type === prop) {
      //     item.values.forEach(function(value){
      //       if (value.image_id === id) {
              
      //         item.values.forEach(function(value2){

      //           if (value.image_name === value2.image_name && value2.color_code === colorCode) {
      //             return value2.image_id;
      //           }
      //         });
      //       }
      //     });
      //   }
      // });
    }

    function updateCurrentAvatar() {
      vm.currentAvatar.images = vm.results[vm.currentAvatarIndex-1].images.slice();
      vm.currentAvatar.name = vm.results[vm.currentAvatarIndex-1].name;
      vm.currentAvatar.gender = (vm.imageUrls[vm.currentAvatar.images[0]]) ? vm.imageUrls[vm.currentAvatar.images[0]].gender : 'male';
      vm.currentAvatar.age = vm.imageUrls[vm.currentAvatar.images[0]].age;
      for (var i_img = 0; i_img < vm.currentAvatar.images.length; ++i_img) {
        ////console.log("CHANGE TRIGGERED!");
        ////console.log(vm.imageUrls[vm.currentAvatar.images[i_img]].color_code);
        vm.colorCodes[vm.imageUrls[vm.currentAvatar.images[i_img]].image_type] = vm.imageUrls[vm.currentAvatar.images[i_img]].color_code;
      }
      vm.switchSchema("noreset");
    }
    function avatarModified() {
      return true;//vm.currentAvatar.name !== vm.results[vm.currentAvatarIndex-1].name ||
        //JSON.stringify(vm.currentAvatar.images) !== JSON.stringify(vm.results[vm.currentAvatarIndex-1].images);
    }

    vm.isLoaded = false;
    vm.schema = [];
    vm.adultMaleSchema = [];
    vm.adultFemaleSchema = [];
    vm.childFemaleSchema = [];
    vm.childMaleSchema = [];
    // vm.isPristine = true;
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
    //vm.currentAvatarAge = 'adult';
    //vm.currentAvatarGender = 'male';

    vm.currentAvatar = {
      name: "",
      images: [],
      age: "adult",
      gender: "male"
    };
    vm.imageUrls = {};
    vm.currentUser = "TestUser01"; //change this for production
    vm.currentAvatarIndex = 1;
    vm.totalAvatars = 1;
    vm.totalChildren = 0;
    vm.maxAvatars = 3; //must be set to at least 2 to prevent errors
    vm.maxChildren = 1;
    vm.newAvatar = true;
    vm.error = "";

    vm.clearNew = function() {
      if (vm.newAvatar) {
        vm.prevAvatar();
      }
    };

    vm.switchSchema = function() {
      //alert("triggered");
      if (vm.currentAvatar.gender === 'male') {
        if (vm.currentAvatar.age === 'adult') {
          vm.schema = vm.adultMaleSchema;
          if (!arguments[0]) vm.currentAvatar.images = adultMaleAvatarDefaults.slice();
          //$(".tab-pane").removeClass("active");
          //$("#tabs>ul>li").removeClass("active");
          //$('#nameGender').addClass("active");
          //$("#child_body, #adult_body").addClass("active");
          // setTimeout(function(){
          //   $(".tab-content div:nth-child(2)").addClass("active");
          // }, 200);
          
          //$("#tabs>ul>li:first-child").addClass("active");
          //alert("switched to adult male");
        } else {
          vm.schema = vm.childMaleSchema;
          if (!arguments[0]) vm.currentAvatar.images = childMaleAvatarDefaults.slice();
          //$(".tab-pane").removeClass("active");
          //$("#tabs>ul>li").removeClass("active");
          //$('#nameGender').addClass("active");
          //$("#child-body, #adult-body").addClass("active");
          // setTimeout(function(){
          //   $(".tab-content div:nth-child(2)").addClass("active");
          // }, 200);
          // $("#tabs>ul>li:first-child").addClass("active");
        }
      } else {
        if (vm.currentAvatar.age === 'adult') {
          vm.schema = vm.adultFemaleSchema;
          if (!arguments[0]) vm.currentAvatar.images = adultFemaleAvatarDefaults.slice();
          //$(".tab-pane").removeClass("active");
          //$("#tabs>ul>li").removeClass("active");
          //$('#nameGender').addClass("active");
          //$("#child-body, #adult-body").addClass("active");
          // setTimeout(function(){
          //   $(".tab-content div:nth-child(2)").addClass("active");
          // }, 200);
          // $("#tabs>ul>li:first-child").addClass("active");
        } else {
          vm.schema = vm.childFemaleSchema;
          if (!arguments[0]) vm.currentAvatar.images = childFemaleAvatarDefaults.slice();
          //$(".tab-pane").removeClass("active");
          //$("#tabs>ul>li").removeClass("active");
          //$('#nameGender').addClass("active");
          //$("#child-body, #adult-body").addClass("active");
          // setTimeout(function(){
          //   $(".tab-content div:nth-child(2)").addClass("active");
          // }, 200);
          // $("#tabs>ul>li:first-child").addClass("active");
        }
      }
      for (var i_img = 0; i_img < vm.currentAvatar.images.length; ++i_img) {
        vm.colorCodes[vm.imageUrls[vm.currentAvatar.images[i_img]].image_type] = vm.imageUrls[vm.currentAvatar.images[i_img]].color_code;
      }
      ////console.log("COLOR-CODES-ARRAY: " + JSON.stringify(vm.colorCodes));
      setTimeout(function(){
      $(".color_drop").off("click");
      $(".color_drop").click(function(){
        var thumbs = $(".color-thumbs");
        thumbs.slideToggle();
      });
      }, 1000);
    };

    vm.loadSavedAvatars = function(retract) {
      $http({
        method: 'GET',
        url: '/testroute'
      }).then(function(data){
        //set avatar defaults
        vm.totalAvatars = data.data.length || 1;
        ////console.log("DATA-LENGTH: " + data.data.length);
        if (data.data.length > 2) {
          vm.familyType = '3';
        }
        var i = 1;
        vm.results[0] = {
          name: "",
          images: childMaleAvatarDefaults.slice()
        }

        vm.results[1] = {
          name: "",
          images: adultMaleAvatarDefaults.slice()
        }

        vm.results[2] = {
          name: "",
          images: adultFemaleAvatarDefaults.slice()
        }
        //set avatar defaults
        for (i = 3; i < vm.maxAvatars; ++i) {
          vm.results[i] = {
            name: "",
            images: adultMaleAvatarDefaults.slice()
          };
        }
        // vm.results[0] = {
        //   name: "",
        //   images: childMaleAvatarDefaults.slice()
        // };
        // for (; i < vm.maxAvatars; ++i) {
        //   vm.results[i] = {
        //     name: "",
        //     images: adultMaleAvatarDefaults.slice()
        //   };
        // }
        i = 0;
        if (data.data.length !== 0) {
          for (; i < vm.totalAvatars; ++i) {
            vm.results[i] = {
              name: data.data[i].avatar_name,
              images: data.data[i].image_id_list.split(",")
            };
          }
        } else {
          i = 3;
        }
        for (; i < vm.maxAvatars; ++i) {
          vm.results[i] = {
            name: "",
            images: adultMaleAvatarDefaults.slice()
          };
        }
        if (retract) {
          vm.currentAvatarIndex--;
        } else {
          vm.currentAvatarIndex = 1;
        }
        updateCurrentAvatar();
        if (data.data.length > 0) {
          vm.newAvatar = false;
        }
      });
    };

    vm.getProperties = function(cb) {
      $http({
        method: 'GET',
        url: '/getproperty/MAX_AVATARS'
      }).then(function(data){
        ////console.log(JSON.stringify(data.data));
        vm.maxAvatars = +(data.data[0].property_value);
        sharedProperties.setMaxAvatars(data.data[0].property_value);
        $http({
          method: 'GET',
          url: '/getproperty/MAX_CHILDREN'          
        }).then(function(data){
          vm.maxChildren = +(data.data[0].property_value);
          sharedProperties.setMaxChildren(data.data[0].property_value);
          cb(null);
        });
      });
    };

    vm.getSchema = function(cb) {

      $http({
        method: 'GET',
        url: '/getCurrentProfile'
      }).then(function success(data){
        vm.currentUserProfile = data.data;
      });

      var urlListForPreload = [];

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
            urlListForPreload.push(value.image_location);
            //preloader.preloadImages([value.image_location]);
            vm.imageUrls[value.image_id] = {
              location: value.image_location,
              image_x: value.image_x,
              image_y: value.image_y,
              gender: 'female',
              age: 'adult',
              color_name: value.color_name,
              color_code: value.color_code,
              image_type: item.image_type,
              image_name: value.image_name
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
            urlListForPreload.push(value.image_location);
            //preloader.preloadImages([value.image_location]);
            vm.imageUrls[value.image_id] = {
              location: value.image_location,
              image_x: value.image_x,
              image_y: value.image_y,
              gender: 'female',
              age: 'child',
              color_name: value.color_name,
              color_code: value.color_code,
              image_type: item.image_type
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
            urlListForPreload.push(value.image_location);
            //preloader.preloadImages([value.image_location]);
            vm.imageUrls[value.image_id] = {
              location: value.image_location,
              image_x: value.image_x,
              image_y: value.image_y,
              gender: 'male',
              age: 'child',
              color_name: value.color_name,
              color_code: value.color_code,
              image_type: item.image_type
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
            urlListForPreload.push(value.image_location);
            //preloader.preloadImages([value.image_location]);
            vm.imageUrls[value.image_id] = {
              location: value.image_location,
              image_x: value.image_x,
              image_y: value.image_y,
              gender: 'male',
              age: 'adult',
              color_name: value.color_name,
              color_code: value.color_code,
              image_type: item.image_type
            };
          });
          //console.log("IMG URLS after !!!: " + JSON.stringify(vm.imageUrls));
        });

        vm.results[0] = {
          name: "",
          images: childMaleAvatarDefaults.slice()
        }

        vm.results[1] = {
          name: "",
          images: adultMaleAvatarDefaults.slice()
        }

        vm.results[2] = {
          name: "",
          images: adultFemaleAvatarDefaults.slice()
        }
        //set avatar defaults
        for (var i = 3; i < vm.maxAvatars; ++i) {
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
        preloader.preloadImages(urlListForPreload)
        .then(function(){
          //alert("all images loaded");
          vm.loaded = true;
        });
        cb(null);
      }, function fail(err){
        console.warn(err);
      });
    };

    vm.getSchema(function(){
      vm.getProperties(function(){
        vm.loadSavedAvatars(false);
        $(".color_drop").click(function(){
          var thumbs = $(".color-thumbs");
          thumbs.slideToggle();
        });
      });
    });

    vm.deleteAvatar = function() {
      vm.deleting = true;
      vm.avatarNameError = false;
      //vm.avatarErrorDisplay = false;
      $scope.$broadcast("error:name:off");
      //alert("DELETE TRIGGERED");
      vm.deletePerson(function(){
        vm.loadSavedAvatars(true);
            // alert(vm.currentAvatarIndex);
            // if (vm.currentAvatarIndex == 2) {
            //   alert("second avatar - retract");
            //   console.log("LOGGING RESULTS");
            //   console.log(vm.results);
            //   vm.results[1].name = vm.results[2].name;
            //   vm.results[1].images = vm.results[2].images.slice();
            //   console.log("CHANGES RESULTS");
            //   console.log(vm.results);
            // } else {
            //   alert("third avatar - delete from end");
            //   vm.results[vm.currentAvatarIndex-1].name = "";
            //   vm.results[vm.currentAvatarIndex-1].images = vm.adultMaleAvatarDefaults.images.slice();
            // }
            vm.carousel_index--;
            vm.familyType='2';
      });
    }
    
    vm.deletePerson = function(cb) {
      ////console.log("delete person called");
      vm.currentAvatar.name = vm.currentAvatar.name.split(' ').map(function(word){
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
      var response = {
        user_id: vm.currentUser,
        avatar_name: vm.currentAvatar.name,
        image_id_list: vm.currentAvatar.images.map(function(item){return parseInt(item);}),
        avatar_index: vm.currentAvatarIndex,
        avatar_age: vm.currentAvatar.age,
        birthday: vm.currentAvatar.birthday,
        replace: vm.newAvatar ? null : vm.results[vm.currentAvatarIndex-1].name,
        delete: true
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
        ////console.log("POST request finished");
        if (data.data.result === "success") {
          // vm.results[vm.currentAvatarIndex-1].name = vm.results[vm.currentAvatarIndex].name;
          // vm.results[vm.currentAvatarIndex-1].images = vm.results[vm.currentAvatarIndex].images.slice();
          // vm.familyType = '2';
          if (cb) {
            cb(null);
          }
        } else {
          if (cb) {
            cb("Delete Failed");
          }
        }
        ////console.log(data);
        ////console.log(vm.avatarNames);
        ////console.log(vm.results);
      });
    };

    // $scope.$on("error:name:on", function(){
    //   vm.avatarErrorDisplay = true;
    // });

    // $scope.$on("error:name:off", function(){
    //   vm.avatarErrorDisplay = false;
    // })

    $scope.$on("change:schema", function(){
      vm.switchSchema();
    })

    vm.postPerson = function(cb) {
      //vm.avatarErrorDisplay = false;
      $scope.$broadcast("error:name:off");
      ////console.log("post person called");
      vm.currentAvatar.name = vm.currentAvatar.name.split(' ').map(function(word){
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
      var response = {
        user_id: vm.currentUser,
        avatar_name: vm.currentAvatar.name,
        image_id_list: vm.currentAvatar.images.map(function(item){return parseInt(item);}),
        avatar_index: vm.currentAvatarIndex,
        avatar_age: vm.currentAvatar.age,
        avatar_gender: vm.currentAvatar.gender,
        birthday: vm.currentAvatar.birthday,
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
        ////console.log("POST request finished");
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
        ////console.log(data);
        ////console.log(vm.avatarNames);
        ////console.log(vm.results);
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
          // if (vm.currentAvatarGender === 'child') {
          //   vm.totalChildren++;
          // } 
          updateCurrentAvatar();
          vm.newAvatar = true;
          vm.isPristine = true;
        }
      }
    }

    function retractAvatar() {
      alert("should not be called !!!");
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

    vm.advanceToNextAvatar = function() {
      if (vm.carousel_index < 2) {
        vm.carousel_index++;
      }
    };

    vm.returnToPrevAvatar = function() {
      if (vm.carousel_index > 0) {
        vm.carousel_index--;
      }
    };

    vm.nextAvatar = function() {
      ////console.log("FIRED RIGHT!");
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
      ////console.log("FIRED LEFT!");
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
        ////console.log("test1");
        if (avatarModified()) {
          ////console.log("test2");
          console.log("Current Avatar Name: " + vm.currentAvatar.name); 
          if (vm.currentAvatar.name === undefined) {
            ////console.log("test3");
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

    vm.saveChanges = function(al) {
      if (vm.currentAvatarIndex === vm.totalAvatars) {
        $("#avatar-name-input").focus();
      }
      if (vm.currentAvatar.name === "") {
        vm.error = "Avatar name may not be blank";
        alert("Must enter a name for the current avatar");
        return;
      }
      vm.postPerson(function(){
        if (al === 'alert') {
          alert("Changes saved!");
        }
        $location.path("/previewfamily");
        
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
