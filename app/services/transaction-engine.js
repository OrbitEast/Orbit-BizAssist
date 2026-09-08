/* Orbit BizAssist V2 — transaction orchestration boundary */
(() => {
  "use strict";

  function createTransactionEngine({ repositories = {}, events, models, money } = {}) {
    if (!models?.invoice || !models?.payment || !models?.inventoryMovement) {
      throw new TypeError("Domain models are required by transaction engine.");
    }

    const emit = typeof events?.emit === "function" ? events.emit : () => {};

    async function recordSale(input) {
      const invoice = models.invoice(input?.invoice || {});
      const payment = input?.payment ? models.payment(input.payment) : null;
      const movements = Array.isArray(input?.inventoryMovements)
        ? input.inventoryMovements.map(models.inventoryMovement)
        : [];

      if (invoice.total < 0) throw new Error("Invoice total cannot be negative.");
      if (payment && payment.amount > invoice.total) {
        throw new Error("Payment cannot exceed invoice total without an explicit overpayment rule.");
      }

      const createdInvoice = repositories.invoices?.insert
        ? await repositories.invoices.insert(invoice)
        : invoice;

      const createdPayment = payment && repositories.payments?.insert
        ? await repositories.payments.insert(payment)
        : payment;

      const createdMovements = [];
      for (const movement of movements) {
        createdMovements.push(
          repositories.inventoryMovements?.insert
            ? await repositories.inventoryMovements.insert(movement)
            : movement
        );
      }

      emit("transaction:sale:recorded", {
        invoice: createdInvoice,
        payment: createdPayment,
        inventoryMovements: createdMovements
      });

      return {
        invoice: createdInvoice,
        payment: createdPayment,
        inventoryMovements: createdMovements
      };
    }

    return Object.freeze({ recordSale });
  }

  window.OrbitV2 = window.OrbitV2 || {};
  window.OrbitV2.services = window.OrbitV2.services || {};
  window.OrbitV2.services.createTransactionEngine = createTransactionEngine;
})();
