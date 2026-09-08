/* =========================================================
   ORBIT BIZASSIST — PAYMENT ENGINE
   Production payment calculation + validation layer

   Supports:
   • Cash
   • UPI
   • Card
   • Bank Transfer
   • Credit / Khata
   • Split payments
   • Partial payments
   • Change
   • Refunds
   • Reversals
   • Payment references / UTR
   • Cash reconciliation helpers
   ========================================================= */

(() => {
  "use strict";


  /* -------------------------------------------------------
     CONSTANTS
     ------------------------------------------------------- */

  const METHODS = Object.freeze([
    "Cash",
    "UPI",
    "Card",
    "Bank Transfer",
    "Credit"
  ]);

  const PAYMENT_STATUSES = Object.freeze([
    "pending",
    "paid",
    "partial",
    "refunded",
    "reversed",
    "failed"
  ]);


  /* -------------------------------------------------------
     HELPERS
     ------------------------------------------------------- */

  const round = value =>
    Math.round(
      (Number(value) + Number.EPSILON) * 100
    ) / 100;


  const number = value => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };


  const positive = value =>
    Math.max(0, number(value));


  const cleanText = value =>
    String(value || "").trim();


  const validMethod = method =>
    METHODS.includes(method)
      ? method
      : "Cash";


  /* -------------------------------------------------------
     PAYMENT ID
     ------------------------------------------------------- */

  function createPaymentId() {
    return (
      `pay-${Date.now()}-` +
      Math.random()
        .toString(36)
        .slice(2, 9)
    );
  }


  /* -------------------------------------------------------
     NORMALIZE PAYMENTS
     ------------------------------------------------------- */

  function normalizePayments(
    payments = []
  ) {
    if (!Array.isArray(payments)) {
      return [];
    }

    return payments
      .map(payment => ({
        id:
          payment.id ||
          createPaymentId(),

        method:
          validMethod(
            payment.method
          ),

        amount:
          round(
            positive(
              payment.amount
            )
          ),

        reference:
          cleanText(
            payment.reference ||
            payment.utr ||
            payment.transactionId
          ),

        note:
          cleanText(
            payment.note
          ),

        status:
          PAYMENT_STATUSES.includes(
            payment.status
          )
            ? payment.status
            : "paid",

        receivedAt:
          payment.receivedAt ||
          new Date().toISOString()
      }))
      .filter(
        payment =>
          payment.amount > 0
      );
  }


  /* -------------------------------------------------------
     SUMMARIZE PAYMENT
     ------------------------------------------------------- */

  function summarize(
    payments = [],
    total = 0
  ) {
    const normalized =
      normalizePayments(
        payments
      );

    const target =
      round(
        positive(total)
      );

    const paid =
      round(
        normalized.reduce(
          (sum, payment) =>
            sum + payment.amount,
          0
        )
      );

    const due =
      round(
        Math.max(
          0,
          target - paid
        )
      );

    const change =
      round(
        Math.max(
          0,
          paid - target
        )
      );

    const exact =
      round(paid) ===
      round(target);

    const settled =
      paid >= target;

    const partial =
      paid > 0 &&
      paid < target;

    let status =
      "pending";

    if (settled) {
      status = "paid";
    } else if (partial) {
      status = "partial";
    }

    const byMethod = {};

    normalized.forEach(
      payment => {
        byMethod[payment.method] =
          round(
            (byMethod[payment.method] || 0) +
            payment.amount
          );
      }
    );

    return {
      payments: normalized,

      target,

      paid,

      due,

      change,

      exact,

      settled,

      partial,

      status,

      byMethod
    };
  }


  /* -------------------------------------------------------
     VALIDATE PAYMENT
     ------------------------------------------------------- */

  function validate(
    payments = [],
    total = 0,
    options = {}
  ) {
    const summary =
      summarize(
        payments,
        total
      );

    const allowPartial =
      Boolean(
        options.allowPartial
      );

    const allowCredit =
      Boolean(
        options.allowCredit
      );

    if (
      !summary.payments.length
    ) {
      throw new Error(
        "Add at least one payment."
      );
    }

    if (
      summary.partial &&
      !allowPartial
    ) {
      const formatted =
        window.money
          ? window.money(
              summary.due
            )
          : summary.due;

      throw new Error(
        `Payment is short by ${formatted}`
      );
    }

    if (
      !summary.settled &&
      !summary.partial
    ) {
      throw new Error(
        "Payment amount is invalid."
      );
    }

    const hasCredit =
      summary.payments.some(
        payment =>
          payment.method ===
          "Credit"
      );

    if (
      hasCredit &&
      !allowCredit &&
      !summary.settled
    ) {
      throw new Error(
        "Credit payment requires customer credit handling."
      );
    }

    return summary;
  }


  /* -------------------------------------------------------
     SPLIT PAYMENT BUILDER
     ------------------------------------------------------- */

  function addPayment(
    payments = [],
    payment = {}
  ) {
    const next =
      normalizePayments(
        payments
      );

    const amount =
      positive(
        payment.amount
      );

    if (amount <= 0) {
      return next;
    }

    next.push({
      id:
        payment.id ||
        createPaymentId(),

      method:
        validMethod(
          payment.method
        ),

      amount:
        round(amount),

      reference:
        cleanText(
          payment.reference ||
          payment.utr ||
          payment.transactionId
        ),

      note:
        cleanText(
          payment.note
        ),

      status:
        "paid",

      receivedAt:
        payment.receivedAt ||
        new Date().toISOString()
    });

    return next;
  }


  function removePayment(
    payments = [],
    paymentId
  ) {
    return normalizePayments(
      payments
    ).filter(
      payment =>
        payment.id !==
        paymentId
    );
  }


  /* -------------------------------------------------------
     PAYMENT METHOD TOTAL
     ------------------------------------------------------- */

  function methodTotal(
    payments = [],
    method
  ) {
    return round(
      normalizePayments(
        payments
      )
        .filter(
          payment =>
            payment.method ===
            method
        )
        .reduce(
          (sum, payment) =>
            sum + payment.amount,
          0
        )
    );
  }


  /* -------------------------------------------------------
     CASH / NON-CASH BREAKDOWN
     ------------------------------------------------------- */

  function breakdown(
    payments = []
  ) {
    const normalized =
      normalizePayments(
        payments
      );

    const cash =
      methodTotal(
        normalized,
        "Cash"
      );

    const upi =
      methodTotal(
        normalized,
        "UPI"
      );

    const card =
      methodTotal(
        normalized,
        "Card"
      );

    const bank =
      methodTotal(
        normalized,
        "Bank Transfer"
      );

    const credit =
      methodTotal(
        normalized,
        "Credit"
      );

    const nonCash =
      round(
        upi +
        card +
        bank
      );

    return {
      cash,
      upi,
      card,
      bankTransfer: bank,
      credit,
      nonCash,

      total:
        round(
          cash +
          nonCash +
          credit
        )
    };
  }


  /* -------------------------------------------------------
     CHANGE CALCULATION
     ------------------------------------------------------- */

  function calculateChange(
    payments = [],
    total = 0
  ) {
    const summary =
      summarize(
        payments,
        total
      );

    return summary.change;
  }


  /* -------------------------------------------------------
     PARTIAL PAYMENT
     ------------------------------------------------------- */

  function partialPayment(
    payments = [],
    total = 0
  ) {
    const summary =
      summarize(
        payments,
        total
      );

    return {
      paid:
        summary.paid,

      due:
        summary.due,

      percentage:
        summary.target > 0
          ? round(
              summary.paid /
              summary.target *
              100
            )
          : 0,

      settled:
        summary.settled
    };
  }


  /* -------------------------------------------------------
     REFUND
     ------------------------------------------------------- */

  function createRefund({
    invoiceId = null,
    amount = 0,
    method = "Cash",
    reference = "",
    reason = "",
    staffId = null
  } = {}) {
    const refundAmount =
      round(
        positive(amount)
      );

    if (
      refundAmount <= 0
    ) {
      throw new Error(
        "Refund amount must be greater than zero."
      );
    }

    return {
      id:
        `refund-${Date.now()}-` +
        Math.random()
          .toString(36)
          .slice(2, 8),

      invoiceId,

      amount:
        refundAmount,

      method:
        validMethod(method),

      reference:
        cleanText(reference),

      reason:
        cleanText(reason),

      staffId,

      status:
        "refunded",

      createdAt:
        new Date().toISOString()
    };
  }


  /* -------------------------------------------------------
     PAYMENT REVERSAL
     ------------------------------------------------------- */

  function reversePayment(
    payment,
    reason = ""
  ) {
    if (!payment) {
      throw new Error(
        "Payment is required."
      );
    }

    return {
      ...payment,

      status:
        "reversed",

      reversedAt:
        new Date().toISOString(),

      reversalReason:
        cleanText(reason)
    };
  }


  /* -------------------------------------------------------
     PAYMENT REFERENCE VALIDATION
     ------------------------------------------------------- */

  function requiresReference(
    method
  ) {
    return (
      method === "UPI" ||
      method === "Card" ||
      method === "Bank Transfer"
    );
  }


  function validateReferences(
    payments = []
  ) {
    const normalized =
      normalizePayments(
        payments
      );

    const missing =
      normalized.filter(
        payment =>
          requiresReference(
            payment.method
          ) &&
          !payment.reference
      );

    return {
      valid:
        missing.length === 0,

      missing
    };
  }


  /* -------------------------------------------------------
     PAYMENT STATUS
     ------------------------------------------------------- */

  function getStatus(
    payments = [],
    total = 0
  ) {
    return summarize(
      payments,
      total
    ).status;
  }


  /* -------------------------------------------------------
     DAILY RECONCILIATION
     ------------------------------------------------------- */

  function reconcileCash({
    openingBalance = 0,
    cashSales = 0,
    cashIn = 0,
    cashOut = 0,
    refunds = 0,
    countedCash = 0
  } = {}) {
    const opening =
      round(
        positive(
          openingBalance
        )
      );

    const sales =
      round(
        positive(cashSales)
      );

    const incoming =
      round(
        positive(cashIn)
      );

    const outgoing =
      round(
        positive(cashOut)
      );

    const refund =
      round(
        positive(refunds)
      );

    const counted =
      round(
        positive(countedCash)
      );

    const expected =
      round(
        opening +
        sales +
        incoming -
        outgoing -
        refund
      );

    const difference =
      round(
        counted -
        expected
      );

    return {
      openingBalance:
        opening,

      cashSales:
        sales,

      cashIn:
        incoming,

      cashOut:
        outgoing,

      refunds:
        refund,

      expectedCash:
        expected,

      countedCash:
        counted,

      difference,

      balanced:
        difference === 0
    };
  }


  /* -------------------------------------------------------
     PAYMENT RECORD
     ------------------------------------------------------- */

  function createPaymentRecord({
    invoiceId = null,
    businessId = null,
    customerId = null,
    method = "Cash",
    amount = 0,
    reference = "",
    staffId = null,
    note = ""
  } = {}) {
    const value =
      round(
        positive(amount)
      );

    if (value <= 0) {
      throw new Error(
        "Payment amount must be greater than zero."
      );
    }

    return {
      id:
        createPaymentId(),

      invoiceId,

      businessId,

      customerId,

      method:
        validMethod(method),

      amount:
        value,

      reference:
        cleanText(reference),

      staffId,

      note:
        cleanText(note),

      status:
        "paid",

      createdAt:
        new Date().toISOString()
    };
  }


  /* -------------------------------------------------------
     PUBLIC API
     ------------------------------------------------------- */

  window.PaymentEngine =
    Object.freeze({
      METHODS,

      PAYMENT_STATUSES,

      round,

      normalizePayments,

      summarize,

      validate,

      addPayment,

      removePayment,

      methodTotal,

      breakdown,

      calculateChange,

      partialPayment,

      createRefund,

      reversePayment,

      requiresReference,

      validateReferences,

      getStatus,

      reconcileCash,

      createPaymentRecord
    });
})();
