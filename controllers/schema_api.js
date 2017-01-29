"use strict";

var express = require("express");
var router = new express.Router();

var sequelize = require("../db");

router.get("/getAdultMaleParts", function(req, res){
  getBodyParts("ADULT_MALE", function(err, result){
    if (err) {
      return res.status(500).send("<h1>Server Error</h1>");
    }
    res.json(result);
  });
});

router.get("/getAdultfemaleParts", function(req, res){
  getBodyParts("ADULT_FEMALE", function(err, result){
    if (err) {
      return res.status(500).send("<h1>Server Error</h1>");
    }
    res.json(result);
  });
});

router.get("/getMaleChildParts", function(req, res){
  getBodyParts("CHILD_MALE", function(err, result){
    if (err) {
      return res.status(500).send("<h1>Server Error</h1>");
    }
    res.json(result);
  });
});

router.get("/getFemaleChildParts", function(req, res){
  getBodyParts("CHILD_FEMALE", function(err, result){
    if (err) {
      return res.status(500).send("<h1>Server Error</h1>");
    }
    res.json(result);
  });
});

function getBodyParts(which, cb) {
  sequelize.query("call sp_default_body_parts('" + which + "')").then(function(data){
    var result = [];
    data.forEach(function(item){
      if (result.findIndex(function(queryitem){
        return queryitem.image_type === item.image_type;
      }) === -1) {
        result.push({
          image_type: item.image_type,
          image_type_label: item.image_type_label,
          values: []
        });
      }
      result[result.length-1].values.push({
        image_name: item.image_name,
        image_id: item.image_id,
        image_location: item.image_location,
        image_category: item.image_category,
        image_x: item.image_x,
        image_y: item.image_y,
        color_name: item.color_name,
        color_code: item.color_code,
        icon_location: item.icon_location
      });
    });
    cb(null, result);
  }).catch(function(err){
    cb(err);
  });  
}

module.exports = router;