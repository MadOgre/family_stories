"use strict";
var Sequelize = require("sequelize");
var sequelize = new Sequelize("mysql://sunjay:bluejeans@familystories.crz3gl4roidf.us-west-2.rds.amazonaws.com/familystories");

sequelize.authenticate().then(function(){
  console.log("SUCCESS");
}).catch(function(err){
  console.log(err.name);
});

module.exports = sequelize;