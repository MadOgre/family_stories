var express = require("express");
var Sequelize = require("sequelize");
var cors = require("cors");
var bp = require("body-parser");
var session = require("express-session");
var crypto = require("crypto");

var sequelize = new Sequelize("mysql://sunjay:bluejeans@familystories.crz3gl4roidf.us-west-2.rds.amazonaws.com/familystories");

sequelize.authenticate().then(function(){
  console.log("SUCCESS");
}).catch(function(err){
  console.log(err.name);
});

var app = express();

app.use(cors());

app.use(bp.json());
app.use(bp.urlencoded({extended: true}));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 5 * 60000
  }
  
}));

function setId(req, res, next){
  if (!req.session.user_id) {
    crypto.randomBytes(16, function(err, buffer) {
      console.log("creating id");
      req.session.user_id = buffer.toString('hex');
      console.log(JSON.stringify(req.session));
      next();
    });
  } else {
    console.log("retaining id");
    console.log(JSON.stringify(req.session));
    next();
  }
};

app.use("/", setId, express.static(__dirname + "/public"));

app.use("/preview", express.static("/var/www/familystories/book_output"));

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

function setUserSelection(payload, cb) {
  sequelize.query(
    "call sp_iu_user_default_images('" +
    payload.user_id + "','" + 
    payload.avatar_name + "','" +
    payload.image_id_list + "'," +
    (payload.replace ? "'" + payload.replace + "'" : null) + ")").then(function(){
    cb(null, {result: "success"});
  }).catch(function(err){
    cb(err);
  });  
}

function getSystemProperty(property, cb) {
  sequelize.query("call sp_get_system_properties('" + property + "')").then(function(data){
    cb(data);
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
  getBodyParts("ADULT_FEMALE", function(err, result){
    if (err) {
      return res.status(500).send("<h1>Server Error</h1>");
    }
    res.json(result);
  });
});

app.get("/getChildParts", function(req, res){
  getBodyParts("CHILD", function(err, result){
    if (err) {
      return res.status(500).send("<h1>Server Error</h1>");
    }
    res.json(result);
  });
});

app.post("/setUserSelection", function(req, res){
  console.log("POST REQUEST INCOMING");
  var payload = req.body;
  payload.user_id = req.session.user_id;
  setUserSelection(payload, function(err, result){
    if (err) return res.status(500).json({result: "Server Error"});
    res.json(result);
  })
});

app.get("/getproperty/:property", function(req, res){
  console.log("GETTING PROPERTY...");
  getSystemProperty(req.params.property, function(value){
    res.json(value);
  });
});

app.get("*", setId, function(req, res){
  
  res.sendFile(__dirname + "/public/index.html");
});



app.listen(3000);