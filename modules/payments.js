/* =========================================================
   ORBIT BIZASSIST — PAYMENT ENGINE
   Cash / UPI / Card / Bank / Credit
   Split payment ready
   ========================================================= */

(() => {
  "use strict";

  const METHODS = Object.freeze([
    "Cash",
    "UPI",
    "Card",
    "Bank Transfer",
    "Credit"
  ]);

  const round = value =>
    Math.round(
      (Number(value) + Number.EPSILON) * 100
    ) / 100;

  function normalizePayments(
    payments = []
  ) {
    return payments
      .map(payment => ({
        method: METHODS.includes(
          payment.method
        )
          ? payment.method
          : "Cash",

        amount: round(
          Math.max(
            0,
            Number(payment.amount) || 0
          )
        ),

        reference:
          String(
            payment.reference || ""
          ).trim()
      }))
      .filter(
        payment => payment.amount > 0
      );
  }

  function summarize(
    payments,
    total
  ) {
    const normalized =
      normalizePayments(payments);

    const target = round(
      Math.max(
        0,
        Number(total) || 0
      )
    );

    const paid = round(
      normalized.reduce(
        (sum, payment) =>
          sum + payment.amount,
        0
      )
    );

    const due = round(
      Math.max(
        0,
        target - paid
      )
    );

    const change = round(
      Math.max(
        0,
        paid - target
      )
    );

    return {
      payments: normalized,
      target,
      paid,
      due,
      change,
      settled: paid >= target
    };
  }

  function validate(
    payments,
    total
  ) {
    const summary =
      summarize(
        payments,
        total
      );

    if (!summary.payments.length) {
      throw new Error(
        "Add at least one payment."
      );
    }

    if (!summary.settled) {
      throw new Error(
        `Payment is short by ${
          window.money
            ? window.money(summary.due)
            : summary.due
        }`
      );
    }

    return summary;
  }

  window.PaymentEngine =
    Object.freeze({
      METHODS,
      normalizePayments,
      summarize,
      validate
    });
})();
