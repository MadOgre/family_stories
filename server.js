"use strict";
var express = require("express");
var Sequelize = require("sequelize");
var cors = require("cors");
var bp = require("body-parser");
var session = require("express-session");
var crypto = require("crypto");
//var passport = require("passport");
//var PayPalStrategy = require("passport-paypal-openidconnect").Strategy;
var request = require("request");
var qs = require("querystring");

var config = require("./config.js");

var sequelize = new Sequelize("mysql://sunjay:bluejeans@familystories.crz3gl4roidf.us-west-2.rds.amazonaws.com/familystories");

var paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AXuDrSL5vYOdb9v_jbN3k5M7N5kI9rs-9oZhQBlBYRl2DOrvN6PbFDhNAJcl78anX88BPX1ZAo8tf-gi',
  'client_secret': 'EEb9YEw2w5T91b7d6Cqqr3HsrQGp3wYabNWOIeZTM65g9tFK2KwwN2W71ssPQgpTFlhgM6CRUYRHz3Au',
  'openid_client_id': 'AXuDrSL5vYOdb9v_jbN3k5M7N5kI9rs-9oZhQBlBYRl2DOrvN6PbFDhNAJcl78anX88BPX1ZAo8tf-gi',
  'openid_client_secret': 'EEb9YEw2w5T91b7d6Cqqr3HsrQGp3wYabNWOIeZTM65g9tFK2KwwN2W71ssPQgpTFlhgM6CRUYRHz3Au',
  'openid_redirect_uri': config.base_url + '/auth/callback'
});

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

// app.use(passport.initialize());
// app.use(passport.session());


// passport.use(new PayPalStrategy({
//     clientID: 'AXuDrSL5vYOdb9v_jbN3k5M7N5kI9rs-9oZhQBlBYRl2DOrvN6PbFDhNAJcl78anX88BPX1ZAo8tf-gi',
//     clientSecret: 'EEb9YEw2w5T91b7d6Cqqr3HsrQGp3wYabNWOIeZTM65g9tFK2KwwN2W71ssPQgpTFlhgM6CRUYRHz3Au',
//     callbackURL: "callback",
//     authorizationURL: "https://www.sandbox.paypal.com/webapps/auth/protocol/openidconnect/v1/authorize",
//     tokenURL: "https://www.sandbox.paypal.com/webapps/auth/protocol/openidconnect/v1/tokenservice",
//     profileURL: "https://www.sandbox.paypal.com/webapps/auth/protocol/openidconnect/v1/userinfo",
//     //passReqInCallback: true
//   },
//   function(accessToken, refreshToken, profile, done) {
//     // User.findOrCreate({ paypalId: profile.id }, function (err, user) {
//     //   return done(err, user);
//     // });
//      console.log("CALLBACK CALLED!");
//      req.session.passport.profile = profile;
//      console.log("HEADHEADHEAD: ", profile);
//     return done(null, profile);
//   }
// ));

function setId(req, res, next){
  if (!req.session.user_id) {
    crypto.randomBytes(16, function(err, buffer) {
      console.log("creating id");
      req.session.user_id = buffer.toString('hex');
  //    console.log(JSON.stringify(req.session));
      next();
    });
  } else {
    console.log("retaining id");
 //   console.log(JSON.stringify(req.session));
    next();
  }
}

//app.use("/", setId, express.static(__dirname + "/public"));

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
        });
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
  });
});

app.get("/getproperty/:property", function(req, res){
  console.log("GETTING PROPERTY...");
  getSystemProperty(req.params.property, function(value){
    res.json(value);
  });
});

app.get("/getCurrentId", function(req, res){
  res.json(req.session.user_id);
});

app.get("/getCurrentProfile", function(req, res){
  res.json(req.session.profile || null);
});

// app.get("/auth", function(req, res, next){
//   req.session.profile = "hello";
//   next();
// });

app.get("/buy", function(req, res){
  var payload = {
    METHOD: "SetExpressCheckout",
    PAYMENTREQUEST_0_CURRENCYCODE: "USD",
    USER: "msemko-facilitator_api1.gmail.com",
    PWD: "YEGHAJV6CYCVWV3S",
    PAYMENTREQUEST_0_AMT: 10,
    RETURNURL: config.base_url + "/confirmpurchase",
    SIGNATURE: "ASfrEla.u88dRza2.YeVJFSJFgEeA0cnEQhJjG6zzU7GlMvnGX6K4tc7",
    VERSION: "106.0",
    PAYMENTREQUEST_0_PAYMENTACTION: "Sale",
    CANCELURL: config.base_url,
    SOLUTIONTYPE: "Sole"
  };
  request('https://api-3t.sandbox.paypal.com/nvp?' + qs.stringify(payload), function (error, response, body) {
    if (error) res.json(error);
    if (!error && response.statusCode == 200) {
      res.redirect("https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=" + qs.parse(body).TOKEN);
    }
  });
});

