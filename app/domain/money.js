/* Orbit Biz — integer-safe money helpers */
(() => {
  "use strict";

  const toCents = value => {
    const number = Number(value);
    if (!Number.isFinite(number)) throw new TypeError("Invalid monetary value.");
    return Math.round(number * 100);
  };

  const fromCents = cents => Math.round(Number(cents)) / 100;
  const add = (...values) => fromCents(values.reduce((sum, value) => sum + toCents(value), 0));
  const subtract = (left, right) => fromCents(toCents(left) - toCents(right));
  const multiply = (value, quantity) => fromCents(toCents(value) * Number(quantity));
  const percentage = (value, rate) => multiply(value, Number(rate) / 100);

  window.OrbitBiz = window.OrbitBiz || {};
  window.OrbitBiz.money = Object.freeze({ toCents, fromCents, add, subtract, multiply, percentage });
})();
