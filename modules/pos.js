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
    notes: ""
  };

  function esc(value) {
    return window.AppUtils?.esc
      ? window.AppUtils.esc(value)
      : String(value ?? "")
          .replace(/[&<>'"]/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;"
          }[char]));
  }

  function money(value) {
    return window.money
      ? window.money(value)
      : `₹${Number(value || 0).toFixed(2)}`;
  }

  function getState() {
    return window.AppState?.get?.() || {};
  }

  function getBusiness() {
    return (
      window.AppState?.business?.() ||
      getState().businesses?.[0] ||
      null
    );
  }

  function getCart() {
    return getState().cart || [];
  }

  function setCart(cart) {
    window.AppState.merge({
      cart
    });
  }

  function calculate() {
    const result =
      window.InvoiceEngine.calculateCart(
        getCart(),
        getBusiness() || {}
      );

    const discount = Math.min(
      Math.max(
        0,
        Number(POS.discount) || 0
      ),
      result.subtotal
    );

    const ratio =
      result.subtotal > 0
        ? (result.subtotal - discount) /
          result.subtotal
        : 0;

    const tax =
      Math.round(
        result.tax * ratio * 100
      ) / 100;

    return {
      subtotal: result.subtotal,
      discount,
      tax,
      total:
        Math.round(
          (
            result.subtotal -
            discount +
            tax
          ) * 100
        ) / 100
    };
  }

  function addProduct(product) {
    const cart = getCart();

    const existing =
      cart.find(
        line =>
          line.itemId === product.id
      );

    if (existing) {
      setCart(
        cart.map(line =>
          line.itemId === product.id
            ? {
                ...line,
                quantity:
                  line.quantity + 1
              }
            : line
        )
      );
    } else {
      setCart([
        ...cart,
        {
          itemId: product.id,
          name: product.name,
          sku: product.sku || "",
          price:
            Number(product.selling) || 0,
          cost:
            Number(product.cost) || 0,
          taxRate:
            Number(
              product.taxRate ??
              getBusiness()?.taxRate ??
              0
            ),
          quantity: 1,
          discount: 0
        }
      ]);
    }

    render();
  }

  function changeQuantity(
    itemId,
    delta
  ) {
    const cart = getCart();

    const line =
      cart.find(
        item =>
          item.itemId === itemId
      );

    if (!line) return;

    const quantity =
      line.quantity +
      Number(delta || 0);

    if (quantity <= 0) {
      setCart(
        cart.filter(
          item =>
            item.itemId !== itemId
        )
      );
    } else {
      setCart(
        cart.map(item =>
          item.itemId === itemId
            ? {
                ...item,
                quantity
              }
            : item
        )
      );
    }

    render();
  }

  function removeProduct(itemId) {
    setCart(
      getCart().filter(
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

    render();
  }

  function getProducts() {
    const items =
      getBusiness()?.items || [];

    const query =
      POS.search
        .trim()
        .toLowerCase();

    if (!query) {
      return items.slice(0, 20);
    }

    return items
      .filter(item =>
        [
          item.name,
          item.sku,
          item.category
        ].some(value =>
          String(value || "")
            .toLowerCase()
            .includes(query)
        )
      )
      .slice(0, 30);
  }

  function productCard(product) {
    const stock =
      Number(product.stock) || 0;

    const disabled =
      stock <= 0;

    return `
      <button
        type="button"
        class="pos-product ${
          disabled ? "is-out" : ""
        }"
        data-pos-add="${esc(
          product.id
        )}"
        ${disabled ? "disabled" : ""}
      >
        <span class="pos-product-icon">
          ${esc(product.icon || "•")}
        </span>

        <strong>
          ${esc(product.name)}
        </strong>

        <span>
          ${money(product.selling)}
        </span>

        <small>
          ${
            disabled
              ? "Out of stock"
              : `${stock} in stock`
          }
        </small>
      </button>
    `;
  }

  function cartRow(line) {
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
            aria-label="Decrease quantity"
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
            aria-label="Increase quantity"
          >
            +
          </button>

        </div>

        <strong>
          ${money(
            line.price *
            line.quantity
          )}
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

  function customers() {
    return (
      getBusiness()?.contacts || []
    );
  }

  function customerOptions() {
    return [
      `<option value="">
        Walk-in Customer
      </option>`,

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

  function render() {
    const root =
      document.querySelector(
        "#pos-view"
      );

    if (!root) return;

    const cart =
      getCart();

    const totals =
      calculate();

    const products =
      getProducts();

    root.innerHTML = `
      <section class="pos-workspace">

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

            <button
              type="button"
              class="secondary-btn"
              data-pos-clear
              ${
                cart.length
                  ? ""
                  : "disabled"
              }
            >
              Clear
            </button>

          </div>

          <div class="pos-search">

            <input
              id="pos-search"
              type="search"
              autocomplete="off"
              placeholder="Search product or SKU…"
              value="${esc(
                POS.search
              )}"
            >

          </div>

          <div class="pos-products">

            ${
              products.length
                ? products
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


        <aside class="pos-cart-panel">

          <div class="pos-cart-head">

            <div>
              <span class="eyebrow">
                Current bill
              </span>

              <h3>
                ${
                  cart.reduce(
                    (sum, item) =>
                      sum +
                      item.quantity,
                    0
                  )
                }
                items
              </h3>
            </div>

          </div>


          <div class="pos-cart-list">

            ${
              cart.length
                ? cart
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
                <span>Subtotal</span>
                <strong>
                  ${money(
                    totals.subtotal
                  )}
                </strong>
              </div>

              <div>
                <span>Discount</span>
                <strong>
                  − ${money(
                    totals.discount
                  )}
                </strong>
              </div>

              <div>
                <span>Tax</span>
                <strong>
                  ${money(
                    totals.tax
                  )}
                </strong>
              </div>

              <div class="pos-total">
                <span>Total</span>
                <strong>
                  ${money(
                    totals.total
                  )}
                </strong>
              </div>

            </div>


            <div class="pos-payment-grid">

              ${window.PaymentEngine
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
                      ${esc(method)}
                    </button>
                  `
                )
                .join("")}

            </div>


            <button
              type="button"
              class="primary-btn pos-charge-btn"
              data-pos-charge
              ${
                cart.length
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

  async function charge() {
    const cart =
      getCart();

    if (!cart.length) {
      return;
    }

    const business =
      getBusiness();

    if (!business) {
      throw new Error(
        "No active business found."
      );
    }

    const totals =
      calculate();

    const customer =
      customers().find(
        item =>
          item.id ===
          POS.customerId
      ) || null;

    try {
      /*
       * Prevent selling more stock than available.
       */
      for (const line of cart) {
        const product =
          business.items?.find(
            item =>
              item.id ===
              line.itemId
          );

        if (!product) {
          throw new Error(
            `${line.name} no longer exists.`
          );
        }

        if (
          Number(product.stock) <
          Number(line.quantity)
        ) {
          throw new Error(
            `Not enough stock for ${line.name}.`
          );
        }
      }

      const payment =
        window.PaymentEngine.validate(
          [
            {
              method:
                POS.paymentMethod,
              amount:
                totals.total
            }
          ],
          totals.total
        );

      const invoice =
        window.InvoiceEngine.createInvoice({
          business,
          cart,
          customer,
          payments:
            payment.payments,
          notes: POS.notes,
          discount:
            POS.discount
        });

      /*
       * Atomic-in-memory business update.
       * Future transaction layer can move this
       * into a dedicated domain service.
       */
      const updatedBusiness = {
        ...business,

        invoices: [
          ...(business.invoices || []),
          invoice
        ],

        items:
          (business.items || [])
            .map(product => {
              const sold =
                cart.find(
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
                  Number(product.stock || 0) -
                  Number(
                    sold.quantity || 0
                  ),

                updatedAt:
                  new Date().toISOString()
              };
            }),

        stockLog: [
          ...(business.stockLog || []),

          ...cart.map(line => ({
            id:
              `stock-${Date.now()}-` +
              Math.random()
                .toString(36)
                .slice(2, 7),

            type: "sale",

            itemId:
              line.itemId,

            quantity:
              -Number(
                line.quantity
              ),

            referenceId:
              invoice.id,

            referenceNumber:
              invoice.number,

            createdAt:
              new Date()
                .toISOString()
          }))
        ],

        updatedAt:
          new Date().toISOString()
      };

      const nextBusinesses =
        getState()
          .businesses
          .map(item =>
            item.id === business.id
              ? updatedBusiness
              : item
          );

      window.AppState.merge({
        businesses:
          nextBusinesses,
        cart: []
      });

      POS.discount = 0;
      POS.notes = "";
      POS.customerId = "";

      /*
       * Persist through existing cloud layer.
       * Auth/Supabase implementation remains untouched.
       */
      await window.AppState.save?.();

      render();

      if (
        typeof window.toast ===
        "function"
      ) {
        window.toast(
          `${invoice.number} created successfully.`
        );
      }

    } catch (error) {
      console.error(
        "Orbit POS:",
        error
      );

      if (
        typeof window.toast ===
        "function"
      ) {
        window.toast(
          error.message ||
          "Unable to complete sale."
        );
      }
    }
  }

  function view() {
    return `
      <main class="page">
        <div id="pos-view"></div>
      </main>
    `;
  }

  /*
   * Search
   */
  document.addEventListener(
    "input",
    event => {
      if (
        event.target.id ===
        "pos-search"
      ) {
        POS.search =
          event.target.value;

        render();
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

        render();
      }

      if (
        event.target.id ===
        "pos-notes"
      ) {
        POS.notes =
          event.target.value;
      }
    }
  );

  /*
   * Customer
   */
  document.addEventListener(
    "change",
    event => {
      if (
        event.target.id ===
        "pos-customer"
      ) {
        POS.customerId =
          event.target.value;
      }
    }
  );

  /*
   * POS actions
   */
  document.addEventListener(
    "click",
    event => {

      const add =
        event.target.closest(
          "[data-pos-add]"
        );

      if (add) {
        const product =
          getBusiness()
            ?.items
            ?.find(
              item =>
                item.id ===
                add.dataset.posAdd
            );

        if (product) {
          addProduct(product);
        }

        return;
      }


      const quantity =
        event.target.closest(
          "[data-pos-qty]"
        );

      if (quantity) {
        changeQuantity(
          quantity.dataset
            .posQty,
          Number(
            quantity.dataset
              .delta
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
          remove.dataset
            .posRemove
        );

        return;
      }


      const payment =
        event.target.closest(
          "[data-pos-payment]"
        );

      if (payment) {
        POS.paymentMethod =
          payment.dataset
            .posPayment;

        render();

        return;
      }


      if (
        event.target.closest(
          "[data-pos-clear]"
        )
      ) {
        clear();
        return;
      }


      if (
        event.target.closest(
          "[data-pos-charge]"
        )
      ) {
        charge();
      }
    }
  );

  window.POS =
    Object.freeze({
      view,
      render,
      addProduct,
      clear
    });
})();
