"use strict";

var express = require("express");
var router = new express.Router();

var sequelize = require("../db");
var stripe = require("stripe")("sk_test_eExGRjpjgm5wzQFl3WMno3e8");
var geoip = require("geoip-lite");

router.post("/charge", (req, res, next) => {
  var token = req.body.stripeToken;
  console.log("ABOUT TO CHARGE!");
  //console.log("Currency: " + req.session.currency);
  //console.log("Price: " + req.session.price); 
  console.log("admin: " + req.session.admin);
  var geo = geoip.lookup(req.ip);
  //console.log(req.ip);
  //console.log(geo.country);
  getCurrencyAndPrice(geo ? geo.country : "US", function(err, data){
    if (err) next(err);
    req.session.currency = data[0].currency_code;
    req.session.price = data[0].price;
    stripe.charges.create({
      amount: req.session.price, // Amount in cents HAS TO BE SET MANUALLY!
      currency: req.session.currency.toLowerCase(),
      source: token,
      description: "Book purchase",
      receipt_email: req.body.stripeEmail
    }, function(err, charge) {
      if (err && err.type === 'StripeCardError') {
        return next(new Error("the card has been declined"));
      }
      var payload = {
        user_id: req.session.user_id,
        user_email: charge.receipt_email,
        user_addr_ln_1: charge.source.address_line1,
        user_addr_ln_2: charge.source.address_line2,
        user_city: charge.source.address_city,
        user_zip: charge.source.address_zip,
        user_province: charge.source.address_state,
        user_country: charge.source.address_country,
        user_order_id: charge.id
      };
      placeOrderStripe(payload, function(err, data){
        if (err) return next(err);
        if (data.result === "success") {
          res.sendFile(process.cwd() + "/checkout_complete.html");
        } else {
          res.send("Something went wrong check the code");
        }
      });
    });
  });
});

router.get("/getCurrencyAndPrice", function(req, res, next){
  console.log("CURRENCY ROUTE HIT!");
  let geo = geoip.lookup(req.ip);
  getCurrencyAndPrice(geo ? geo.country : "US", function(err, data){
    if (err) next(err);
    req.session.currency = data[0].currency_code;
    req.session.price = data[0].price;
    console.log("Currency: " + req.session.currency);
    console.log("Price: " + req.session.price);
    console.log("admin: " + req.session.admin);
    res.json(data);
  });
});

function getCurrencyAndPrice(countryCode, cb) {
  sequelize.query(
    "call sp_get_currency_price('" +
    countryCode + "')"
    ).then(function(data){
    cb(null, data);
  }).catch(function(err){
    cb(err);
  });    
}

//this calls a stored procedure on successful pay
function placeOrderStripe(payload, cb) {
  sequelize.query(
    "call sp_iu_order('" +
    payload.user_id + "','" + 
    payload.user_email + "','" +
    payload.user_addr_ln_1 + "','" +
    payload.user_addr_ln_2 + "','" +
    payload.user_city + "','" +
    payload.user_zip + "','" +
    payload.user_province + "','" +
    payload.user_country + "','" +
    payload.user_order_id + "','" +
    "stripe')"
    ).then(function(){
    cb(null, {result: "success"});
  }).catch(function(err){
    cb(err);
  });  
}

module.exports = router;