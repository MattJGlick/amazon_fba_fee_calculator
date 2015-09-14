/**
 * Created by glickm on 9/14/15.
 */
var config = require('config');
var fees = require('./constants/category-fees');

// takes the price of the product, weight and dimensions and determines how much will be paid after fees
exports.calculateFee = function(price, category, weight, dimensions, callback) {
  var percentageFee = 0;
  var flatFee = 0;
  var weightHandlingFee = 0;
  var storageFee = 0;
  var orderHandlingFee = 1;
  var pickAndPackFee = 1.04;
  var afterFee = price;

  // check if category is in fees
  if(category in fees.percentageFee) {
    // determine fee percentage
    // determine flat fee
    flatFee = fees.minimumFee[category];
    percentageFee = fees.percentageFee[category] / 100;
  } else {
    flatFee = fees.minimumFee["Everything Else"];
    percentageFee = fees.percentageFee["Everything Else"] / 100;
  }

  if((percentageFee * price) < flatFee) {
    afterFee -= flatFee;
  } else {
    afterFee -= price * percentageFee;
  }

  // going to default this to $1, but this should be different for media
  // order handling
  afterFee -= orderHandlingFee;

  // pick and pack fee
  afterFee -= pickAndPackFee;

  // weight handling
  // for small stardard size its just .50, dont know how to tell the difference
  //Large Standard-Size	1 lb.	$0.63
  //2 lb.	$1.59
  //Over 2 lb.	$1.59 + $0.39/lb. above the first 2 lb
  if(weight < 1) {
    weightHandlingFee = .63
  } else if(weight < 2) {
    weightHandlingFee = 1.59;
  } else {
    weightHandlingFee = 1.59 * (.39 * (weight - 2));
  }

  afterFee -= weightHandlingFee;

  // 30 day storage
  // jan - sep: .51 / cubic foot
  // oct - dec: .68 / cubic foot
  var currentDate = new Date();
  var currentMonth = currentDate.getMonth();
  var cubicFeet = (dimensions[0] / 12) * (dimensions[1] / 12) * (dimensions[2] / 12);

  if(currentMonth > 0 && currentMonth < 9) {
    storageFee = (.51 * cubicFeet);
  } else {
    storageFee = (.68 * cubicFeet);
  }

  afterFee -= storageFee;

  // inbound shipping
  afterFee -= (config.get('inboundShippingPerPound') * weight);

  callback(afterFee.toFixed(2));
};

exports.calculateFee(20, "3D Printed Products", 1, [1, 1, 1], function (results) {
  console.log(results);
});
