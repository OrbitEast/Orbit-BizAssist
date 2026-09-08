/* Orbit BizAssist V2 — transaction contracts */
(() => {
  "use strict";

  const TYPES = Object.freeze({
    SALE: "sale",
    PURCHASE: "purchase",
    PAYMENT_IN: "payment_in",
    PAYMENT_OUT: "payment_out",
    REFUND: "refund",
    EXPENSE: "expense",
    STOCK_ADJUSTMENT: "stock_adjustment"
  });

  const create = input => ({
    id: input?.id || `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    businessId: input?.businessId || null,
    type: input?.type || TYPES.SALE,
    referenceType: input?.referenceType || null,
    referenceId: input?.referenceId || null,
    amount: Number(input?.amount || 0),
    occurredAt: input?.occurredAt || new Date().toISOString(),
    actorId: input?.actorId || null,
    metadata: input?.metadata || {}
  });

  window.OrbitV2 = window.OrbitV2 || {};
  window.OrbitV2.transactions = Object.freeze({ TYPES, create });
})();