app.get("/confirmpurchase", function(req, res){
  var payload = {
    METHOD: "GetExpressCheckoutDetails",
    USER: "msemko-facilitator_api1.gmail.com",
    PWD: "YEGHAJV6CYCVWV3S",
    SIGNATURE: "ASfrEla.u88dRza2.YeVJFSJFgEeA0cnEQhJjG6zzU7GlMvnGX6K4tc7",
    VERSION: "106.0",
    TOKEN: req.query.token
  };
  request("https://api-3t.sandbox.paypal.com/nvp?" + qs.stringify(payload), function(error, response, body){
    req.session.paymentinfo = qs.parse(body);
    res.redirect("/getpreview");
  });  
});

app.get("/getPaymentInfo", function(req, res){
  if (req.session.paymentinfo) {
    res.json(req.session.paymentinfo);
  } else {
    res.json(null);
  }
});

app.get("/finalizetransaction", function(req, res){
  var payload = {
    METHOD: "DoExpressCheckoutPayment",
    USER: "msemko-facilitator_api1.gmail.com",
    PWD: "YEGHAJV6CYCVWV3S",
    SIGNATURE: "ASfrEla.u88dRza2.YeVJFSJFgEeA0cnEQhJjG6zzU7GlMvnGX6K4tc7",
    VERSION: "106.0",
    TOKEN: req.session.paymentinfo.TOKEN,
    PAYMENTREQUEST_0_PAYMENTACTION: req.session.paymentinfo.PAYMENTREQUEST_0_PAYMENTACTION,
    PAYERID: req.session.paymentinfo.PAYERID,
    PAYMENTREQUEST_0_AMT: req.session.paymentinfo.PAYMENTREQUEST_0_AMT,
    PAYMENTREQUEST_0_ITEMAMT: req.session.paymentinfo.PAYMENTREQUEST_0_ITEMAMT,
    PAYMENTREQUEST_0_SHIPPINGAMT: req.session.paymentinfo.PAYMENTREQUEST_0_SHIPPINGAMT,
    PAYMENTREQUEST_0_TAXAMT: req.session.paymentinfo.PAYMENTREQUEST_0_TAXAMT,
    PAYMENTREQUEST_0_CURRENCYCODE: req.session.paymentinfo.PAYMENTREQUEST_0_CURRENCYCODE,
    PAYMENTREQUEST_0_DESC: req.session.paymentinfo.PAYMENTREQUEST_0_DESC,
    L_PAYMENTREQUEST_0_NAME0: req.session.paymentinfo.L_PAYMENTREQUEST_0_NAME0,
    L_PAYMENTREQUEST_0_AMT0: req.session.paymentinfo.L_PAYMENTREQUEST_0_AMT0,
    L_PAYMENTREQUEST_0_NUMBER0: req.session.paymentinfo.L_PAYMENTREQUEST_0_NUMBER0,
    L_PAYMENTREQUEST_0_QTY0: req.session.paymentinfo.L_PAYMENTREQUEST_0_QTY0,
    L_PAYMENTREQUEST_0_NAME1: req.session.paymentinfo.L_PAYMENTREQUEST_0_NAME1,
    L_PAYMENTREQUEST_0_AMT1: req.session.paymentinfo.L_PAYMENTREQUEST_0_AMT1,
    L_PAYMENTREQUEST_0_NUMBER1: req.session.paymentinfo.L_PAYMENTREQUEST_0_NUMBER1,
    L_PAYMENTREQUEST_0_QTY1: req.session.paymentinfo.L_PAYMENTREQUEST_0_QTY1

  };
  request("https://api-3t.sandbox.paypal.com/nvp?" + qs.stringify(payload), function(error, response, body){
    req.session.paymentinfo = null;
    res.json(qs.parse(body));
    //res.redirect("http://localhost:3000/getpreview");
  });   
});

app.get("/auth", function(req, res){
  console.log("AUTH HIT");
  var url = paypal.openIdConnect.authorizeUrl({'scope': 'openid profile email'});
  res.redirect(url);
});

app.get('/auth/callback', function(req, res) {
  var code = req.query.code;
    paypal.openIdConnect.tokeninfo.create(code, function(error, tokeninfo){
      paypal.openIdConnect.userinfo.get(tokeninfo.access_token, function(error, userinfo){
        //res.json(userinfo);
        req.session.profile = userinfo;
        res.redirect("/");
      });
    });  
    // console.log("PROFILE", req.session.passport);
    // // Successful authentication, redirect home.
    // res.redirect('/');
  });

// app.get("/login", function(req, res){
//   res.cookie('user_profile' , randomNumber, { maxAge: 900000, httpOnly: true });
// });

app.get("*", setId, function(req, res){
  
  res.sendFile(__dirname + "/public/index.html");
});



app.listen(3000);
