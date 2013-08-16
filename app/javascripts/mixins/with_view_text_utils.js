/*global define*/
'use strict';

define([
  'jquery',
  'underscore'
], function($, _) {

  function increment(elem, currentNum, targetNum) {
    var newNum = currentNum + 1;
    elem.textContent = newNum;

    if (newNum < targetNum) {
      setTimeout(_.bind(increment, null, elem, newNum, targetNum), 15);
    }
  }
  function decrement(elem, currentNum, targetNum) {
    var newNum = currentNum - 1;
    elem.textContent = newNum;

    if (newNum > targetNum) {
      setTimeout(_.bind(decrement, null, elem, newNum, targetNum), 15);
    }
  }

  return {
    animateNumberElem: function (elem, num) {
      var domElem = $(elem)[0],
          currentNum = parseInt(domElem.textContent, 10) || 0,
          targetNum = num;

      if (currentNum < targetNum) {
        increment(domElem, currentNum, targetNum);
      } else if (currentNum > targetNum) {
        decrement(domElem, currentNum, targetNum);
      }
    }
  };
});