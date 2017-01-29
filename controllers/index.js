"use strict";

module.exports = function(app) {
	app.use("/", require("./schema_api"));
	app.use("/", require("./payment_api"));
};