"use strict";

module.exports = function(app) {
	app.use("/", require("./schema_api"));
};