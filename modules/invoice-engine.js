/* =========================================================
   ORBIT BIZASSIST — INVOICE ENGINE
   Production-ready billing calculations + invoice creation
   ========================================================= */

(() => {
  "use strict";

  /* -------------------------------------------------------
     BASIC HELPERS
     ------------------------------------------------------- */

  const round = value =>
    Math.round(
      (Number(value) + Number.EPSILON) * 100
    ) / 100;

  const safeNumber = value => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  };

  const positive = value =>
    Math.max(0, safeNumber(value));

  const money = value =>
    round(positive(value));


  /* -------------------------------------------------------
     TAX CONFIGURATION
     ------------------------------------------------------- */

  function getTaxConfig(business = {}) {
    const taxMode =
      String(
        business.taxMode ||
        business.pricingMode ||
        "exclusive"
      ).toLowerCase() === "inclusive"
        ? "inclusive"
        : "exclusive";

    const taxType =
      String(
        business.taxType ||
        business.gstType ||
        "intra"
      ).toLowerCase();

    return {
      taxMode,

      /*
       * intra = CGST + SGST
       * inter = IGST
       */
      taxType:
        taxType === "inter" ||
        taxType === "igst" ||
        taxType === "interstate"
          ? "inter"
          : "intra",

      defaultRate: positive(
        business.taxRate ?? 0
      ),

      roundOffEnabled:
        Boolean(
          business.roundOffEnabled ||
          business.enableRoundOff
        )
    };
  }


  /* -------------------------------------------------------
     ITEM DISCOUNT
     ------------------------------------------------------- */

  function calculateItemDiscount(line, gross) {
    const discountType =
      String(
        line.discountType || "flat"
      ).toLowerCase();

    const rawDiscount =
      positive(line.discount);

    if (discountType === "percent") {
      return round(
        Math.min(
          gross,
          gross * rawDiscount / 100
        )
      );
    }

    return round(
      Math.min(gross, rawDiscount)
    );
  }


  /* -------------------------------------------------------
     SINGLE LINE CALCULATION
     ------------------------------------------------------- */

  function calculateLine(
    line = {},
    business = {}
  ) {
    const config =
      getTaxConfig(business);

    const quantity =
      positive(line.quantity);

    const price =
      positive(
        line.price ??
        line.selling ??
        line.sellingPrice
      );

    const gross =
      round(quantity * price);

    const itemDiscount =
      calculateItemDiscount(
        line,
        gross
      );

    const afterDiscount =
      round(
        Math.max(
          0,
          gross - itemDiscount
        )
      );

    const taxExempt =
      Boolean(
        line.taxExempt ||
        line.taxable === false
      );

    const taxRate =
      taxExempt
        ? 0
        : positive(
            line.taxRate ??
            line.gstRate ??
            config.defaultRate
          );

    let taxable = 0;
    let tax = 0;

    /*
     * GST EXCLUSIVE
     *
     * Price = taxable value
     * GST is added on top.
     */
    if (
      config.taxMode === "exclusive"
    ) {
      taxable =
        afterDiscount;

      tax =
        round(
          taxable *
          taxRate /
          100
        );
    }

    /*
     * GST INCLUSIVE
     *
     * Price already contains GST.
     */
    else {
      if (
        taxRate > 0 &&
        !taxExempt
      ) {
        taxable =
          round(
            afterDiscount /
            (1 + taxRate / 100)
          );

        tax =
          round(
            afterDiscount -
            taxable
          );
      } else {
        taxable =
          afterDiscount;

        tax = 0;
      }
    }

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (
      config.taxType === "inter"
    ) {
      igst = tax;
    } else {
      cgst =
        round(tax / 2);

      sgst =
        round(tax - cgst);
    }

    const lineTotal =
      round(
        taxable + tax
      );

    const costPrice =
      positive(
        line.costPrice ??
        line.cost ??
        line.purchasePrice
      );

    const costTotal =
      round(
        quantity * costPrice
      );

    const grossProfit =
      round(
        taxable - costTotal
      );

    return {
      ...line,

      quantity,
      price,

      gross:
        round(gross),

      discount:
        itemDiscount,

      discountType:
        String(
          line.discountType || "flat"
        ).toLowerCase() === "percent"
          ? "percent"
          : "flat",

      taxable,

      taxRate,

      tax,

      cgst,
      sgst,
      igst,

      lineTotal,

      costPrice,
      costTotal,
      grossProfit,

      taxExempt,

      hsn:
        String(
          line.hsn ||
          line.hsnCode ||
          ""
        ).trim(),

      sku:
        String(
          line.sku || ""
        ).trim(),

      unit:
        String(
          line.unit || "pcs"
        ).trim()
    };
  }


  /* -------------------------------------------------------
     CART CALCULATION
     ------------------------------------------------------- */

  function calculateCart(
    cart = [],
    business = {},
    options = {}
  ) {
    const config =
      getTaxConfig(business);

    const items =
      Array.isArray(cart)
        ? cart.map(line =>
            calculateLine(
              line,
              business
            )
          )
        : [];

    const grossSubtotal =
      round(
        items.reduce(
          (sum, item) =>
            sum + item.gross,
          0
        )
      );

    const itemDiscount =
      round(
        items.reduce(
          (sum, item) =>
            sum + item.discount,
          0
        )
      );

    const subtotal =
      round(
        items.reduce(
          (sum, item) =>
            sum + item.taxable,
          0
        )
      );

    const tax =
      round(
        items.reduce(
          (sum, item) =>
            sum + item.tax,
          0
        )
      );

    const cgst =
      round(
        items.reduce(
          (sum, item) =>
            sum + item.cgst,
          0
        )
      );

    const sgst =
      round(
        items.reduce(
          (sum, item) =>
            sum + item.sgst,
          0
        )
      );

    const igst =
      round(
        items.reduce(
          (sum, item) =>
            sum + item.igst,
          0
        )
      );

    const cost =
      round(
        items.reduce(
          (sum, item) =>
            sum + item.costTotal,
          0
        )
      );

    const grossProfitBeforeBillDiscount =
      round(
        items.reduce(
          (sum, item) =>
            sum + item.grossProfit,
          0
        )
      );

    /*
     * Optional calculation-level bill discount.
     *
     * Kept separate because the current POS
     * passes bill discount during createInvoice().
     */
    const requestedDiscount =
      options.discount !== undefined
        ? positive(options.discount)
        : 0;

    const billDiscount =
      round(
        Math.min(
          subtotal,
          requestedDiscount
        )
      );

    const taxableAfterBillDiscount =
      round(
        Math.max(
          0,
          subtotal - billDiscount
        )
      );

    /*
     * Allocate bill discount proportionally
     * against the tax base.
     */
    const discountRatio =
      subtotal > 0
        ? taxableAfterBillDiscount /
          subtotal
        : 0;

    const finalTax =
      round(
        tax * discountRatio
      );

    const finalCGST =
      round(
        cgst * discountRatio
      );

    const finalSGST =
      round(
        sgst * discountRatio
      );

    const finalIGST =
      round(
        igst * discountRatio
      );

    const totalBeforeRound =
      round(
        taxableAfterBillDiscount +
        finalTax
      );

    /*
     * Round-off is opt-in.
     * Existing app therefore remains unchanged
     * unless business.roundOffEnabled = true.
     */
    let roundOff = 0;

    if (
      config.roundOffEnabled ||
      options.roundOff === true
    ) {
      const roundedTotal =
        Math.round(
          totalBeforeRound
        );

      roundOff =
        round(
          roundedTotal -
          totalBeforeRound
        );
    }

    const total =
      round(
        totalBeforeRound +
        roundOff
      );

    const grossProfit =
      round(
        taxableAfterBillDiscount -
        cost
      );

    return {
      items,

      grossSubtotal,

      itemDiscount,

      subtotal,

      billDiscount,

      taxable:
        taxableAfterBillDiscount,

      tax:
        finalTax,

      cgst:
        finalCGST,

      sgst:
        finalSGST,

      igst:
        finalIGST,

      cost,

      grossProfitBeforeBillDiscount,

      grossProfit,

      roundOff,

      total,

      taxRate:
        config.defaultRate,

      taxMode:
        config.taxMode,

      taxType:
        config.taxType
    };
  }


  /* -------------------------------------------------------
     INVOICE NUMBERING
     ------------------------------------------------------- */

  function getInvoiceSequence(
    business = {}
  ) {
    const invoices =
      Array.isArray(
        business.invoices
      )
        ? business.invoices
        : [];

    return invoices.reduce(
      (highest, invoice) => {
        const number =
          String(
            invoice.number || ""
          );

        const match =
          number.match(
            /(\d+)$/
          );

        return Math.max(
          highest,
          match
            ? Number(match[1])
            : 0
        );
      },
      positive(
        business.invoiceStartNumber
      ) - 1
    );
  }


  function nextInvoiceNumber(
    business = {}
  ) {
    const prefix =
      String(
        business.invoicePrefix ||
        "INV"
      )
        .trim()
        .toUpperCase() ||
      "INV";

    const next =
      getInvoiceSequence(
        business
      ) + 1;

    const digits =
      Math.max(
        4,
        String(next).length
      );

    return (
      `${prefix}-` +
      String(next)
        .padStart(
          digits,
          "0"
        )
    );
  }


  /* -------------------------------------------------------
     UNIQUE ID
     ------------------------------------------------------- */

  function createId() {
    return (
      `inv-${Date.now()}-` +
      Math.random()
        .toString(36)
        .slice(2, 9)
    );
  }


  /* -------------------------------------------------------
     INVOICE CREATION
     ------------------------------------------------------- */

  function createInvoice({
    business,
    cart,
    customer = null,

    /*
     * Current POS uses "payments".
     * Keep it exactly compatible.
     */
    payments = [],

    notes = "",

    /*
     * Current POS sends a number.
     * Future versions can send an object.
     */
    discount = 0,

    status = "paid",

    documentType = "Invoice",

    staff = null,

    cashier = null,

    invoiceOptions = {}
  } = {}) {
    if (!business) {
      throw new Error(
        "Business is required."
      );
    }

    if (
      !Array.isArray(cart) ||
      !cart.length
    ) {
      throw new Error(
        "Cart is empty."
      );
    }

    /*
     * Current POS passes discount as number.
     *
     * Future-compatible:
     * {
     *   type: "percent",
     *   value: 10
     * }
     */
    let billDiscount = 0;

    if (
      discount &&
      typeof discount === "object"
    ) {
      const type =
        String(
          discount.type ||
          "flat"
        ).toLowerCase();

      const value =
        positive(
          discount.value
        );

      const preliminary =
        calculateCart(
          cart,
          business
        );

      if (
        type === "percent"
      ) {
        billDiscount =
          round(
            preliminary.subtotal *
            value /
            100
          );
      } else {
        billDiscount = value;
      }
    } else {
      billDiscount =
        positive(discount);
    }

    const calculated =
      calculateCart(
        cart,
        business,
        {
          ...invoiceOptions,
          discount:
            billDiscount
        }
      );

    const createdAt =
      new Date().toISOString();

    const invoice = {
      id:
        createId(),

      number:
        nextInvoiceNumber(
          business
        ),

      type:
        documentType,

      documentType,

      status,

      /*
       * Business ownership metadata.
       */
      businessId:
        business.id ||
        null,

      customerId:
        customer?.id ||
        null,

      customerName:
        customer?.name ||
        "Walk-in Customer",

      customerPhone:
        customer?.phone ||
        "",

      customerEmail:
        customer?.email ||
        "",

      customerAddress:
        customer?.address ||
        "",

      /*
       * Billing items.
       */
      items:
        calculated.items,

      /*
       * Financial summary.
       */
      grossSubtotal:
        calculated.grossSubtotal,

      subtotal:
        calculated.subtotal,

      itemDiscount:
        calculated.itemDiscount,

      discount:
        calculated.billDiscount,

      totalDiscount:
        round(
          calculated.itemDiscount +
          calculated.billDiscount
        ),

      taxable:
        calculated.taxable,

      tax:
        calculated.tax,

      cgst:
        calculated.cgst,

      sgst:
        calculated.sgst,

      igst:
        calculated.igst,

      roundOff:
        calculated.roundOff,

      total:
        calculated.total,

      /*
       * Profit data.
       */
      cost:
        calculated.cost,

      grossProfit:
        calculated.grossProfit,

      /*
       * GST configuration snapshot.
       * Important: historical invoices should
       * not change if business settings change later.
       */
      taxMode:
        calculated.taxMode,

      taxType:
        calculated.taxType,

      taxRate:
        calculated.taxRate,

      /*
       * Payment information.
       */
      payments:
        Array.isArray(payments)
          ? payments
          : [],

      paymentStatus:
        status === "paid"
          ? "paid"
          : "unpaid",

      /*
       * Optional operational information.
       */
      staffId:
        staff?.id ||
        cashier?.id ||
        null,

      staffName:
        staff?.name ||
        cashier?.name ||
        "",

      notes:
        String(
          notes || ""
        ).trim(),

      /*
       * Audit timestamps.
       */
      createdAt,

      updatedAt:
        createdAt
    };

    return invoice;
  }


  /* -------------------------------------------------------
     TAX SUMMARY
     ------------------------------------------------------- */

  function taxSummary(
    items = []
  ) {
    const summary = {
      taxable: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      tax: 0,
      total: 0
    };

    items.forEach(
      item => {
        summary.taxable +=
          positive(
            item.taxable
          );

        summary.cgst +=
          positive(
            item.cgst
          );

        summary.sgst +=
          positive(
            item.sgst
          );

        summary.igst +=
          positive(
            item.igst
          );

        summary.tax +=
          positive(
            item.tax
          );

        summary.total +=
          positive(
            item.lineTotal
          );
      }
    );

    return {
      taxable:
        round(summary.taxable),

      cgst:
        round(summary.cgst),

      sgst:
        round(summary.sgst),

      igst:
        round(summary.igst),

      tax:
        round(summary.tax),

      total:
        round(summary.total)
    };
  }


  /* -------------------------------------------------------
     PUBLIC API
     ------------------------------------------------------- */

  window.InvoiceEngine =
    Object.freeze({
      round,

      getTaxConfig,

      calculateLine,

      calculateCart,

      taxSummary,

      getInvoiceSequence,

      nextInvoiceNumber,

      createInvoice
    });
})();
