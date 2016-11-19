/* global $ */
"use strict";

$('#myTabs a').click(function (e) {
  e.preventDefault();
  $(this).tab('show');
});

// window.onload = function() {
//   $(".loading-overlay").hide();
// }