var express = require("express");
var Sequelize = require("sequelize");
var cors = require("cors");

var sequelize = new Sequelize("mysql://sunjay:bluejeans@familystories.crz3gl4roidf.us-west-2.rds.amazonaws.com/familystories");

sequelize.authenticate().then(function(){
  console.log("SUCCESS");
}).catch(function(err){
  console.log(err.name);
});

var app = express();

app.use(cors());

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
        })
      }
      result[result.length-1].values.push({
        image_name: item.image_name,
        image_id: item.image_id,
        image_location: item.image_location,
        image_category: item.image_category,
        image_x: item.image_x,
        image_y: item.image_y
      });
    });
    cb(null, result);
  }).catch(function(err){
    cb(err);
  });  
}

app.get("/getAdultMaleParts", function(req, res){
  getBodyParts("ADULT_MALE", function(err, result){
    if (err) {
      return res.status(500).send("<h1>Server Error</h1>");
    }
    res.json(result);
  });
});

app.get("/getAdultfemaleParts", function(req, res){
  getBodyParts("ADULT_FEMALE");
});

app.get("/getAdultChildParts", function(req, res){
  getBodyParts("ADULT_MALE");
});



app.listen(3000);