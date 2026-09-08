/* =========================================================
   ORBIT BIZASSIST — INVENTORY
   Stock control + product management
   ========================================================= */

(() => {
  "use strict";

  const INVENTORY = {
    search: "",
    category: "all",
    filter: "all",
    modal: null,
    editingId: null
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

  function saveBusiness(nextBusiness) {
    if (
      typeof window.AppState?.updateBusiness ===
      "function"
    ) {
      window.AppState.updateBusiness(
        nextBusiness.id,
        nextBusiness
      );
    }

    if (
      typeof window.AppState?.save ===
      "function"
    ) {
      return window.AppState.save();
    }

    return Promise.resolve();
  }

  function toast(message) {
    if (
      typeof window.toast ===
      "function"
    ) {
      window.toast(message);
    }
  }


  /* -------------------------------------------------------
     DATA
     ------------------------------------------------------- */

  function items() {
    return getBusiness()?.items || [];
  }

  function categories() {
    return [
      ...new Set(
        items()
          .map(item => item.category)
          .filter(Boolean)
      )
    ].sort();
  }

  function filteredItems() {
    const query =
      INVENTORY.search
        .trim()
        .toLowerCase();

    return items().filter(item => {
      const matchesQuery =
        !query ||
        [
          item.name,
          item.sku,
          item.barcode,
          item.category
        ].some(value =>
          String(value || "")
            .toLowerCase()
            .includes(query)
        );

      const matchesCategory =
        INVENTORY.category === "all" ||
        item.category ===
          INVENTORY.category;

      const stock =
        Number(item.stock || 0);

      const matchesFilter =
        INVENTORY.filter === "all" ||
        (
          INVENTORY.filter ===
          "low" &&
          stock > 0 &&
          stock <= 5
        ) ||
        (
          INVENTORY.filter ===
          "out" &&
          stock <= 0
        );

      return (
        matchesQuery &&
        matchesCategory &&
        matchesFilter
      );
    });
  }


  /* -------------------------------------------------------
     METRICS
     ------------------------------------------------------- */

  function metrics() {
    const list = items();

    const totalUnits =
      list.reduce(
        (sum, item) =>
          sum +
          Number(item.stock || 0),
        0
      );

    const inventoryCost =
      list.reduce(
        (sum, item) =>
          sum +
          Number(item.stock || 0) *
          Number(item.cost || 0),
        0
      );

    const inventoryRetail =
      list.reduce(
        (sum, item) =>
          sum +
          Number(item.stock || 0) *
          Number(item.selling || 0),
        0
      );

    const lowStock =
      list.filter(item => {
        const stock =
          Number(item.stock || 0);

        return (
          stock > 0 &&
          stock <= 5
        );
      }).length;

    const outOfStock =
      list.filter(item =>
        Number(item.stock || 0) <= 0
      ).length;

    return {
      products: list.length,
      totalUnits,
      inventoryCost,
      inventoryRetail,
      potentialProfit:
        inventoryRetail -
        inventoryCost,
      lowStock,
      outOfStock
    };
  }


  /* -------------------------------------------------------
     PRODUCT CRUD
     ------------------------------------------------------- */

  async function saveProduct(data) {
    const current =
      getBusiness();

    if (!current) {
      throw new Error(
        "No active business."
      );
    }

    const name =
      String(data.name || "")
        .trim();

    if (!name) {
      throw new Error(
        "Product name is required."
      );
    }

    const selling =
      Math.max(
        0,
        Number(data.selling || 0)
      );

    const cost =
      Math.max(
        0,
        Number(data.cost || 0)
      );

    const stock =
      Math.max(
        0,
        Number(data.stock || 0)
      );

    const taxRate =
      Math.max(
        0,
        Number(
          data.taxRate ??
          current.taxRate ??
          0
        )
      );

    const now =
      new Date().toISOString();

    let nextItems;

    if (INVENTORY.editingId) {
      nextItems =
        items().map(item =>
          item.id ===
          INVENTORY.editingId
            ? {
                ...item,
                name,
                sku:
                  String(
                    data.sku || ""
                  ).trim(),
                barcode:
                  String(
                    data.barcode || ""
                  ).trim(),
                category:
                  String(
                    data.category ||
                    "General"
                  ).trim(),
                unit:
                  String(
                    data.unit ||
                    "pcs"
                  ).trim(),
                cost,
                selling,
                stock,
                taxRate,
                hsn:
                  String(
                    data.hsn || ""
                  ).trim(),
                taxExempt:
                  Boolean(
                    data.taxExempt
                  ),
                lowStock:
                  Math.max(
                    0,
                    Number(
                      data.lowStock ||
                      5
                    )
                  ),
                updatedAt: now
              }
            : item
        );
    } else {
      const id =
        `item-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;

      nextItems = [
        ...items(),
        {
          id,
          name,
          sku:
            String(
              data.sku || ""
            ).trim(),
          barcode:
            String(
              data.barcode || ""
            ).trim(),
          category:
            String(
              data.category ||
              "General"
            ).trim(),
          unit:
            String(
              data.unit ||
              "pcs"
            ).trim(),
          cost,
          selling,
          stock,
          taxRate,
          hsn:
            String(
              data.hsn || ""
            ).trim(),
          taxExempt:
            Boolean(
              data.taxExempt
            ),
          lowStock:
            Math.max(
              0,
              Number(
                data.lowStock ||
                5
              )
            ),
          icon: "•",
          createdAt: now,
          updatedAt: now
        }
      ];
    }

    const updated = {
      ...current,
      items: nextItems,
      updatedAt: now
    };

    await saveBusiness(
      updated
    );

    INVENTORY.modal = null;
    INVENTORY.editingId = null;

    render();

    toast(
      "Product saved successfully."
    );
  }


  async function deleteProduct(id) {
    const current =
      getBusiness();

    if (!current) return;

    const product =
      items().find(
        item => item.id === id
      );

    if (!product) return;

    const usedInInvoices =
      (
        current.invoices || []
      ).some(invoice =>
        (
          invoice.items || []
        ).some(line =>
          line.itemId === id
        )
      );

    /*
     * Never physically delete historical
     * products that already appear on invoices.
     */
    if (usedInInvoices) {
      const updated = {
        ...current,

        items:
          items().map(item =>
            item.id === id
              ? {
                  ...item,
                  archived: true,
                  updatedAt:
                    new Date()
                      .toISOString()
                }
              : item
          ),

        updatedAt:
          new Date().toISOString()
      };

      await saveBusiness(
        updated
      );

      toast(
        "Product archived because it has sales history."
      );
    } else {
      const updated = {
        ...current,

        items:
          items().filter(
            item =>
              item.id !== id
          ),

        updatedAt:
          new Date().toISOString()
      };

      await saveBusiness(
        updated
      );

      toast(
        "Product deleted."
      );
    }

    render();
  }


  /* -------------------------------------------------------
     STOCK ADJUSTMENT
     ------------------------------------------------------- */

  async function adjustStock(
    id,
    quantity,
    type = "adjustment",
    reason = ""
  ) {
    const current =
      getBusiness();

    if (!current) return;

    const product =
      items().find(
        item => item.id === id
      );

    if (!product) return;

    const change =
      Number(quantity || 0);

    if (!change) return;

    const oldStock =
      Number(product.stock || 0);

    const newStock =
      Math.max(
        0,
        oldStock + change
      );

    const actualChange =
      newStock - oldStock;

    const now =
      new Date().toISOString();

    const updated = {
      ...current,

      items:
        items().map(item =>
          item.id === id
            ? {
                ...item,
                stock: newStock,
                updatedAt: now
              }
            : item
        ),

      stockLog: [
        ...(current.stockLog || []),
        {
          id:
            `stock-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 8)}`,

          type,

          itemId: id,

          quantity:
            actualChange,

          previousStock:
            oldStock,

          newStock,

          reason:
            String(reason || "")
              .trim(),

          createdAt: now
        }
      ],

      updatedAt: now
    };

    await saveBusiness(
      updated
    );

    render();

    toast(
      actualChange >= 0
        ? `Added ${actualChange} ${product.unit || "units"}.`
        : `Removed ${Math.abs(actualChange)} ${product.unit || "units"}.`
    );
  }


  /* -------------------------------------------------------
     PRODUCT FORM
     ------------------------------------------------------- */

  function productForm() {
    const product =
      INVENTORY.editingId
        ? items().find(
            item =>
              item.id ===
              INVENTORY.editingId
          )
        : null;

    return `
      <div class="inventory-modal-backdrop"
           data-inventory-close>

        <div
          class="inventory-modal"
          role="dialog"
          aria-modal="true"
          aria-label="${
            product
              ? "Edit product"
              : "Add product"
          }"
          data-inventory-modal
        >

          <div class="inventory-modal-head">

            <div>
              <span class="eyebrow">
                Inventory
              </span>

              <h3>
                ${
                  product
                    ? "Edit product"
                    : "Add product"
                }
              </h3>
            </div>

            <button
              type="button"
              class="icon-btn"
              data-inventory-close
              aria-label="Close"
            >
              ×
            </button>

          </div>


          <form
            class="inventory-form"
            data-product-form
          >

            <div class="inventory-form-grid">

              <label>
                <span>Product name *</span>
                <input
                  name="name"
                  required
                  value="${esc(
                    product?.name || ""
                  )}"
                  placeholder="e.g. Coffee"
                >
              </label>


              <label>
                <span>Category</span>
                <input
                  name="category"
                  value="${esc(
                    product?.category ||
                    "General"
                  )}"
                  placeholder="Beverages"
                >
              </label>


              <label>
                <span>SKU</span>
                <input
                  name="sku"
                  value="${esc(
                    product?.sku || ""
                  )}"
                  placeholder="SKU-001"
                >
              </label>


              <label>
                <span>Barcode</span>
                <input
                  name="barcode"
                  value="${esc(
                    product?.barcode || ""
                  )}"
                  placeholder="Scan or enter barcode"
                >
              </label>


              <label>
                <span>Cost price</span>
                <input
                  name="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value="${
                    Number(
                      product?.cost || 0
                    )
                  }"
                >
              </label>


              <label>
                <span>Selling price</span>
                <input
                  name="selling"
                  type="number"
                  min="0"
                  step="0.01"
                  value="${
                    Number(
                      product?.selling || 0
                    )
                  }"
                >
              </label>


              <label>
                <span>Opening stock</span>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  step="0.01"
                  value="${
                    Number(
                      product?.stock || 0
                    )
                  }"
                >
              </label>


              <label>
                <span>Unit</span>
                <select name="unit">

                  ${[
                    "pcs",
                    "kg",
                    "g",
                    "L",
                    "ml",
                    "box",
                    "pack",
                    "dozen"
                  ]
                    .map(
                      unit => `
                        <option
                          value="${unit}"
                          ${
                            (
                              product?.unit ||
                              "pcs"
                            ) === unit
                              ? "selected"
                              : ""
                          }
                        >
                          ${unit}
                        </option>
                      `
                    )
                    .join("")}

                </select>
              </label>


              <label>
                <span>Tax rate %</span>
                <input
                  name="taxRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value="${
                    Number(
                      product?.taxRate ??
                      getBusiness()
                        ?.taxRate ??
                      0
                    )
                  }"
                >
              </label>


              <label>
                <span>Low-stock alert at</span>
                <input
                  name="lowStock"
                  type="number"
                  min="0"
                  step="1"
                  value="${
                    Number(
                      product?.lowStock ??
                      5
                    )
                  }"
                >
              </label>


              <label>
                <span>HSN / SAC</span>
                <input
                  name="hsn"
                  value="${esc(
                    product?.hsn || ""
                  )}"
                  placeholder="Optional"
                >
              </label>

            </div>


            <label class="inventory-check">

              <input
                name="taxExempt"
                type="checkbox"
                ${
                  product?.taxExempt
                    ? "checked"
                    : ""
                }
              >

              <span>
                Tax exempt product
              </span>

            </label>


            <div class="inventory-form-actions">

              <button
                type="button"
                class="secondary-btn"
                data-inventory-close
              >
                Cancel
              </button>

              <button
                type="submit"
                class="primary-btn"
              >
                ${
                  product
                    ? "Save changes"
                    : "Add product"
                }
              </button>

            </div>

          </form>

        </div>
      </div>
    `;
  }


  /* -------------------------------------------------------
     TABLE ROW
     ------------------------------------------------------- */

  function row(product) {
    const stock =
      Number(product.stock || 0);

    const threshold =
      Number(
        product.lowStock ?? 5
      );

    const status =
      stock <= 0
        ? "out"
        : stock <= threshold
          ? "low"
          : "healthy";

    return `
      <tr>

        <td>

          <div class="inventory-product-name">

            <span class="inventory-product-icon">
              ${esc(
                product.icon || "•"
              )}
            </span>

            <div>
              <strong>
                ${esc(
                  product.name
                )}
              </strong>

              <small>
                ${
                  product.sku
                    ? `SKU: ${esc(
                        product.sku
                      )}`
                    : "No SKU"
                }
              </small>
            </div>

          </div>

        </td>


        <td>
          ${esc(
            product.category ||
            "General"
          )}
        </td>


        <td>
          ${money(
            product.cost
          )}
        </td>


        <td>
          ${money(
            product.selling
          )}
        </td>


        <td>
          <strong>
            ${stock}
          </strong>
          <small>
            ${esc(
              product.unit ||
              "pcs"
            )}
          </small>
        </td>


        <td>

          <span
            class="inventory-status ${status}"
          >
            ${
              status === "out"
                ? "Out of stock"
                : status === "low"
                  ? "Low stock"
                  : "In stock"
            }
          </span>

        </td>


        <td>

          <div class="inventory-actions">

            <button
              type="button"
              class="secondary-btn"
              data-stock-add="${esc(
                product.id
              )}"
            >
              + Stock
            </button>

            <button
              type="button"
              class="icon-btn"
              data-product-edit="${esc(
                product.id
              )}"
              title="Edit"
            >
              ✎
            </button>

            <button
              type="button"
              class="icon-btn"
              data-product-delete="${esc(
                product.id
              )}"
              title="Delete"
            >
              ×
            </button>

          </div>

        </td>

      </tr>
    `;
  }


  /* -------------------------------------------------------
     VIEW
     ------------------------------------------------------- */

  function view() {
    return `
      <main class="page">

        <div id="inventory-view"></div>

      </main>
    `;
  }


  /* -------------------------------------------------------
     RENDER
     ------------------------------------------------------- */

  function render() {
    const root =
      document.querySelector(
        "#inventory-view"
      );

    if (!root) return;

    const stats =
      metrics();

    const list =
      filteredItems();

    root.innerHTML = `

      <section class="inventory-page">


        <div class="inventory-header">

          <div>
            <span class="eyebrow">
              Stock control
            </span>

            <h2>
              Inventory
            </h2>

            <p class="sub">
              Track products, stock levels,
              pricing and inventory value.
            </p>
          </div>


          <button
            type="button"
            class="primary-btn"
            data-product-add
          >
            + Add product
          </button>

        </div>


        <div class="inventory-stats">

          <div class="inventory-stat-card">
            <span>Products</span>
            <strong>
              ${stats.products}
            </strong>
          </div>

          <div class="inventory-stat-card">
            <span>Total units</span>
            <strong>
              ${stats.totalUnits}
            </strong>
          </div>

          <div class="inventory-stat-card">
            <span>Inventory cost</span>
            <strong>
              ${money(
                stats.inventoryCost
              )}
            </strong>
          </div>

          <div class="inventory-stat-card">
            <span>Retail value</span>
            <strong>
              ${money(
                stats.inventoryRetail
              )}
            </strong>
          </div>

          <div class="inventory-stat-card ${
            stats.lowStock
              ? "is-warning"
              : ""
          }">
            <span>Low stock</span>
            <strong>
              ${stats.lowStock}
            </strong>
          </div>

          <div class="inventory-stat-card ${
            stats.outOfStock
              ? "is-danger"
              : ""
          }">
            <span>Out of stock</span>
            <strong>
              ${stats.outOfStock}
            </strong>
          </div>

        </div>


        <div class="inventory-toolbar">

          <input
            id="inventory-search"
            type="search"
            placeholder="Search product, SKU or barcode…"
            autocomplete="off"
            value="${esc(
              INVENTORY.search
            )}"
          >


          <select
            id="inventory-category"
          >

            <option value="all">
              All categories
            </option>

            ${categories()
              .map(
                category => `
                  <option
                    value="${esc(
                      category
                    )}"
                    ${
                      INVENTORY.category ===
                      category
                        ? "selected"
                        : ""
                    }
                  >
                    ${esc(
                      category
                    )}
                  </option>
                `
              )
              .join("")}

          </select>


          <select
            id="inventory-filter"
          >

            <option
              value="all"
              ${
                INVENTORY.filter ===
                "all"
                  ? "selected"
                  : ""
              }
            >
              All stock
            </option>

            <option
              value="low"
              ${
                INVENTORY.filter ===
                "low"
                  ? "selected"
                  : ""
              }
            >
              Low stock
            </option>

            <option
              value="out"
              ${
                INVENTORY.filter ===
                "out"
                  ? "selected"
                  : ""
              }
            >
              Out of stock
            </option>

          </select>

        </div>


        <div class="inventory-table-wrap">

          <table class="inventory-table">

            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Cost</th>
                <th>Selling</th>
                <th>Stock</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>

              ${
                list.length
                  ? list
                      .map(row)
                      .join("")
                  : `
                    <tr>
                      <td
                        colspan="7"
                        class="inventory-empty"
                      >
                        ${
                          items().length
                            ? "No products match your filters."
                            : "No products yet. Add your first product."
                        }
                      </td>
                    </tr>
                  `
              }

            </tbody>

          </table>

        </div>


        ${
          INVENTORY.modal ===
          "product"
            ? productForm()
            : ""
        }

      </section>
    `;
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
            "[data-product-add]"
          );

        if (add) {
          INVENTORY.modal =
            "product";

          INVENTORY.editingId =
            null;

          render();
          return;
        }


        const edit =
          event.target.closest(
            "[data-product-edit]"
          );

        if (edit) {
          INVENTORY.modal =
            "product";

          INVENTORY.editingId =
            edit.dataset.productEdit;

          render();
          return;
        }


        const close =
          event.target.closest(
            "[data-inventory-close]"
          );

        if (close) {
          INVENTORY.modal =
            null;

          INVENTORY.editingId =
            null;

          render();
          return;
        }


        const deleteButton =
          event.target.closest(
            "[data-product-delete]"
          );

        if (deleteButton) {
          const id =
            deleteButton.dataset
              .productDelete;

          if (
            confirm(
              "Delete/archive this product?"
            )
          ) {
            deleteProduct(id)
              .catch(error => {
                console.error(
                  error
                );

                toast(
                  error.message ||
                  "Unable to delete product."
                );
              });
          }

          return;
        }


        const stock =
          event.target.closest(
            "[data-stock-add]"
          );

        if (stock) {
          const id =
            stock.dataset
              .stockAdd;

          const amount =
            prompt(
              "How many units should be added?"
            );

          if (
            amount !== null
          ) {
            const quantity =
              Number(amount);

            if (
              Number.isFinite(
                quantity
              ) &&
              quantity > 0
            ) {
              adjustStock(
                id,
                quantity,
                "purchase",
                "Manual stock-in"
              ).catch(error => {
                console.error(
                  error
                );

                toast(
                  error.message ||
                  "Unable to update stock."
                );
              });
            }
          }

          return;
        }

      }
    );


    document.addEventListener(
      "input",
      event => {

        if (
          event.target.id ===
          "inventory-search"
        ) {
          INVENTORY.search =
            event.target.value;

          const table =
            document.querySelector(
              ".inventory-table tbody"
            );

          if (!table) return;

          const list =
            filteredItems();

          table.innerHTML =
            list.length
              ? list
                  .map(row)
                  .join("")
              : `
                <tr>
                  <td
                    colspan="7"
                    class="inventory-empty"
                  >
                    No matching products.
                  </td>
                </tr>
              `;

          return;
        }

      }
    );


    document.addEventListener(
      "change",
      event => {

        if (
          event.target.id ===
          "inventory-category"
        ) {
          INVENTORY.category =
            event.target.value;

          render();
          return;
        }


        if (
          event.target.id ===
          "inventory-filter"
        ) {
          INVENTORY.filter =
            event.target.value;

          render();
          return;
        }

      }
    );


    document.addEventListener(
      "submit",
      event => {

        const form =
          event.target.closest(
            "[data-product-form]"
          );

        if (!form) return;

        event.preventDefault();

        const formData =
          new FormData(form);

        saveProduct({
          name:
            formData.get("name"),

          category:
            formData.get("category"),

          sku:
            formData.get("sku"),

          barcode:
            formData.get("barcode"),

          cost:
            formData.get("cost"),

          selling:
            formData.get("selling"),

          stock:
            formData.get("stock"),

          unit:
            formData.get("unit"),

          taxRate:
            formData.get("taxRate"),

          lowStock:
            formData.get("lowStock"),

          hsn:
            formData.get("hsn"),

          taxExempt:
            formData.get(
              "taxExempt"
            ) === "on"
        }).catch(error => {
          console.error(
            "Inventory save failed:",
            error
          );

          toast(
            error.message ||
            "Unable to save product."
          );
        });

      }
    );


    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Escape" &&
          INVENTORY.modal
        ) {
          INVENTORY.modal =
            null;

          INVENTORY.editingId =
            null;

          render();
        }

      }
    );
  }


  bindEvents();


  /* -------------------------------------------------------
     PUBLIC API
     ------------------------------------------------------- */

  window.Inventory =
    Object.freeze({
      view,
      render,
      saveProduct,
      adjustStock,
      deleteProduct
    });

})();
