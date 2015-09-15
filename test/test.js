/**
 * Created by glickm on 9/14/15.
 */
var assert = require("assert");
var feeCalculator = require("../index.js");

describe('Fee Calculator', function() {
  var itemSpecsAndFees = [
    {
      ASIN: 1612184146,
      price: 60,
      category: "Books",
      weight: 16.8,
      dimensions: [9.69, 8.66, 6.69],
      fee: 18.59},
    {
      ASIN: "B00TEP32ES",
      price: 10,
      category: "Health & Personal Care",
      weight: .3,
      dimensions: [6.9, 5.1, 1.2],
      fee: 5.82},
    {
      ASIN: "Health & Personal Care",
      price: 60,
      category: "Books",
      weight: 16.8,
      dimensions: [9.69, 8.66, 6.69],
      fee: 18.59
  }];

  it('should be valid for all of the items', function () {
    itemSpecsAndFees.forEach(function (item) {
      feeCalculator.calculateFee(item.price, item.category, item.weight, item.dimensions, function (fee) {
        assert.equal(fee, item.fee);
      })
    });
  });
});