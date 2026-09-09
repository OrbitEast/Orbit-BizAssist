/* Orbit Biz — small, dependency-free validation helpers */
(() => {
  "use strict";

  const required = (value, field) => {
    if (value === null || value === undefined || String(value).trim() === "") {
      throw new Error(`${field} is required.`);
    }
    return value;
  };

  const positiveMoney = (value, field = "Amount") => {
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0) {
      throw new Error(`${field} must be a valid non-negative amount.`);
    }
    return Math.round(number * 100) / 100;
  };

  const positiveInteger = (value, field = "Quantity") => {
    const number = Number(value);
    if (!Number.isInteger(number) || number < 0) {
      throw new Error(`${field} must be a valid non-negative whole number.`);
    }
    return number;
  };

  window.OrbitBiz = window.OrbitBiz || {};
  window.OrbitBiz.validate = Object.freeze({
    required,
    positiveMoney,
    positiveInteger
  });
})();
