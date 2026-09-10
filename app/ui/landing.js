/* OrbitBiz — public landing page */
(()=>{
  "use strict";
  const root=document.getElementById("app");
  if(!root)return;
  const goAuth=(mode="signin")=>window.dispatchEvent(new CustomEvent("orbitbiz:auth-request",{detail:{mode}}));
  const render=()=>{root.innerHTML=`
  <section id="orbit-biz-landing" class="obx-landing">
    <nav class="obx-nav">
      <a class="obx-brand" href="#top" aria-label="OrbitBiz home"><img src="assets/orbiteastfavicon.png" alt=""><span>OrbitBiz</span></a>
      <div class="obx-links"><a href="#apps">Apps</a><a href="#workflow">How it works</a><a href="#why">Why OrbitBiz</a></div>
      <button class="obx-login" data-signin>Login with Google <span>↗</span></button>
      <button class="obx-menu" aria-label="Open menu">☰</button>
    </nav>

    <main id="top">
      <section class="obx-hero">
        <div class="obx-blob blob-pink"></div><div class="obx-blob blob-blue"></div><div class="obx-blob blob-yellow"></div>
        <div class="obx-doodle doodle-star">✦</div><div class="obx-doodle doodle-spark">✧</div><div class="obx-doodle doodle-smile">⌣</div>
        <div class="obx-hero-copy">
          <div class="obx-pill"><span></span> A smarter way to run business</div>
          <h1>Make business<br><em>feel simple.</em></h1>
          <p>Sales, customers, stock, purchases and money — all moving together in one colourful workspace.</p>
          <div class="obx-actions"><button class="obx-primary" data-signup>Start with Google <b>→</b></button><button class="obx-secondary" data-signin>Login with Google</button></div>
          <div class="obx-proof"><span>✦</span> One workspace · One connected flow · Built by Orbit East</div>
        </div>
        <div class="obx-scene" aria-label="OrbitBiz workspace preview">
          <div class="float-card fc-note"><b>Nice!</b><span>Payment received</span><strong>+ ₹8,900</strong></div>
          <div class="float-card fc-stock"><span class="mini-icon">◈</span><b>Stock</b><small>Healthy</small></div>
          <div class="float-card fc-customer"><span>◎</span><div><b>New customer</b><small>Just added</small></div></div>
          <div class="obx-window">
            <div class="window-top"><span></span><span></span><span></span><i>OrbitBiz / Overview</i></div>
            <div class="window-body">
              <aside><div class="mini-brand"><img src="assets/orbiteastfavicon.png" alt=""> OrbitBiz</div><div class="side-active">⌂ Overview</div><div>◎ CRM</div><div>↗ Sales</div><div>◈ Inventory</div><div>⌁ Purchases</div><div>₹ Finance</div></aside>
              <div class="dash"><div class="dash-head"><div><small>MONDAY, SEPTEMBER 10</small><h3>Good morning ✨</h3></div><button>＋ New</button></div>
                <div class="kpis"><div><small>Revenue</small><b>₹2,84,500</b><em>↗ 12.4%</em></div><div><small>Receivables</small><b>₹48,200</b><em>8 invoices</em></div><div><small>Expenses</small><b>₹96,400</b><em>This month</em></div></div>
                <div class="dash-grid"><div class="chart"><div><b>Revenue</b><small>Last 30 days</small></div><svg viewBox="0 0 520 150" preserveAspectRatio="none"><path d="M0 125 C55 118 60 92 110 100 S165 68 210 85 S260 42 310 60 S370 28 410 48 S465 15 520 25" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M0 125 C55 118 60 92 110 100 S165 68 210 85 S260 42 310 60 S370 28 410 48 S465 15 520 25 V150 H0Z" opacity=".08"/></svg></div>
                <div class="attention"><b>Needs attention</b><span>3 overdue invoices <strong>₹18,450</strong></span><span>7 products low in stock <strong>→</strong></span><span>5 payments received <strong>₹32,800</strong></span></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="obx-marquee"><div>CRM <i>✦</i> SALES <i>✦</i> INVENTORY <i>✦</i> FINANCE <i>✦</i> REPORTS <i>✦</i> CUSTOMERS <i>✦</i> PAYMENTS <i>✦</i> </div></section>

      <section class="obx-section apps" id="apps"><div class="section-intro"><span>THE TOOLKIT</span><h2>Everything your<br><em>business needs.</em></h2><p>Pick up the tools you need. They already know how to work together.</p></div>
        <div class="app-grid"><article class="app-card ac-pink"><i>◎</i><h3>CRM</h3><p>Keep every customer and opportunity in context.</p><b>Explore →</b></article><article class="app-card ac-blue"><i>↗</i><h3>Sales</h3><p>Move from quotation to payment without the busywork.</p><b>Explore →</b></article><article class="app-card ac-yellow"><i>◈</i><h3>Inventory</h3><p>Know what you have, what moved and what needs attention.</p><b>Explore →</b></article><article class="app-card ac-purple"><i>₹</i><h3>Finance</h3><p>See expenses, payments and business money clearly.</p><b>Explore →</b></article><article class="app-card ac-green"><i>⌁</i><h3>Purchases</h3><p>Keep vendors, buying and incoming stock organised.</p><b>Explore →</b></article><article class="app-card ac-orange"><i>▥</i><h3>Reports</h3><p>Turn everyday activity into decisions you can see.</p><b>Explore →</b></article></div>
      </section>

      <section class="obx-flow" id="workflow"><div class="flow-copy"><span>THE MAGIC IS THE CONNECTION</span><h2>Enter it once.<br><em>Watch it travel.</em></h2><p>A customer becomes a quotation. A quotation becomes a sale. A sale moves stock, creates an invoice and ends with a payment — without starting over.</p><button data-signup>Build your workspace →</button></div><div class="flow-board"><div class="flow-line"></div><div class="flow-item fi-1"><small>01</small><b>Customer</b><span>◎ Relationship</span></div><div class="flow-item fi-2"><small>02</small><b>Quotation</b><span>↗ Opportunity</span></div><div class="flow-item fi-3"><small>03</small><b>Invoice</b><span>▤ Transaction</span></div><div class="flow-item fi-4"><small>04</small><b>Payment</b><span>✓ Complete</span></div></div></section>

      <section class="obx-why" id="why"><div class="why-sticker">LESS<br>CHAOS<br><span>MORE</span><br>CLARITY ✦</div><div class="why-copy"><span>WHY ORBITBIZ</span><h2>Powerful underneath.<br><em>Playful on top.</em></h2><p>Serious business tools do not have to feel cold. OrbitBiz combines structure with a visual workspace that makes everyday work easier to understand — and a little more fun to use.</p><div class="why-points"><div><b>⌘</b><strong>Find anything</strong><span>Search customers, products, invoices and transactions from one place.</span></div><div><b>✦</b><strong>See what matters</strong><span>Clear dashboards surface the work that needs your attention.</span></div><div><b>↗</b><strong>Move faster</strong><span>Connected records reduce duplicate entry and repetitive work.</span></div></div></div></section>

      <section class="obx-cta"><div class="cta-dots"></div><span>ORBITBIZ · PRESENTED BY ORBIT EAST</span><h2>Your business.<br><em>One orbit.</em></h2><p>We're building the workspace that brings it all together.</p><button data-signup>Login with Google <b>↗</b></button><small>No password to remember. Just your Google account.</small></section>
    </main>
    <footer><div><img src="assets/orbiteastfavicon.png" alt=""><b>OrbitBiz</b></div><span>Presented by Orbit East · © 2026</span></footer>
  </section>`;
    root.querySelectorAll("[data-signin]").forEach(b=>b.addEventListener("click",()=>goAuth("signin")));
    root.querySelectorAll("[data-signup]").forEach(b=>b.addEventListener("click",()=>goAuth("signup")));
    root.querySelector(".obx-menu")?.addEventListener("click",()=>root.querySelector(".obx-links")?.classList.toggle("open"));
  };
  render();
})();