/**
 * Created by glickm on 9/14/15.
 */
var config = require('config');
var fees = require('./constants/category-fees');
var _ = require('lodash');

// takes the price of the product, weight and dimensions and determines how much will be paid after fees
exports.calculateFee = function(price, category, weight, dimensions, callback) {
  var isMedia = false;
  var size;
  var feeTotal = 0;

  feeTotal = calculateReferralFee(price, category);

  feeTotal += calculateVariableReferralFee(category);

  // is it media?
  if(category in fees.variableClosingFee) {
    isMedia = true;
  }

  size = getSize(dimensions, weight, isMedia);

  feeTotal += calculateOrderHandlingFee(size, isMedia);

  feeTotal += calculatePickAndPackFee(size);

  feeTotal += calculateWeightHandling(size, weight, isMedia);

  feeTotal += calculateThirtyDayStorage(dimensions);

  // inbound shipping
  //feeTotal += (config.get('inboundShippingPerPound') * weight);

  callback(parseFloat(feeTotal.toFixed(2)));
};

function calculateReferralFee(price, category) {
  var flatFee = 0;
  var percentageFee = 0;
  var referralFee = 0;

  // check if category is in fees
  if (category in fees.percentageFee) {
    flatFee = fees.minimumFee[category];
    percentageFee = fees.percentageFee[category] / 100;
  } else {
    flatFee = fees.minimumFee["Everything Else"];
    percentageFee = fees.percentageFee["Everything Else"] / 100;
  }

  if ((percentageFee * price) < flatFee) {
    referralFee += flatFee;
  } else {
    referralFee += price * percentageFee;
  }

  if (config.get("log")) {
    console.log("Referral Fee:    \t", referralFee);
  }

  return referralFee;
}

function calculateVariableReferralFee (category) {
  var variableClosingFee = 0;

  // check to see if this category has a variable closing fee
  if(category in fees.variableClosingFee) {
    variableClosingFee = fees.variableClosingFee[category];
  }

  if(config.get("log")) {
    console.log("Variable Closing Fee: \t", variableClosingFee);
  }

  return variableClosingFee;
}

function getSize (dimensions, weight, isMedia) {
  var size = false;

  var maxLargeStandardDimensions = config.get("maxLargeStandardDimensions");
  var maxSmallStandardDimensions = config.get("maxSmallStandardDimensions");
  var maxSmallOversizeDimensions = config.get("maxSmallOversizeDimensions");

  _.sortBy(dimensions);


  // does it exceed the max dimensions for small?
  dimensions.forEach(function (dimension, index) {
    if(dimension < maxSmallStandardDimensions[index]) {
      if((isMedia && weight < config.get("maxSmallStandardMediaWeight")) || (weight < config.get("maxSmallStandardNonMediaWeight"))) {
        size = "Small Standard";
      }
    }
  });

  // if its not small, is it large?
  if(!size) {
    dimensions.forEach(function (dimension, index) {
      if(dimension < maxLargeStandardDimensions[index]) {
        if(weight < config.get("maxLargeStandardWeight")) {
          size = "Large Standard";
        }
      }
    });
  }

  // check for small oversize
  if(!size) {
    dimensions.forEach(function (dimension, index) {
      if(dimension < maxSmallOversizeDimensions[index]) {
        if(weight < config.get("maxSmallOversizeWeight")) {
          size = "Small Oversize";
        }
      }
    });
  }

  return size;
}

function calculateOrderHandlingFee(size, isMedia) {
  var orderHandlingFee = 0;

  if(!isMedia && (size === "Small Standard" || size === "Large Standard")) {
    orderHandlingFee = 1;
  }

  if(config.get("log")) {
    console.log("Order Handling Fee: \t", orderHandlingFee);
  }

  return orderHandlingFee;
}

function calculatePickAndPackFee(size) {
  var pickAndPackFee = 0;

  if(size === "Small Standard" || size === "Large Standard") {
    pickAndPackFee = 1.04;
  } else if(size === "Small Oversize") {
    pickAndPackFee = 4.05;
  }

  if(config.get("log")) {
    console.log("Pick and Pack Fee: \t", pickAndPackFee);
  }

  return pickAndPackFee;
}

function calculateWeightHandling(size, weight, isMedia) {
  var weightHandlingFee = 0;

  if(size === "Small Standard") {
    weightHandlingFee = .50
  } else if (size === "Large Standard") {
    if(weight < 1) {
      weightHandlingFee = .63;
    } else if (weight < 2) {
      if(isMedia) {
        weightHandlingFee = .88;
      } else {
        weightHandlingFee = 1.59;
      }
    } else {
      if(isMedia) {
        weightHandlingFee = .88 + ((weight - 2) * .41);
      } else {
        weightHandlingFee = 1.59 + ((weight - 2) * .39);
      }
    }
  } else if (size === "Small Oversize") {
    weightHandlingFee = 1.59 + ((weight - 2) * .39);
  }

  if(config.get("log")) {
    console.log("Weight Handling Fee: \t", weightHandlingFee.toFixed(2));
  }

  return weightHandlingFee;
}

function calculateThirtyDayStorage(dimensions) {
  // 30 day storage
  // jan - sep: .51 / cubic foot
  // oct - dec: .68 / cubic foot
  var storageFee = 0;

  var currentDate = new Date();
  var currentMonth = currentDate.getMonth();
  var cubicFeet = (dimensions[0] / 12) * (dimensions[1] / 12) * (dimensions[2] / 12);

  if (currentMonth > 0 && currentMonth < 9) {
    storageFee = (.51 * cubicFeet);
  } else {
    storageFee = (.68 * cubicFeet);
  }

  if(config.get("log")) {
    console.log("Storage Fee:    \t", storageFee.toFixed(2));
  }

  return storageFee;
}