/* =========================================================
   ORBIT BIZASSIST — KHATA
   Customer credit / ledger / collections
   Production-ready local-first module
   ========================================================= */

(() => {
  "use strict";

  const KHATA = {
    search: "",
    filter: "all",
    selectedCustomerId: "",
    showForm: false,
    showPayment: false,
    editingCustomerId: ""
  };

  /* -------------------------------------------------------
     HELPERS
     ------------------------------------------------------- */

  const state = () =>
    window.AppState?.get?.() || {};

  const business = () =>
    window.AppState?.business?.() ||
    state().businesses?.[0] ||
    null;

  const money = value =>
    window.money
      ? window.money(value)
      : `₹${Number(value || 0).toFixed(2)}`;

  const esc = value =>
    window.AppUtils?.esc
      ? window.AppUtils.esc(value)
      : String(value ?? "").replace(
          /[&<>'"]/g,
          char =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              "'": "&#39;",
              '"': "&quot;"
            }[char])
        );

  const id = prefix =>
    `${prefix}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

  const now = () =>
    new Date().toISOString();

  const notify = message => {
    if (typeof window.toast === "function") {
      window.toast(message);
    }
  };

  const numeric = value =>
    Math.max(0, Number(value) || 0);

  /* -------------------------------------------------------
     CUSTOMER NORMALIZATION
     ------------------------------------------------------- */

  function normalizeCustomer(customer = {}) {
    return {
      id: customer.id || id("customer"),

      name:
        String(customer.name || "").trim(),

      phone:
        String(customer.phone || "").trim(),

      email:
        String(customer.email || "").trim(),

      address:
        String(customer.address || "").trim(),

      gstin:
        String(customer.gstin || "").trim(),

      creditLimit:
        numeric(customer.creditLimit),

      dueDays:
        Math.max(
          0,
          Number(customer.dueDays ?? 30) || 0
        ),

      notes:
        String(customer.notes || "").trim(),

      createdAt:
        customer.createdAt || now(),

      updatedAt:
        now(),

      archived:
        Boolean(customer.archived)
    };
  }

  function customers() {
    return (
      business()?.contacts || []
    ).map(normalizeCustomer);
  }

  function customerById(customerId) {
    return (
      customers().find(
        customer =>
          customer.id === customerId
      ) || null
    );
  }

  /* -------------------------------------------------------
     LEDGER
     ------------------------------------------------------- */

  function ledger() {
    return business()?.ledger || [];
  }

  function customerLedger(customerId) {
    return ledger()
      .filter(entry =>
        entry.customerId === customerId
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );
  }

  function ledgerDebit(customerId) {
    return customerLedger(customerId)
      .reduce(
        (sum, entry) =>
          sum + numeric(entry.debit),
        0
      );
  }

  function ledgerCredit(customerId) {
    return customerLedger(customerId)
      .reduce(
        (sum, entry) =>
          sum + numeric(entry.credit),
        0
      );
  }

  function outstanding(customerId) {
    return Math.max(
      0,
      ledgerDebit(customerId) -
        ledgerCredit(customerId)
    );
  }

  function customerStats(customerId) {
    const entries =
      customerLedger(customerId);

    let purchases = 0;
    let payments = 0;
    let returns = 0;

    entries.forEach(entry => {
      purchases += numeric(entry.debit);
      payments += numeric(entry.credit);

      if (
        entry.type === "return" ||
        entry.type === "credit-note"
      ) {
        returns += numeric(entry.credit);
      }
    });

    return {
      purchases,
      payments,
      returns,
      outstanding:
        Math.max(
          0,
          purchases - payments
        )
    };
  }

  /* -------------------------------------------------------
     CUSTOMER SUMMARY
     ------------------------------------------------------- */

  function customerSummary(customer) {
    const stats =
      customerStats(customer.id);

    const entries =
      customerLedger(customer.id);

    const invoices = entries.filter(
      entry =>
        entry.type === "sale" &&
        entry.invoiceId
    ).length;

    return {
      ...stats,
      invoices,
      lastActivity:
        entries[0]?.createdAt || null
    };
  }

  function allCustomerRows() {
    return customers()
      .filter(customer => !customer.archived)
      .map(customer => ({
        customer,
        ...customerSummary(customer)
      }));
  }

  /* -------------------------------------------------------
     SEARCH / FILTER
     ------------------------------------------------------- */

  function filteredCustomers() {
    const query =
      KHATA.search
        .trim()
        .toLowerCase();

    return allCustomerRows().filter(row => {
      const customer = row.customer;

      const matchesSearch =
        !query ||
        [
          customer.name,
          customer.phone,
          customer.email,
          customer.gstin
        ].some(value =>
          String(value || "")
            .toLowerCase()
            .includes(query)
        );

      if (!matchesSearch) {
        return false;
      }

      if (KHATA.filter === "due") {
        return row.outstanding > 0;
      }

      if (KHATA.filter === "clear") {
        return row.outstanding <= 0;
      }

      if (KHATA.filter === "high") {
        return row.outstanding >= 10000;
      }

      return true;
    });
  }

  /* -------------------------------------------------------
     CUSTOMER WRITE OPERATIONS
     ------------------------------------------------------- */

  function saveCustomer(data) {
    const current =
      business();

    if (!current) {
      notify("No active business found.");
      return false;
    }

    const name =
      String(data.name || "").trim();

    const phone =
      String(data.phone || "").trim();

    if (!name && !phone) {
      notify(
        "Enter customer name or phone number."
      );
      return false;
    }

    const normalized =
      normalizeCustomer(data);

    const existing =
      (current.contacts || [])
        .findIndex(
          customer =>
            customer.id === normalized.id
        );

    const contacts =
      [...(current.contacts || [])];

    if (existing >= 0) {
      contacts[existing] = {
        ...contacts[existing],
        ...normalized,
        updatedAt: now()
      };
    } else {
      contacts.push(normalized);
    }

    window.AppState.updateBusiness?.(
      current.id,
      {
        contacts
      }
    );

    KHATA.selectedCustomerId =
      normalized.id;

    KHATA.showForm = false;
    KHATA.editingCustomerId = "";

    notify(
      existing >= 0
        ? "Customer updated."
        : "Customer added."
    );

    render();

    return normalized;
  }

  function archiveCustomer(customerId) {
    const current =
      business();

    const customer =
      customerById(customerId);

    if (!current || !customer) {
      return;
    }

    if (
      outstanding(customerId) > 0
    ) {
      notify(
        "Customer has outstanding credit. Clear the balance before archiving."
      );
      return;
    }

    const contacts =
      (current.contacts || [])
        .map(item =>
          item.id === customerId
            ? {
                ...item,
                archived: true,
                updatedAt: now()
              }
            : item
        );

    window.AppState.updateBusiness?.(
      current.id,
      { contacts }
    );

    if (
      KHATA.selectedCustomerId ===
      customerId
    ) {
      KHATA.selectedCustomerId = "";
    }

    notify("Customer archived.");
    render();
  }

  /* -------------------------------------------------------
     PAYMENT / COLLECTION
     ------------------------------------------------------- */

  function recordPayment({
    customerId,
    amount,
    method = "Cash",
    reference = "",
    notes = "",
    date = now()
  }) {
    const current =
      business();

    const customer =
      customerById(customerId);

    const value =
      numeric(amount);

    if (!current || !customer) {
      notify("Customer not found.");
      return false;
    }

    if (value <= 0) {
      notify(
        "Enter a valid payment amount."
      );
      return false;
    }

    const due =
      outstanding(customerId);

    if (due <= 0) {
      notify(
        "This customer has no outstanding balance."
      );
      return false;
    }

    if (value > due) {
      notify(
        `Maximum payable amount is ${money(due)}.`
      );
      return false;
    }

    const entry = {
      id: id("ledger"),

      customerId,

      businessId:
        current.id,

      type: "payment",

      debit: 0,

      credit: value,

      amount: value,

      method,

      reference:
        String(reference || "").trim(),

      notes:
        String(notes || "").trim(),

      createdAt: date,

      createdBy:
        state().user?.name ||
        "Owner / Admin"
    };

    const ledgerNext = [
      ...(current.ledger || []),
      entry
    ];

    window.AppState.updateBusiness?.(
      current.id,
      {
        ledger: ledgerNext
      }
    );

    KHATA.showPayment = false;

    notify(
      `${money(value)} payment recorded.`
    );

    render();

    return entry;
  }

  /* -------------------------------------------------------
     CREDIT SALE
     ------------------------------------------------------- */

  function recordCreditSale({
    customerId,
    invoice,
    amount,
    dueDate = null
  }) {
    const current =
      business();

    const customer =
      customerById(customerId);

    const value =
      numeric(amount);

    if (
      !current ||
      !customer ||
      value <= 0
    ) {
      return false;
    }

    const currentDue =
      outstanding(customerId);

    const limit =
      numeric(customer.creditLimit);

    if (
      limit > 0 &&
      currentDue + value > limit
    ) {
      notify(
        `Credit limit exceeded. Available credit: ${money(
          Math.max(
            0,
            limit - currentDue
          )
        )}.`
      );

      return false;
    }

    const entry = {
      id: id("ledger"),

      customerId,

      businessId:
        current.id,

      type: "sale",

      invoiceId:
        invoice?.id || null,

      invoiceNumber:
        invoice?.invoiceNumber ||
        invoice?.number ||
        "",

      debit: value,

      credit: 0,

      amount: value,

      dueDate:
        dueDate ||
        calculateDueDate(
          customer.dueDays
        ),

      notes:
        invoice?.notes || "",

      createdAt: now(),

      createdBy:
        state().user?.name ||
        "Owner / Admin"
    };

    window.AppState.updateBusiness?.(
      current.id,
      {
        ledger: [
          ...(current.ledger || []),
          entry
        ]
      }
    );

    return entry;
  }

  function calculateDueDate(days = 30) {
    const date =
      new Date();

    date.setDate(
      date.getDate() +
        Math.max(
          0,
          Number(days) || 0
        )
    );

    return date.toISOString();
  }

  /* -------------------------------------------------------
     STATEMENT
     ------------------------------------------------------- */

  function statement(customerId) {
    const customer =
      customerById(customerId);

    if (!customer) {
      return null;
    }

    const entries =
      customerLedger(customerId);

    let running = 0;

    const rows =
      [...entries]
        .reverse()
        .map(entry => {
          running +=
            numeric(entry.debit) -
            numeric(entry.credit);

          return {
            ...entry,
            balance:
              Math.max(0, running)
          };
        })
        .reverse();

    return {
      customer,
      entries: rows,
      summary:
        customerSummary(customer)
    };
  }

  /* -------------------------------------------------------
     WHATSAPP REMINDER
     ------------------------------------------------------- */

  function whatsappReminder(customerId) {
    const customer =
      customerById(customerId);

    if (!customer) {
      return;
    }

    if (!customer.phone) {
      notify(
        "Customer does not have a phone number."
      );
      return;
    }

    const due =
      outstanding(customerId);

    if (due <= 0) {
      notify(
        "Customer has no outstanding balance."
      );
      return;
    }

    const businessName =
      business()?.name ||
      "Our business";

    const message =
      `Hello ${customer.name || "Customer"}, ` +
      `this is a friendly reminder from ` +
      `${businessName}. ` +
      `Your outstanding balance is ` +
      `${money(due)}. ` +
      `Please contact us if you have already made the payment. Thank you.`;

    const phone =
      customer.phone
        .replace(/\D/g, "");

    const url =
      `https://wa.me/${phone}?text=` +
      encodeURIComponent(message);

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  /* -------------------------------------------------------
     CUSTOMER CARD
     ------------------------------------------------------- */

  function customerCard(row) {
    const customer =
      row.customer;

    const initial =
      (
        customer.name ||
        customer.phone ||
        "C"
      )
        .charAt(0)
        .toUpperCase();

    return `
      <button
        type="button"
        class="khata-customer-card ${
          KHATA.selectedCustomerId ===
          customer.id
            ? "is-selected"
            : ""
        }"
        data-khata-customer="${
          esc(customer.id)
        }"
      >

        <span class="khata-avatar">
          ${esc(initial)}
        </span>

        <span class="khata-customer-main">

          <strong>
            ${esc(
              customer.name ||
              "Unnamed customer"
            )}
          </strong>

          <small>
            ${esc(
              customer.phone ||
              "No phone number"
            )}
          </small>

        </span>

        <span class="khata-customer-balance ${
          row.outstanding > 0
            ? "is-due"
            : "is-clear"
        }">

          ${
            row.outstanding > 0
              ? money(row.outstanding)
              : "Clear"
          }

        </span>

      </button>
    `;
  }

  /* -------------------------------------------------------
     CUSTOMER DETAIL
     ------------------------------------------------------- */

  function customerDetail() {
    const customer =
      customerById(
        KHATA.selectedCustomerId
      );

    if (!customer) {
      return `
        <div class="khata-empty-detail">
          <div class="khata-empty-icon">₹</div>
          <h3>Select a customer</h3>
          <p>
            Choose a customer to view their
            ledger, outstanding balance and
            payment history.
          </p>
        </div>
      `;
    }

    const summary =
      customerSummary(customer);

    const entries =
      customerLedger(customer.id);

    return `
      <div class="khata-detail">

        <div class="khata-detail-head">

          <div>

            <span class="eyebrow">
              Customer account
            </span>

            <h2>
              ${esc(
                customer.name ||
                "Customer"
              )}
            </h2>

            <p class="sub">
              ${esc(
                customer.phone ||
                "No phone number"
              )}
            </p>

          </div>

          <div class="khata-detail-actions">

            <button
              type="button"
              class="secondary-btn"
              data-khata-edit="${
                esc(customer.id)
              }"
            >
              Edit
            </button>

            <button
              type="button"
              class="secondary-btn"
              data-khata-whatsapp="${
                esc(customer.id)
              }"
            >
              WhatsApp reminder
            </button>

          </div>

        </div>


        <div class="khata-stat-grid">

          <div class="khata-stat">

            <span>Total purchases</span>

            <strong>
              ${money(
                summary.purchases
              )}
            </strong>

          </div>

          <div class="khata-stat">

            <span>Paid</span>

            <strong>
              ${money(
                summary.payments
              )}
            </strong>

          </div>

          <div class="khata-stat ${
            summary.outstanding > 0
              ? "is-danger"
              : ""
          }">

            <span>Outstanding</span>

            <strong>
              ${money(
                summary.outstanding
              )}
            </strong>

          </div>

          <div class="khata-stat">

            <span>Invoices</span>

            <strong>
              ${summary.invoices}
            </strong>

          </div>

        </div>


        <div class="khata-account-actions">

          <button
            type="button"
            class="primary-btn"
            data-khata-payment="${
              esc(customer.id)
            }"
            ${
              summary.outstanding <= 0
                ? "disabled"
                : ""
            }
          >
            Receive payment
          </button>

          <button
            type="button"
            class="secondary-btn"
            data-khata-statement="${
              esc(customer.id)
            }"
          >
            View statement
          </button>

        </div>


        <div class="khata-ledger">

          <div class="khata-section-head">

            <div>
              <h3>Ledger</h3>
              <p>
                Complete account activity
              </p>
            </div>

          </div>

          ${
            entries.length
              ? entries
                  .map(ledgerRow)
                  .join("")
              : `
                <div class="khata-empty">
                  No transactions yet.
                </div>
              `
          }

        </div>

      </div>
    `;
  }

  function ledgerRow(entry) {
    const isPayment =
      entry.type === "payment";

    const isReturn =
      entry.type === "return" ||
      entry.type === "credit-note";

    const amount =
      numeric(entry.amount) ||
      numeric(
        isPayment || isReturn
          ? entry.credit
          : entry.debit
      );

    const label =
      isPayment
        ? "Payment received"
        : isReturn
        ? "Return / credit"
        : entry.type === "sale"
        ? "Credit sale"
        : "Ledger entry";

    const sign =
      isPayment || isReturn
        ? "-"
        : "+";

    return `
      <div class="khata-ledger-row">

        <div>

          <strong>
            ${esc(label)}
          </strong>

          <small>
            ${formatDate(
              entry.createdAt
            )}

            ${
              entry.invoiceNumber
                ? ` · Invoice ${esc(
                    entry.invoiceNumber
                  )}`
                : ""
            }
          </small>

        </div>

        <strong class="${
          isPayment || isReturn
            ? "is-credit"
            : "is-debit"
        }">

          ${sign}${money(amount)}

        </strong>

      </div>
    `;
  }

  function formatDate(value) {
    if (!value) return "—";

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleDateString(
      undefined,
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  }

  /* -------------------------------------------------------
     CUSTOMER FORM
     ------------------------------------------------------- */

  function customerForm() {
    const editing =
      KHATA.editingCustomerId
        ? customerById(
            KHATA.editingCustomerId
          )
        : null;

    const customer =
      editing || {};

    return `
      <div class="khata-modal-backdrop"
           data-khata-close-form>

        <div
          class="khata-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Customer"
          data-khata-modal
        >

          <div class="khata-modal-head">

            <div>
              <span class="eyebrow">
                Customer
              </span>

              <h2>
                ${
                  editing
                    ? "Edit customer"
                    : "Add customer"
                }
              </h2>
            </div>

            <button
              type="button"
              class="khata-modal-close"
              data-khata-close
              aria-label="Close"
            >
              ×
            </button>

          </div>


          <form id="khata-customer-form">

            <div class="khata-form-grid">

              <label>
                <span>Name</span>
                <input
                  name="name"
                  required
                  autocomplete="name"
                  value="${esc(
                    customer.name || ""
                  )}"
                  placeholder="Customer name"
                >
              </label>

              <label>
                <span>Phone</span>
                <input
                  name="phone"
                  autocomplete="tel"
                  value="${esc(
                    customer.phone || ""
                  )}"
                  placeholder="Phone number"
                >
              </label>

              <label>
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  autocomplete="email"
                  value="${esc(
                    customer.email || ""
                  )}"
                  placeholder="Email address"
                >
              </label>

              <label>
                <span>GSTIN</span>
                <input
                  name="gstin"
                  value="${esc(
                    customer.gstin || ""
                  )}"
                  placeholder="Optional GSTIN"
                >
              </label>

              <label>
                <span>Credit limit</span>
                <input
                  name="creditLimit"
                  type="number"
                  min="0"
                  step="0.01"
                  value="${Number(
                    customer.creditLimit || 0
                  )}"
                  placeholder="0 = unlimited"
                >
              </label>

              <label>
                <span>Due period (days)</span>
                <input
                  name="dueDays"
                  type="number"
                  min="0"
                  step="1"
                  value="${Number(
                    customer.dueDays ?? 30
                  )}"
                >
              </label>

            </div>


            <label class="khata-form-full">
              <span>Address</span>
              <textarea
                name="address"
                rows="2"
                placeholder="Customer address"
              >${esc(
                customer.address || ""
              )}</textarea>
            </label>


            <label class="khata-form-full">
              <span>Notes</span>
              <textarea
                name="notes"
                rows="2"
                placeholder="Private customer notes"
              >${esc(
                customer.notes || ""
              )}</textarea>
            </label>


            <div class="khata-modal-actions">

              <button
                type="button"
                class="secondary-btn"
                data-khata-close
              >
                Cancel
              </button>

              <button
                type="submit"
                class="primary-btn"
              >
                ${
                  editing
                    ? "Save changes"
                    : "Add customer"
                }
              </button>

            </div>

          </form>

        </div>

      </div>
    `;
  }

  /* -------------------------------------------------------
     PAYMENT FORM
     ------------------------------------------------------- */

  function paymentForm() {
    const customer =
      customerById(
        KHATA.selectedCustomerId
      );

    if (!customer) {
      return "";
    }

    const due =
      outstanding(customer.id);

    return `
      <div class="khata-modal-backdrop"
           data-khata-close-payment>

        <div
          class="khata-modal"
          role="dialog"
          aria-modal="true"
          data-khata-payment-modal
        >

          <div class="khata-modal-head">

            <div>
              <span class="eyebrow">
                Receive payment
              </span>

              <h2>
                ${esc(
                  customer.name ||
                  "Customer"
                )}
              </h2>

              <p class="sub">
                Outstanding:
                <strong>
                  ${money(due)}
                </strong>
              </p>
            </div>

            <button
              type="button"
              class="khata-modal-close"
              data-khata-close-payment-btn
            >
              ×
            </button>

          </div>


          <form id="khata-payment-form">

            <input
              type="hidden"
              name="customerId"
              value="${esc(
                customer.id
              )}"
            >

            <label class="khata-form-full">
              <span>Amount</span>

              <input
                name="amount"
                type="number"
                min="0.01"
                max="${due}"
                step="0.01"
                required
                autofocus
                value="${due}"
              >
            </label>


            <label class="khata-form-full">
              <span>Payment method</span>

              <select name="method">

                <option value="Cash">
                  Cash
                </option>

                <option value="UPI">
                  UPI
                </option>

                <option value="Card">
                  Card
                </option>

                <option value="Bank Transfer">
                  Bank Transfer
                </option>

              </select>
            </label>


            <label class="khata-form-full">
              <span>Reference / UTR</span>

              <input
                name="reference"
                placeholder="Optional payment reference"
              >
            </label>


            <label class="khata-form-full">
              <span>Notes</span>

              <textarea
                name="notes"
                rows="2"
                placeholder="Payment note"
              ></textarea>
            </label>


            <div class="khata-modal-actions">

              <button
                type="button"
                class="secondary-btn"
                data-khata-close-payment-btn
              >
                Cancel
              </button>

              <button
                type="submit"
                class="primary-btn"
              >
                Record payment
              </button>

            </div>

          </form>

        </div>

      </div>
    `;
  }

  /* -------------------------------------------------------
     MAIN VIEW
     ------------------------------------------------------- */

  function view() {
    return `
      <main class="page">

        <div id="khata-view"></div>

      </main>
    `;
  }

  /* -------------------------------------------------------
     RENDER
     ------------------------------------------------------- */

  function render() {
    const root =
      document.querySelector(
        "#khata-view"
      );

    if (!root) return;

    const rows =
      filteredCustomers();

    const all =
      allCustomerRows();

    const totalOutstanding =
      all.reduce(
        (sum, row) =>
          sum + row.outstanding,
        0
      );

    const totalCustomers =
      all.length;

    const customersWithDue =
      all.filter(
        row =>
          row.outstanding > 0
      ).length;

    const totalPurchases =
      all.reduce(
        (sum, row) =>
          sum + row.purchases,
        0
      );

    root.innerHTML = `
      <section class="khata-workspace">

        <div class="khata-header">

          <div>
            <span class="eyebrow">
              Customer credit
            </span>

            <h1>Khata</h1>

            <p class="sub">
              Manage customers, udhaar,
              collections and account history.
            </p>
          </div>

          <button
            type="button"
            class="primary-btn"
            data-khata-add
          >
            + Add customer
          </button>

        </div>


        <div class="khata-metrics">

          <div class="khata-metric">
            <span>Customers</span>
            <strong>
              ${totalCustomers}
            </strong>
          </div>

          <div class="khata-metric is-danger">
            <span>Total outstanding</span>
            <strong>
              ${money(
                totalOutstanding
              )}
            </strong>
          </div>

          <div class="khata-metric">
            <span>Customers with due</span>
            <strong>
              ${customersWithDue}
            </strong>
          </div>

          <div class="khata-metric">
            <span>Total purchases</span>
            <strong>
              ${money(
                totalPurchases
              )}
            </strong>
          </div>

        </div>


        <div class="khata-toolbar">

          <div class="khata-search">

            <input
              id="khata-search"
              type="search"
              autocomplete="off"
              placeholder="Search customer by name, phone or GSTIN…"
              value="${esc(
                KHATA.search
              )}"
            >

          </div>


          <div class="khata-filters">

            <button
              type="button"
              class="khata-filter ${
                KHATA.filter === "all"
                  ? "is-active"
                  : ""
              }"
              data-khata-filter="all"
            >
              All
            </button>

            <button
              type="button"
              class="khata-filter ${
                KHATA.filter === "due"
                  ? "is-active"
                  : ""
              }"
              data-khata-filter="due"
            >
              Due
            </button>

            <button
              type="button"
              class="khata-filter ${
                KHATA.filter === "clear"
                  ? "is-active"
                  : ""
              }"
              data-khata-filter="clear"
            >
              Cleared
            </button>

            <button
              type="button"
              class="khata-filter ${
                KHATA.filter === "high"
                  ? "is-active"
                  : ""
              }"
              data-khata-filter="high"
            >
              High balance
            </button>

          </div>

        </div>


        <div class="khata-layout">

          <section class="khata-customers">

            <div class="khata-list-head">
              <strong>
                Customers
              </strong>

              <span>
                ${rows.length}
              </span>
            </div>

            <div class="khata-customer-list">

              ${
                rows.length
                  ? rows
                      .map(customerCard)
                      .join("")
                  : `
                    <div class="khata-empty">
                      <strong>
                        No customers found
                      </strong>

                      <p>
                        Add a customer or
                        change your search.
                      </p>
                    </div>
                  `
              }

            </div>

          </section>


          <section class="khata-detail-panel">

            ${customerDetail()}

          </section>

        </div>


        ${
          KHATA.showForm
            ? customerForm()
            : ""
        }

        ${
          KHATA.showPayment
            ? paymentForm()
            : ""
        }

      </section>
    `;
  }

  /* -------------------------------------------------------
     EVENTS
     ------------------------------------------------------- */

  function bindEvents() {
    if (
      window.__orbitKhataEvents
    ) {
      return;
    }

    window.__orbitKhataEvents = true;

    document.addEventListener(
      "click",
      event => {

        const add =
          event.target.closest(
            "[data-khata-add]"
          );

        if (add) {
          KHATA.showForm = true;
          KHATA.editingCustomerId = "";
          render();
          return;
        }


        const customer =
          event.target.closest(
            "[data-khata-customer]"
          );

        if (customer) {
          KHATA.selectedCustomerId =
            customer.dataset
              .khataCustomer;

          render();
          return;
        }


        const filter =
          event.target.closest(
            "[data-khata-filter]"
          );

        if (filter) {
          KHATA.filter =
            filter.dataset
              .khataFilter ||
            "all";

          render();
          return;
        }


        const edit =
          event.target.closest(
            "[data-khata-edit]"
          );

        if (edit) {
          KHATA.editingCustomerId =
            edit.dataset
              .khataEdit;

          KHATA.showForm = true;

          render();
          return;
        }


        const payment =
          event.target.closest(
            "[data-khata-payment]"
          );

        if (payment) {
          KHATA.selectedCustomerId =
            payment.dataset
              .khataPayment;

          KHATA.showPayment = true;

          render();
          return;
        }


        const whatsapp =
          event.target.closest(
            "[data-khata-whatsapp]"
          );

        if (whatsapp) {
          whatsappReminder(
            whatsapp.dataset
              .khataWhatsapp
          );
          return;
        }


        const close =
          event.target.closest(
            "[data-khata-close]"
          );

        if (close) {
          KHATA.showForm = false;
          KHATA.editingCustomerId = "";
          render();
          return;
        }


        const closePayment =
          event.target.closest(
            "[data-khata-close-payment-btn]"
          );

        if (closePayment) {
          KHATA.showPayment = false;
          render();
          return;
        }


        if (
          event.target.matches(
            "[data-khata-close-form]"
          )
        ) {
          KHATA.showForm = false;
          KHATA.editingCustomerId = "";
          render();
          return;
        }


        if (
          event.target.matches(
            "[data-khata-close-payment]"
          )
        ) {
          KHATA.showPayment = false;
          render();
          return;
        }

      }
    );


    document.addEventListener(
      "input",
      event => {

        if (
          event.target.id ===
          "khata-search"
        ) {
          KHATA.search =
            event.target.value;

          const list =
            document.querySelector(
              ".khata-customer-list"
            );

          if (!list) {
            render();
            return;
          }

          list.innerHTML =
            filteredCustomers()
              .map(customerCard)
              .join("");

          if (
            !filteredCustomers().length
          ) {
            list.innerHTML = `
              <div class="khata-empty">
                <strong>
                  No customers found
                </strong>
                <p>
                  Try another name or phone number.
                </p>
              </div>
            `;
          }
        }

      }
    );


    document.addEventListener(
      "submit",
      event => {

        if (
          event.target.id ===
          "khata-customer-form"
        ) {
          event.preventDefault();

          const form =
            new FormData(
              event.target
            );

          saveCustomer({
            id:
              KHATA.editingCustomerId ||
              undefined,

            name:
              form.get("name"),

            phone:
              form.get("phone"),

            email:
              form.get("email"),

            gstin:
              form.get("gstin"),

            creditLimit:
              form.get("creditLimit"),

            dueDays:
              form.get("dueDays"),

            address:
              form.get("address"),

            notes:
              form.get("notes")
          });

          return;
        }


        if (
          event.target.id ===
          "khata-payment-form"
        ) {
          event.preventDefault();

          const form =
            new FormData(
              event.target
            );

          recordPayment({
            customerId:
              form.get("customerId"),

            amount:
              form.get("amount"),

            method:
              form.get("method"),

            reference:
              form.get("reference"),

            notes:
              form.get("notes")
          });

        }

      }
    );
  }

  /* -------------------------------------------------------
     PUBLIC API
     ------------------------------------------------------- */

  window.Khata = {

    view,

    render,

    saveCustomer,

    archiveCustomer,

    recordPayment,

    recordCreditSale,

    customerById,

    customerStats,

    outstanding,

    customerLedger,

    statement,

    whatsappReminder,

    calculateDueDate

  };

  bindEvents();

})();
