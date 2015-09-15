/**
 * Created by glickm on 9/14/15.
 */
var assert = require("assert");
var feeCalculator = require("../index.js");

describe('Fee Calculator', function() {
  var itemSpecsAndFees = [
    {
      ASIN: "B00TEP32ES",
      price: 10,
      category: "Health & Personal Care",
      weight: .3,
      dimensions: [6.9, 5.1, 1.2],
      fee: 4.18},
    {
      ASIN: "B007T3Y2SW",
      price: 10,
      category: "Kitchen",
      weight: .02,
      dimensions: [6.3, 4, 3.5],
      fee: 4.20},
    {
      ASIN: "B00KWFCSB2",
      price: 10,
      category: "Video Games",
      weight: .5,
      dimensions: [7.6, 5.5, .8],
      fee: 4.53},
    {
      ASIN: "B00NNU07RU",
      price: 100,
      category: "Video Game Consoles",
      weight: 9.7,
      dimensions: [12.1, 11.5, 7.3],
      fee: 14.85},
    {
      ASIN: 1612184146,
      price: 60,
      category: "Books",
      weight: 16.8,
      dimensions: [9.69, 8.66, 6.69],
      fee: 18.59},
    {
      ASIN: "B00J44L7LY",
      price: 10,
      category: "Beauty",
      weight: .02,
      dimensions: [4.8, .9, .8],
      fee: 4.17},
    {
      ASIN: "B001BLX9DM",
      price: 7,
      category: "Office Products",
      weight: 1.85,
      dimensions: [11.9, 4.2, 2.2],
      fee: 4.71},
    {
      ASIN: "B00AB5QISC",
      price: 6,
      category: "Industrial & Scientific (including Food Service and Janitorial & Sanitation)",
      weight: .05,
      dimensions: [1.5, 1.5, .3],
      fee: 3.54}
  ];

  it('should be valid for all of the items', function () {
    itemSpecsAndFees.forEach(function (item) {
      feeCalculator.calculateFee(item.price, item.category, item.weight, item.dimensions, function (fee) {
        assert.equal(fee, item.fee);
      })
    });
  });
});