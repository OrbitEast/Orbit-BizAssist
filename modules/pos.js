/* =========================================================
   ORBIT BIZASSIST — POS
   Fast billing workspace
   ========================================================= */

(() => {
  "use strict";

  const POS = {
    search: "",
    customerId: "",
    paymentMethod: "Cash",
    discount: 0,
    notes: "",
    heldBills: [],
    splitPayments: []
  };


  /* -------------------------------------------------------
     HELPERS
     ------------------------------------------------------- */

  const esc = value =>
    window.AppUtils?.esc
      ? window.AppUtils.esc(value)
      : String(value ?? "")
          .replace(/[&<>'"]/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;"
          }[char]));

  const money = value =>
    window.money
      ? window.money(value)
      : `₹${Number(value || 0).toFixed(2)}`;

  const state = () =>
    window.AppState?.get?.() || {};

  const business = () =>
    window.AppState?.business?.() ||
    state().businesses?.[0] ||
    null;

  const cart = () =>
    state().cart || [];

  function setCart(next) {
    window.AppState?.merge?.({
      cart: next
    });
  }

  function notify(message) {
    if (typeof window.toast === "function") {
      window.toast(message);
    }
  }


  /* -------------------------------------------------------
     PRODUCTS
     ------------------------------------------------------- */

  function products() {
    const items =
      business()?.items || [];

    const query =
      POS.search
        .trim()
        .toLowerCase();

    if (!query) {
      return items.slice(0, 40);
    }

    return items
      .filter(item =>
        [
          item.name,
          item.sku,
          item.barcode,
          item.category
        ].some(value =>
          String(value || "")
            .toLowerCase()
            .includes(query)
        )
      )
      .slice(0, 40);
  }


  function findProduct(id) {
    return (
      business()?.items || []
    ).find(
      item =>
        item.id === id
    );
  }


  /* -------------------------------------------------------
     CART
     ------------------------------------------------------- */

  function addProduct(product) {
    if (!product) return;

    const stock =
      Number(product.stock) || 0;

    const existing =
      cart().find(
        line =>
          line.itemId ===
          product.id
      );

    const currentQty =
      existing
        ? Number(existing.quantity) || 0
        : 0;

    if (
      currentQty + 1 >
      stock
    ) {
      notify(
        `Only ${stock} ${product.name} available.`
      );
      return;
    }

    if (existing) {
      setCart(
        cart().map(line =>
          line.itemId === product.id
            ? {
                ...line,
                quantity:
                  currentQty + 1
              }
            : line
        )
      );
    } else {
      setCart([
        ...cart(),
        {
          itemId: product.id,
          name: product.name,
          sku: product.sku || "",
          barcode:
            product.barcode || "",
          price:
            Number(
              product.selling
            ) || 0,
          cost:
            Number(
              product.cost
            ) || 0,
          taxRate:
            Number(
              product.taxRate ??
              business()?.taxRate ??
              0
            ),
          taxExempt:
            Boolean(
              product.taxExempt
            ),
          quantity: 1,
          discount: 0,
          discountType: "flat",
          unit:
            product.unit || "pcs"
        }
      ]);
    }

    render();
  }


  function changeQuantity(
    itemId,
    delta
  ) {
    const line =
      cart().find(
        item =>
          item.itemId === itemId
      );

    if (!line) return;

    const product =
      findProduct(itemId);

    const quantity =
      Number(line.quantity || 0) +
      Number(delta || 0);

    if (quantity <= 0) {
      removeProduct(itemId);
      return;
    }

    if (
      product &&
      quantity >
        Number(product.stock || 0)
    ) {
      notify(
        `Only ${product.stock || 0} available.`
      );
      return;
    }

    setCart(
      cart().map(item =>
        item.itemId === itemId
          ? {
              ...item,
              quantity
            }
          : item
      )
    );

    render();
  }


  function removeProduct(itemId) {
    setCart(
      cart().filter(
        item =>
          item.itemId !== itemId
      )
    );

    render();
  }


  function clear() {
    setCart([]);

    POS.discount = 0;
    POS.notes = "";
    POS.customerId = "";
    POS.splitPayments = [];

    render();
  }


  /* -------------------------------------------------------
     TOTALS
     ------------------------------------------------------- */

  function calculate() {
    const engine =
      window.InvoiceEngine;

    if (!engine) {
      return {
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        roundOff: 0
      };
    }

    const result =
      engine.calculateCart(
        cart(),
        business() || {},
        {
          discount:
            Number(POS.discount) || 0
        }
      );

    return {
      ...result,

      /*
       * Keep these aliases for the current UI.
       */
      discount:
        result.billDiscount || 0
    };
  }


  /* -------------------------------------------------------
     CUSTOMERS
     ------------------------------------------------------- */

  function customers() {
    return (
      business()?.contacts || []
    );
  }


  function selectedCustomer() {
    return (
      customers().find(
        customer =>
          customer.id ===
          POS.customerId
      ) || null
    );
  }


  function customerOptions() {
    return [
      `<option value="">Walk-in Customer</option>`,

      ...customers().map(
        customer => `
          <option
            value="${esc(customer.id)}"
            ${
              customer.id ===
              POS.customerId
                ? "selected"
                : ""
            }
          >
            ${esc(
              customer.name ||
              customer.phone ||
              "Customer"
            )}
          </option>
        `
      )
    ].join("");
  }


  /* -------------------------------------------------------
     PAYMENTS
     ------------------------------------------------------- */

  function currentPayments(total) {
    if (
      POS.splitPayments.length
    ) {
      return POS.splitPayments;
    }

    return [
      {
        method:
          POS.paymentMethod,
        amount: total
      }
    ];
  }


  function paymentSummary(total) {
    return window.PaymentEngine
      ? window.PaymentEngine.summarize(
          currentPayments(total),
          total
        )
      : {
          paid: 0,
          due: total,
          change: 0,
          settled: false,
          partial: false
        };
  }


  function setPaymentMethod(method) {
    if (
      !window.PaymentEngine?.METHODS
        ?.includes(method)
    ) {
      return;
    }

    POS.paymentMethod =
      method;

    POS.splitPayments = [];

    render();
  }


  /* -------------------------------------------------------
     SPLIT PAYMENT
     ------------------------------------------------------- */

  function addSplitPayment() {
    const total =
      calculate().total;

    const paid =
      POS.splitPayments.reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.amount || 0
          ),
        0
      );

    const remaining =
      Math.max(
        0,
        total - paid
      );

    if (!remaining) {
      notify(
        "Bill is already fully paid."
      );
      return;
    }

    POS.splitPayments =
      window.PaymentEngine
        ? window.PaymentEngine.addPayment(
            POS.splitPayments,
            {
              method:
                POS.paymentMethod,
              amount:
                remaining
            }
          )
        : [
            ...POS.splitPayments,
            {
              method:
                POS.paymentMethod,
              amount:
                remaining
            }
          ];

    render();
  }


  function removeSplitPayment(id) {
    POS.splitPayments =
      window.PaymentEngine
        ? window.PaymentEngine
            .removePayment(
              POS.splitPayments,
              id
            )
        : POS.splitPayments.filter(
            payment =>
              payment.id !== id
          );

    render();
  }


  /* -------------------------------------------------------
     HOLD / RESUME
     ------------------------------------------------------- */

  function holdBill() {
    if (!cart().length) {
      notify(
        "Cart is empty."
      );
      return;
    }

    POS.heldBills.push({
      id:
        `hold-${Date.now()}`,

      cart:
        structuredClone
          ? structuredClone(
              cart()
            )
          : JSON.parse(
              JSON.stringify(
                cart()
              )
            ),

      customerId:
        POS.customerId,

      discount:
        POS.discount,

      notes:
        POS.notes,

      createdAt:
        new Date().toISOString()
    });

    clear();

    notify(
      "Bill held successfully."
    );
  }


  function resumeBill() {
    const bill =
      POS.heldBills.pop();

    if (!bill) {
      notify(
        "No held bills."
      );
      return;
    }

    setCart(
      bill.cart || []
    );

    POS.customerId =
      bill.customerId || "";

    POS.discount =
      bill.discount || 0;

    POS.notes =
      bill.notes || "";

    render();
  }


  /* -------------------------------------------------------
     PRODUCT CARD
     ------------------------------------------------------- */

  function productCard(product) {
    const stock =
      Number(product.stock) || 0;

    const out =
      stock <= 0;

    return `
      <button
        type="button"
        class="pos-product ${
          out ? "is-out" : ""
        }"
        data-pos-add="${esc(
          product.id
        )}"
        ${out ? "disabled" : ""}
      >

        <span class="pos-product-icon">
          ${esc(
            product.icon || "•"
          )}
        </span>

        <strong>
          ${esc(product.name)}
        </strong>

        <span>
          ${money(
            product.selling
          )}
        </span>

        <small>
          ${
            out
              ? "Out of stock"
              : `${stock} in stock`
          }
        </small>

      </button>
    `;
  }


  /* -------------------------------------------------------
     CART ROW
     ------------------------------------------------------- */

  function cartRow(line) {
    const lineTotal =
      Number(line.price || 0) *
      Number(line.quantity || 0);

    return `
      <div class="pos-cart-row">

        <div class="pos-cart-info">

          <strong>
            ${esc(line.name)}
          </strong>

          <small>
            ${money(line.price)}
          </small>

        </div>


        <div class="pos-qty">

          <button
            type="button"
            data-pos-qty="${esc(
              line.itemId
            )}"
            data-delta="-1"
          >
            −
          </button>

          <span>
            ${line.quantity}
          </span>

          <button
            type="button"
            data-pos-qty="${esc(
              line.itemId
            )}"
            data-delta="1"
          >
            +
          </button>

        </div>


        <strong>
          ${money(lineTotal)}
        </strong>


        <button
          type="button"
          class="pos-remove"
          data-pos-remove="${esc(
            line.itemId
          )}"
          aria-label="Remove item"
        >
          ×
        </button>

      </div>
    `;
  }


  /* -------------------------------------------------------
     MAIN VIEW
     ------------------------------------------------------- */

  function view() {
    return `
      <div id="pos-view"></div>
    `;
  }


  /* -------------------------------------------------------
     RENDER
     ------------------------------------------------------- */

  function render() {
    const root =
      document.querySelector(
        "#pos-view"
      );

    if (!root) return;

    const totals =
      calculate();

    const payment =
      paymentSummary(
        totals.total
      );

    root.innerHTML = `
      <section class="pos-workspace">


        <!-- PRODUCTS -->

        <div class="pos-main">

          <div class="pos-toolbar">

            <div>
              <span class="eyebrow">
                Point of sale
              </span>

              <h2>
                New sale
              </h2>
            </div>

            <div class="pos-toolbar-actions">

              <button
                type="button"
                class="secondary-btn"
                data-pos-hold
                ${
                  cart().length
                    ? ""
                    : "disabled"
                }
              >
                Hold bill
              </button>

              <button
                type="button"
                class="secondary-btn"
                data-pos-resume
                ${
                  POS.heldBills.length
                    ? ""
                    : "disabled"
                }
              >
                Resume
                ${
                  POS.heldBills.length
                    ? `(${POS.heldBills.length})`
                    : ""
                }
              </button>

              <button
                type="button"
                class="secondary-btn"
                data-pos-clear
                ${
                  cart().length
                    ? ""
                    : "disabled"
                }
              >
                Clear
              </button>

            </div>

          </div>


          <div class="pos-search">

            <input
              id="pos-search"
              type="search"
              autocomplete="off"
              placeholder="Search product, SKU or barcode…"
              value="${esc(
                POS.search
              )}"
            >

          </div>


          <div class="pos-products">

            ${
              products().length
                ? products()
                    .map(
                      productCard
                    )
                    .join("")
                : `
                  <div class="pos-no-results">
                    No products found.
                  </div>
                `
            }

          </div>

        </div>


        <!-- CART -->

        <aside class="pos-cart-panel">

          <div class="pos-cart-head">

            <div>
              <span class="eyebrow">
                Current bill
              </span>

              <h3>
                ${
                  cart().reduce(
                    (sum, item) =>
                      sum +
                      Number(
                        item.quantity || 0
                      ),
                    0
                  )
                }
                items
              </h3>
            </div>

          </div>


          <div class="pos-cart-list">

            ${
              cart().length
                ? cart()
                    .map(cartRow)
                    .join("")
                : `
                  <div class="pos-cart-empty">

                    <strong>
                      Cart is empty
                    </strong>

                    <span>
                      Select a product to begin.
                    </span>

                  </div>
                `
            }

          </div>


          <!-- CHECKOUT -->

          <div class="pos-checkout">


            <label class="pos-field">

              <span>
                Customer
              </span>

              <select
                id="pos-customer"
              >
                ${customerOptions()}
              </select>

            </label>


            <label class="pos-field">

              <span>
                Bill discount
              </span>

              <input
                id="pos-discount"
                type="number"
                min="0"
                step="0.01"
                value="${POS.discount}"
                placeholder="0"
              >

            </label>


            <label class="pos-field">

              <span>
                Notes
              </span>

              <input
                id="pos-notes"
                type="text"
                maxlength="250"
                value="${esc(
                  POS.notes
                )}"
                placeholder="Optional note…"
              >

            </label>


            <div class="pos-summary">

              <div>
                <span>
                  Subtotal
                </span>

                <strong>
                  ${money(
                    totals.subtotal
                  )}
                </strong>
              </div>


              <div>
                <span>
                  Discount
                </span>

                <strong>
                  − ${money(
                    totals.discount
                  )}
                </strong>
              </div>


              <div>
                <span>
                  Tax
                </span>

                <strong>
                  ${money(
                    totals.tax
                  )}
                </strong>
              </div>


              ${
                totals.cgst ||
                totals.sgst
                  ? `
                    <div>
                      <span>
                        CGST
                      </span>
                      <strong>
                        ${money(
                          totals.cgst
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        SGST
                      </span>
                      <strong>
                        ${money(
                          totals.sgst
                        )}
                      </strong>
                    </div>
                  `
                  : ""
              }


              ${
                totals.igst
                  ? `
                    <div>
                      <span>
                        IGST
                      </span>
                      <strong>
                        ${money(
                          totals.igst
                        )}
                      </strong>
                    </div>
                  `
                  : ""
              }


              ${
                totals.roundOff
                  ? `
                    <div>
                      <span>
                        Round-off
                      </span>
                      <strong>
                        ${money(
                          totals.roundOff
                        )}
                      </strong>
                    </div>
                  `
                  : ""
              }


              <div class="pos-total">

                <span>
                  Total
                </span>

                <strong>
                  ${money(
                    totals.total
                  )}
                </strong>

              </div>

            </div>


            <!-- PAYMENT METHODS -->

            <div class="pos-payment-grid">

              ${
                window.PaymentEngine
                  ? window.PaymentEngine
                      .METHODS
                      .map(
                        method => `
                          <button
                            type="button"
                            class="${
                              POS.paymentMethod ===
                              method
                                ? "active"
                                : ""
                            }"
                            data-pos-payment="${esc(
                              method
                            )}"
                          >
                            ${esc(
                              method
                            )}
                          </button>
                        `
                      )
                      .join("")
                  : ""
              }

            </div>


            <!-- SPLIT PAYMENT -->

            <button
              type="button"
              class="secondary-btn full"
              data-pos-split
              ${
                cart().length
                  ? ""
                  : "disabled"
              }
            >
              Add split payment
            </button>


            ${
              POS.splitPayments.length
                ? `
                  <div class="pos-split-list">

                    ${POS.splitPayments
                      .map(
                        payment => `
                          <div class="pos-split-row">

                            <span>
                              ${esc(
                                payment.method
                              )}
                            </span>

                            <strong>
                              ${money(
                                payment.amount
                              )}
                            </strong>

                            <button
                              type="button"
                              data-pos-remove-payment="${esc(
                                payment.id
                              )}"
                            >
                              ×
                            </button>

                          </div>
                        `
                      )
                      .join("")}

                  </div>
                `
                : ""
            }


            ${
              payment.due > 0
                ? `
                  <div class="pos-payment-due">
                    Due:
                    <strong>
                      ${money(
                        payment.due
                      )}
                    </strong>
                  </div>
                `
                : ""
            }


            ${
              payment.change > 0
                ? `
                  <div class="pos-payment-change">
                    Change:
                    <strong>
                      ${money(
                        payment.change
                      )}
                    </strong>
                  </div>
                `
                : ""
            }


            <button
              type="button"
              class="primary-btn pos-charge-btn"
              data-pos-charge
              ${
                cart().length
                  ? ""
                  : "disabled"
              }
            >
              Charge
              ${money(
                totals.total
              )}
            </button>


          </div>

        </aside>

      </section>
    `;
  }


  /* -------------------------------------------------------
     CHARGE
     ------------------------------------------------------- */

  async function charge() {
    const currentCart =
      cart();

    if (!currentCart.length) {
      notify(
        "Add a product first."
      );
      return;
    }

    const currentBusiness =
      business();

    if (!currentBusiness) {
      notify(
        "No active business found."
      );
      return;
    }

    const totals =
      calculate();

    /*
     * Validate stock one final time
     * immediately before creating invoice.
     */
    for (
      const line of currentCart
    ) {
      const product =
        findProduct(
          line.itemId
        );

      if (!product) {
        throw new Error(
          `${line.name} no longer exists.`
        );
      }

      if (
        Number(product.stock || 0) <
        Number(line.quantity || 0)
      ) {
        throw new Error(
          `Not enough stock for ${line.name}.`
        );
      }
    }


    const payments =
      currentPayments(
        totals.total
      );


    const paymentResult =
      window.PaymentEngine
        ? window.PaymentEngine.validate(
            payments,
            totals.total,
            {
              allowCredit:
                payments.some(
                  payment =>
                    payment.method ===
                    "Credit"
                )
            }
          )
        : {
            payments,
            paid:
              totals.total,
            due: 0,
            change: 0,
            settled: true
          };


    const customer =
      selectedCustomer();
    const creditAmount =
      payments
        .filter(payment =>
          payment.method === "Credit"
        )
        .reduce(
          (sum, payment) =>
            sum + Number(payment.amount || 0),
          0
        );

    if (
      creditAmount > 0 &&
      !customer
    ) {
      throw new Error(
        "Select a customer for a credit sale."
      );
    }

    if (
      creditAmount > 0 &&
      customer
    ) {
      const currentDue =
        window.Khata?.outstanding?.(
          customer.id
        ) || 0;

      const creditLimit =
        Number(
          customer.creditLimit || 0
        );

      if (
        creditLimit > 0 &&
        currentDue + creditAmount >
          creditLimit
      ) {
        throw new Error(
          `Credit limit exceeded. Available credit: ${money(
            Math.max(
              0,
              creditLimit - currentDue
            )
          )}.`
        );
      }
    }

    const invoice =
      window.InvoiceEngine
        .createInvoice({
          business:
            currentBusiness,

          cart:
            currentCart,

          customer,

          payments:
            paymentResult.payments,

          notes:
            POS.notes,

          discount:
            POS.discount
        });
         const creditLedgerEntry =
      creditAmount > 0 && customer
        ? {
            id:
              `ledger-${Date.now()}-` +
              Math.random()
                .toString(36)
                .slice(2, 8),

            customerId:
              customer.id,

            businessId:
              currentBusiness.id,

            type:
              "sale",

            invoiceId:
              invoice.id,

            invoiceNumber:
              invoice.number || "",

            debit:
              creditAmount,

            credit:
              0,

            amount:
              creditAmount,

            dueDate:
              window.Khata?.calculateDueDate?.(
                customer.dueDays
              ) || null,

            notes:
              POS.notes || "",

            createdAt:
              new Date().toISOString(),

            createdBy:
              window.AppState?.get?.()
                ?.user?.name ||
              "Owner / Admin"
          }
        : null;


    /*
     * Update stock.
     */
    const updatedItems =
      (
        currentBusiness.items ||
        []
      ).map(product => {

        const sold =
          currentCart.find(
            line =>
              line.itemId ===
              product.id
          );

        if (!sold) {
          return product;
        }

        return {
          ...product,

          stock:
            Number(
              product.stock || 0
            ) -
            Number(
              sold.quantity || 0
            ),

          updatedAt:
            new Date().toISOString()
        };
      });


    /*
     * Stock ledger.
     */
    const stockEntries =
      currentCart.map(
        line => ({
          id:
            `stock-${Date.now()}-` +
            Math.random()
              .toString(36)
              .slice(2, 8),

          type:
            "sale",

          itemId:
            line.itemId,

          quantity:
            -Number(
              line.quantity || 0
            ),

          referenceId:
            invoice.id,

          referenceNumber:
            invoice.number,

          createdAt:
            new Date()
              .toISOString()
        })
      );


    /*
     * Payment records.
     */
    const paymentEntries =
      paymentResult.payments.map(
        payment => ({
          ...payment,

          invoiceId:
            invoice.id,

          businessId:
            currentBusiness.id,

          customerId:
            customer?.id ||
            null
        })
      );


    /*
     * Business update.
     */
    const updatedBusiness = {
      ...currentBusiness,

      items:
        updatedItems,

      invoices: [
        ...(currentBusiness.invoices || []),
        invoice
      ],

      stockLog: [
        ...(currentBusiness.stockLog || []),
        ...stockEntries
      ],

      payments: [
        ...(currentBusiness.payments || []),
        ...paymentEntries
      ],
             ledger:
        creditLedgerEntry
          ? [
              ...(currentBusiness.ledger || []),
              creditLedgerEntry
            ]
          : (
              currentBusiness.ledger ||
              []
            ),

      updatedAt:
        new Date().toISOString()
    };


    /*
     * Save business.
     */
    window.AppState?.updateBusiness?.(
      updatedBusiness.id,
      updatedBusiness
    );


    /*
     * Clear active cart only after
     * invoice has been constructed.
     */
    setCart([]);

    POS.discount = 0;
    POS.notes = "";
    POS.customerId = "";
    POS.splitPayments = [];


    /*
     * Persist.
     */
    if (
      typeof window.AppState?.save ===
      "function"
    ) {
      await window.AppState.save();
    }


    render();

    notify(
      `Invoice ${invoice.number} created.`
    );

    /*
     * Future receipt/print flow hooks.
     */
    window.dispatchEvent(
      new CustomEvent(
        "orbit:invoice-created",
        {
          detail: {
            invoice
          }
        }
      )
    );
  }


  /* -------------------------------------------------------
     EVENTS
     ------------------------------------------------------- */

  function bindEvents() {
    document.addEventListener(
      "click",
      event => {

        const add =
          event.target.closest(
            "[data-pos-add]"
          );

        if (add) {
          const product =
            findProduct(
              add.dataset.posAdd
            );

          addProduct(product);
          return;
        }


        const qty =
          event.target.closest(
            "[data-pos-qty]"
          );

        if (qty) {
          changeQuantity(
            qty.dataset.posQty,
            Number(
              qty.dataset.delta
            )
          );
          return;
        }


        const remove =
          event.target.closest(
            "[data-pos-remove]"
          );

        if (remove) {
          removeProduct(
            remove.dataset.posRemove
          );
          return;
        }


        const payment =
          event.target.closest(
            "[data-pos-payment]"
          );

        if (payment) {
          setPaymentMethod(
            payment.dataset.posPayment
          );
          return;
        }


        const clearButton =
          event.target.closest(
            "[data-pos-clear]"
          );

        if (clearButton) {
          clear();
          return;
        }


        const hold =
          event.target.closest(
            "[data-pos-hold]"
          );

        if (hold) {
          holdBill();
          return;
        }


        const resume =
          event.target.closest(
            "[data-pos-resume]"
          );

        if (resume) {
          resumeBill();
          return;
        }


        const split =
          event.target.closest(
            "[data-pos-split]"
          );

        if (split) {
          addSplitPayment();
          return;
        }


        const removePayment =
          event.target.closest(
            "[data-pos-remove-payment]"
          );

        if (removePayment) {
          removeSplitPayment(
            removePayment.dataset
              .posRemovePayment
          );
          return;
        }


        const chargeButton =
          event.target.closest(
            "[data-pos-charge]"
          );

        if (chargeButton) {
          charge()
            .catch(error => {
              console.error(
                "POS charge failed:",
                error
              );

              notify(
                error.message ||
                "Unable to complete sale."
              );
            });

          return;
        }

      }
    );


    document.addEventListener(
      "input",
      event => {

        if (
          event.target.id ===
          "pos-search"
        ) {
          POS.search =
            event.target.value;

          /*
           * Do not rerender the whole page
           * while typing.
           */
          const list =
            document.querySelector(
              ".pos-products"
            );

          if (list) {
            list.innerHTML =
              products()
                .map(
                  productCard
                )
                .join("") ||
              `
                <div class="pos-no-results">
                  No products found.
                </div>
              `;
          }

          return;
        }


        if (
          event.target.id ===
          "pos-discount"
        ) {
          POS.discount =
            Math.max(
              0,
              Number(
                event.target.value
              ) || 0
            );

          updateCheckout();
          return;
        }


        if (
          event.target.id ===
          "pos-notes"
        ) {
          POS.notes =
            event.target.value;

          return;
        }

      }
    );


    document.addEventListener(
      "change",
      event => {

        if (
          event.target.id ===
          "pos-customer"
        ) {
          POS.customerId =
            event.target.value;

          return;
        }

      }
    );


    /*
     * Keyboard-first billing.
     */
    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "/" &&
          document.activeElement?.tagName !==
            "INPUT"
        ) {
          event.preventDefault();

          document
            .querySelector(
              "#pos-search"
            )
            ?.focus();

          return;
        }


        if (
          event.key === "Escape" &&
          document.activeElement?.id ===
            "pos-search"
        ) {
          POS.search = "";

          render();

          return;
        }


        if (
          event.key === "F2"
        ) {
          event.preventDefault();

          document
            .querySelector(
              "#pos-search"
            )
            ?.focus();

          return;
        }


        if (
          event.key === "F4"
        ) {
          event.preventDefault();

          charge()
            .catch(error =>
              notify(
                error.message ||
                "Unable to complete sale."
              )
            );
        }

      }
    );
  }


  /* -------------------------------------------------------
     CHECKOUT PARTIAL UPDATE
     ------------------------------------------------------- */

  function updateCheckout() {
    const totals =
      calculate();

    const summary =
      document.querySelector(
        ".pos-summary"
      );

    if (!summary) {
      render();
      return;
    }

    /*
     * Simpler and safer than trying
     * to manually update every field.
     */
    render();
  }


  /* -------------------------------------------------------
     INIT
     ------------------------------------------------------- */

  bindEvents();


  /* -------------------------------------------------------
     PUBLIC API
     ------------------------------------------------------- */

  window.POS =
    Object.freeze({
      view,
      render,
      addProduct,
      changeQuantity,
      removeProduct,
      clear,
      charge,
      holdBill,
      resumeBill
    });

})();
