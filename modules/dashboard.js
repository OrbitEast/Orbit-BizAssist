function dashboard() {
  return `
    <div class="app-shell">

      <aside class="sidebar">
        <div class="sidebar-brand">
          <span class="brand-mark">O</span>
          <strong>BizAssist</strong>
        </div>

        <nav class="sidebar-nav">
          <button class="nav-item active">
            <span>⌂</span>
            Dashboard
          </button>

          <button class="nav-item">
            <span>▣</span>
            Invoices
          </button>

          <button class="nav-item">
            <span>◫</span>
            Inventory
          </button>

          <button class="nav-item">
            <span>₹</span>
            Khata
          </button>

          <button class="nav-item">
            <span>↗</span>
            Expenses
          </button>

          <button class="nav-item">
            <span>◒</span>
            Reports
          </button>
        </nav>

        <div class="sidebar-bottom">
          <button class="nav-item">
            <span>⚙</span>
            Settings
          </button>
        </div>
      </aside>


      <main class="main-content">

        <header class="topbar">

          <div>
            <span class="eyebrow">OVERVIEW</span>
            <h1>Good to see you.</h1>
          </div>

          <div class="topbar-actions">
            <button class="icon-btn">⌕</button>
            <button class="icon-btn">◔</button>

            <div class="user-avatar">
              O
            </div>
          </div>

        </header>


        <section class="dashboard">

          <div class="welcome-card">
            <div>
              <span class="eyebrow">TODAY</span>
              <h2>Your business at a glance.</h2>
              <p>
                Everything important, right where you need it.
              </p>
            </div>

            <button class="primary-btn">
              + New Sale
            </button>
          </div>


          <div class="metric-grid">

            <article class="metric-card">
              <span>Today's Sales</span>
              <strong>₹0</strong>
              <small>0 invoices</small>
            </article>

            <article class="metric-card">
              <span>Outstanding Khata</span>
              <strong>₹0</strong>
              <small>0 customers</small>
            </article>

            <article class="metric-card">
              <span>Low Stock</span>
              <strong>0</strong>
              <small>Items need attention</small>
            </article>

            <article class="metric-card">
              <span>Expenses</span>
              <strong>₹0</strong>
              <small>Today</small>
            </article>

          </div>


          <div class="dashboard-grid">

            <section class="panel sales-panel">
              <div class="panel-head">
                <div>
                  <span class="eyebrow">PERFORMANCE</span>
                  <h3>Sales overview</h3>
                </div>

                <button class="secondary-btn">
                  This week
                </button>
              </div>

              <div class="chart-placeholder">
                <div class="chart-empty">
                  <span>⌁</span>
                  <strong>Your sales story starts here.</strong>
                  <p>
                    Complete your first sale to see performance insights.
                  </p>
                </div>
              </div>
            </section>


            <section class="panel">
              <div class="panel-head">
                <div>
                  <span class="eyebrow">QUICK ACTIONS</span>
                  <h3>Get things done</h3>
                </div>
              </div>

              <div class="quick-actions">

                <button>
                  <span>＋</span>
                  New invoice
                </button>

                <button>
                  <span>＋</span>
                  Add product
                </button>

                <button>
                  <span>₹</span>
                  Add Khata
                </button>

                <button>
                  <span>↗</span>
                  Add expense
                </button>

              </div>
            </section>

          </div>


          <section class="panel recent-panel">

            <div class="panel-head">
              <div>
                <span class="eyebrow">ACTIVITY</span>
                <h3>Recent transactions</h3>
              </div>

              <button class="text-btn">
                View all →
              </button>
            </div>

            <div class="empty-state">
              <div class="empty-icon">◎</div>
              <h4>No transactions yet</h4>
              <p>
                Your recent sales and payments will appear here.
              </p>
            </div>

          </section>

        </section>

      </main>

    </div>
  `;
}
