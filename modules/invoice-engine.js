/* =========================================================
   ORBIT BIZASSIST — INVOICE ENGINE
   Core billing calculations + invoice creation
   ========================================================= */

(() => {
  "use strict";

  const round = value =>
    Math.round((Number(value) + Number.EPSILON) * 100) / 100;

  function calculateLine(line, business = {}) {
    const quantity = Math.max(0, Number(line.quantity) || 0);
    const price = Math.max(
      0,
      Number(line.price ?? line.selling) || 0
    );

    const discount = Math.max(
      0,
      Number(line.discount) || 0
    );

    const taxRate = line.taxExempt
      ? 0
      : Math.max(
          0,
          Number(line.taxRate ?? business.taxRate) || 0
        );

    const gross = round(quantity * price);
    const taxable = round(Math.max(0, gross - discount));
    const tax = round(taxable * taxRate / 100);
    const total = round(taxable + tax);

    return {
      ...line,
      quantity,
      price,
      discount: round(discount),
      gross,
      taxable,
      taxRate,
      tax,
      lineTotal: total
    };
  }

  function calculateCart(cart = [], business = {}) {
    const items = cart.map(line =>
      calculateLine(line, business)
    );

    const subtotal = round(
      items.reduce(
        (sum, item) => sum + item.taxable,
        0
      )
    );

    const tax = round(
      items.reduce(
        (sum, item) => sum + item.tax,
        0
      )
    );

    const total = round(subtotal + tax);

    return {
      items,
      subtotal,
      tax,
      total
    };
  }

  function getInvoiceSequence(business) {
    const invoices = Array.isArray(business?.invoices)
      ? business.invoices
      : [];

    return invoices.reduce((highest, invoice) => {
      const match = String(
        invoice.number || ""
      ).match(/(\d+)$/);

      return Math.max(
        highest,
        match ? Number(match[1]) : 0
      );
    }, 0);
  }

  function nextInvoiceNumber(business) {
    const prefix =
      String(business?.invoicePrefix || "INV")
        .trim()
        .toUpperCase() || "INV";

    const next =
      getInvoiceSequence(business) + 1;

    return `${prefix}-${String(next).padStart(4, "0")}`;
  }

  function createInvoice({
    business,
    cart,
    customer = null,
    payments = [],
    notes = "",
    discount = 0,
    status = "paid"
  }) {
    if (!business) {
      throw new Error("Business is required.");
    }

    if (!Array.isArray(cart) || !cart.length) {
      throw new Error("Cart is empty.");
    }

    const calculated =
      calculateCart(cart, business);

    const billDiscount = round(
      Math.max(0, Number(discount) || 0)
    );

    const subtotalAfterDiscount =
      round(
        Math.max(
          0,
          calculated.subtotal - billDiscount
        )
      );

    /*
     * Bill-level discount is allocated proportionally
     * across tax so the final tax remains mathematically
     * consistent.
     */
    const discountRatio =
      calculated.subtotal > 0
        ? subtotalAfterDiscount /
          calculated.subtotal
        : 0;

    const finalTax = round(
      calculated.tax * discountRatio
    );

    const total = round(
      subtotalAfterDiscount + finalTax
    );

    return {
      id:
        `inv-${Date.now()}-` +
        Math.random()
          .toString(36)
          .slice(2, 8),

      number:
        nextInvoiceNumber(business),

      type: "Invoice",
      status,

      customerId:
        customer?.id || null,

      customerName:
        customer?.name ||
        "Walk-in Customer",

      customerPhone:
        customer?.phone || "",

      items: calculated.items,

      subtotal: calculated.subtotal,

      discount: billDiscount,

      tax: finalTax,

      total,

      payments: Array.isArray(payments)
        ? payments
        : [],

      paymentStatus:
        status === "paid"
          ? "paid"
          : "unpaid",

      notes:
        String(notes || "").trim(),

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()
    };
  }

  window.InvoiceEngine =
    Object.freeze({
      round,
      calculateLine,
      calculateCart,
      nextInvoiceNumber,
      createInvoice
    });
})();
