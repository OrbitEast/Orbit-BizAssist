/* =========================================================
   ORBIT BIZASSIST — DASHBOARD
   Home / Overview module
   ========================================================= */

(() => {
  function state() {
    return window.AppState?.get?.() || {};
  }

  function business() {
    const current = state();

    return (
      current.businesses?.find(
        item => item.id === current.activeBusiness
      ) ||
      current.businesses?.[0] ||
      null
    );
  }

  function escapeHTML(value) {
    if (window.AppUtils?.esc) {
      return window.AppUtils.esc(value);
    }

    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function money(value) {
    if (window.AppUtils?.money) {
      return window.AppUtils.money(value);
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  function getUserName() {
    const user = state().user;

    return (
      user?.name ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "Owner"
    );
  }


  /* =======================================================
     DATA
     ======================================================= */

  function invoices() {
    return business()?.invoices || [];
  }

  function items() {
    return business()?.items || [];
  }

  function todayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function invoiceDate(invoice) {
    return (
      invoice?.createdAt ||
      invoice?.date ||
      invoice?.created_at ||
      ""
    );
  }

  function isToday(invoice) {
    const value = invoiceDate(invoice);

    if (!value) return false;

    const date = new Date(value);

    return !Number.isNaN(date.getTime()) &&
      todayKey(date) === todayKey();
  }

  function invoiceTotal(invoice) {
    return Number(
      invoice?.total ??
      invoice?.grandTotal ??
      invoice?.amount ??
      0
    ) || 0;
  }

  function calculateMetrics() {
    const allInvoices = invoices();

    const todayInvoices = allInvoices.filter(isToday);

    const todaySales = todayInvoices.reduce(
      (sum, invoice) => sum + invoiceTotal(invoice),
      0
    );

    const totalSales = allInvoices.reduce(
      (sum, invoice) => sum + invoiceTotal(invoice),
      0
    );

    const lowStock = items().filter(item => {
      const stock = Number(item?.stock) || 0;
      const threshold = Number(item?.threshold ?? 5);

      return stock <= threshold;
    });

    return {
      todaySales,
      todayOrders: todayInvoices.length,
      totalSales,
      totalOrders: allInvoices.length,
      lowStock: lowStock.length,
      products: items().length
    };
  }


  /* =======================================================
     WELCOME
     ======================================================= */

  function welcome() {
    const name = escapeHTML(getUserName());
    const businessName = escapeHTML(
      business()?.name || "your business"
    );

    return `
      <section class="welcome-card">

        <div>
          <span class="eyebrow">
            ${businessName}
          </span>

          <h2>
            Good to see you, ${name}.
          </h2>

          <p>
            Here's what's happening with your business today.
          </p>
        </div>

        <button
          class="primary-btn"
          type="button"
          data-route="invoices"
        >
          + New Invoice
        </button>

      </section>
    `;
  }


  /* =======================================================
     METRICS
     ======================================================= */

  function metric(label, value, detail) {
    return `
      <article class="metric-card">
        <span>${label}</span>
        <strong>${value}</strong>
        <small>${detail}</small>
      </article>
    `;
  }

  function metrics() {
    const data = calculateMetrics();

    return `
      <section
        class="metric-grid"
        aria-label="Business overview"
      >

        ${metric(
          "Today's sales",
          money(data.todaySales),
          `${data.todayOrders} order${data.todayOrders === 1 ? "" : "s"} today`
        )}

        ${metric(
          "Today's orders",
          data.todayOrders,
          data.todayOrders
            ? "Sales recorded today"
            : "No orders recorded yet"
        )}

        ${metric(
          "Total sales",
          money(data.totalSales),
          `${data.totalOrders} invoice${data.totalOrders === 1 ? "" : "s"} recorded`
        )}

        ${metric(
          "Low stock",
          data.lowStock,
          data.lowStock
            ? "Items need attention"
            : "Everything looks healthy"
        )}

      </section>
    `;
  }


  /* =======================================================
     SALES PANEL
     ======================================================= */

  function salesPanel() {
    const data = calculateMetrics();

    if (!data.totalOrders) {
      return `
        <section class="panel sales-panel">

          <div class="panel-head">
            <div>
              <span class="eyebrow">Performance</span>
              <h3>Sales overview</h3>
            </div>

            <span class="pill">Live</span>
          </div>

          <div class="chart-placeholder">
            <div class="chart-empty">

              <span aria-hidden="true">◴</span>

              <strong>
                Your sales story starts here.
              </strong>

              <p>
                Once you create invoices, your sales activity
                will appear in this area.
              </p>

            </div>
          </div>

        </section>
      `;
    }

    return `
      <section class="panel sales-panel">

        <div class="panel-head">
          <div>
            <span class="eyebrow">Performance</span>
            <h3>Sales overview</h3>
          </div>

          <span class="pill">Live</span>
        </div>

        <div class="chart-placeholder">
          <div class="chart-empty">

            <span aria-hidden="true">↗</span>

            <strong>
              ${money(data.totalSales)} total sales
            </strong>

            <p>
              ${data.totalOrders}
              recorded transaction${data.totalOrders === 1 ? "" : "s"}.
            </p>

          </div>
        </div>

      </section>
    `;
  }


  /* =======================================================
     QUICK ACTIONS
     ======================================================= */

  function quickActions() {
    return `
      <section class="panel">

        <div class="panel-head">
          <div>
            <span class="eyebrow">Shortcuts</span>
            <h3>Quick actions</h3>
          </div>
        </div>

        <div class="quick-actions">

          <button
            type="button"
            data-route="invoices"
          >
            <span aria-hidden="true">＋</span>
            <b>New invoice</b>
          </button>

          <button
            type="button"
            data-route="khata"
          >
            <span aria-hidden="true">₹</span>
            <b>Add customer</b>
          </button>

          <button
            type="button"
            data-route="inventory"
          >
            <span aria-hidden="true">▤</span>
            <b>Add product</b>
          </button>

          <button
            type="button"
            data-route="expenses"
          >
            <span aria-hidden="true">↗</span>
            <b>Record expense</b>
          </button>

        </div>

      </section>
    `;
  }


  /* =======================================================
     RECENT ACTIVITY
     ======================================================= */

  function recentActivity() {
    const recent = [...invoices()]
      .sort((a, b) => {
        return (
          new Date(invoiceDate(b)).getTime() -
          new Date(invoiceDate(a)).getTime()
        );
      })
      .slice(0, 5);

    if (!recent.length) {
      return `
        <section class="panel recent-panel">

          <div class="panel-head">
            <div>
              <span class="eyebrow">Activity</span>
              <h3>Recent invoices</h3>
            </div>
          </div>

          <div class="empty-state">

            <div class="empty-icon" aria-hidden="true">
              ◷
            </div>

            <h4>No invoices yet</h4>

            <p>
              Create your first invoice and your recent
              activity will appear here.
            </p>

          </div>

        </section>
      `;
    }

    return `
      <section class="panel recent-panel">

        <div class="panel-head">
          <div>
            <span class="eyebrow">Activity</span>
            <h3>Recent invoices</h3>
          </div>

          <button
            class="text-btn"
            type="button"
            data-route="invoices"
          >
            View all →
          </button>
        </div>

        <div class="table-wrap">

          <table class="table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              ${recent.map(invoice => `
                <tr>
                  <td>
                    ${escapeHTML(
                      invoice.number ||
                      invoice.invoiceNumber ||
                      invoice.id ||
                      "Invoice"
                    )}
                  </td>

                  <td>
                    ${escapeHTML(
                      invoice.customerName ||
                      invoice.customer ||
                      "Walk-in customer"
                    )}
                  </td>

                  <td>
                    <strong>
                      ${money(invoiceTotal(invoice))}
                    </strong>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>

        </div>

      </section>
    `;
  }


  /* =======================================================
     DASHBOARD
     ======================================================= */

  function dashboard() {
    return `
      <main class="dashboard">

        ${welcome()}

        ${metrics()}

        <div class="dashboard-grid">

          ${salesPanel()}

          ${quickActions()}

        </div>

        ${recentActivity()}

      </main>
    `;
  }


  /* =======================================================
     PUBLIC MODULE API
     ======================================================= */

  window.dashboard = dashboard;

  window.AppDashboard = Object.freeze({
    render: dashboard,
    metrics: calculateMetrics
  });
})();
