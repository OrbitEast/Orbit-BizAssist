/* Orbit BizAssist — final invoice workspace */
(() => {
  "use strict";

  const S = () => window.AppState?.get?.() || {};
  const B = () => window.AppState?.business?.() || null;
  const C = () => S().cart || [];
  const esc = v => window.AppUtils?.esc ? window.AppUtils.esc(v) : String(v ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const money = v => window.money ? window.money(v) : `₹${Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const toast = m => typeof window.toast === "function" && window.toast(m);
  const P = { q: "", customer: "", payment: "Cash", discount: 0, note: "", busy: false };

  const setCart = value => window.AppState?.merge?.({ cart: value });
  const customers = () => B()?.contacts || [];
  const customer = () => customers().find(x => x.id === P.customer) || null;
  const product = id => (B()?.items || []).find(x => x.id === id);

  const products = () => {
    const q = P.q.trim().toLowerCase();
    return (B()?.items || [])
      .filter(item => !item.archived)
      .filter(item => !q || [item.name, item.sku, item.barcode, item.category].some(v => String(v || "").toLowerCase().includes(q)))
      .slice(0, 60);
  };

  const calc = () => window.InvoiceEngine?.calculateCart(C(), B() || {}, { discount: Number(P.discount) || 0 }) || {
    subtotal: 0, discount: 0, tax: 0, total: 0, cgst: 0, sgst: 0, igst: 0, roundOff: 0
  };

  function add(id) {
    const p = product(id);
    if (!p || p.archived) return;
    const stock = Number(p.stock || 0);
    if (stock <= 0) return toast("Item is out of stock.");

    const old = C().find(x => x.itemId === id);
    const quantity = Number(old?.quantity || 0) + 1;
    if (quantity > stock) return toast(`Only ${stock} available.`);

    setCart(old
      ? C().map(x => x.itemId === id ? { ...x, quantity } : x)
      : [...C(), {
          itemId: p.id,
          name: p.name,
          sku: p.sku || "",
          barcode: p.barcode || "",
          price: Number(p.selling || 0),
          cost: Number(p.cost || 0),
          taxRate: Number(p.taxRate ?? B()?.taxRate ?? 0),
          taxExempt: Boolean(p.taxExempt),
          quantity: 1,
          discount: 0,
          discountType: "flat",
          unit: p.unit || "pcs",
          hsn: p.hsn || p.hsnCode || ""
        }]);
    render();
  }

  function qty(id, delta) {
    const line = C().find(x => x.itemId === id);
    if (!line) return;
    const p = product(id);
    const quantity = Number(line.quantity || 0) + Number(delta || 0);
    if (quantity <= 0) return remove(id);
    if (p && quantity > Number(p.stock || 0)) return toast(`Only ${p.stock || 0} available.`);
    setCart(C().map(x => x.itemId === id ? { ...x, quantity } : x));
    render();
  }

  function remove(id) {
    setCart(C().filter(x => x.itemId !== id));
    render();
  }

  function clear() {
    setCart([]);
    P.customer = "";
    P.discount = 0;
    P.note = "";
    P.payment = "Cash";
    P.q = "";
    render();
  }

  function card(p) {
    const stock = Number(p.stock || 0);
    return `<button class="invoice-product ${stock ? "" : "is-out"}" data-i-add="${esc(p.id)}" type="button" ${stock ? "" : "disabled"}>
      <span class="invoice-product-icon">${esc(p.icon || "•")}</span>
      <span class="invoice-product-main"><strong>${esc(p.name)}</strong><small>${esc(p.sku || p.category || "Product")}</small></span>
      <b class="invoice-product-price">${money(p.selling)}</b>
      <small class="invoice-stock">${stock ? `${stock} available` : "Out of stock"}</small>
    </button>`;
  }

  function line(l) {
    return `<div class="invoice-line">
      <div class="invoice-line-name"><strong>${esc(l.name)}</strong><small>${money(l.price)} / ${esc(l.unit || "pcs")}</small></div>
      <div class="invoice-qty"><button data-i-qty="${esc(l.itemId)}" data-d="-1" type="button" aria-label="Decrease quantity">−</button><b>${l.quantity}</b><button data-i-qty="${esc(l.itemId)}" data-d="1" type="button" aria-label="Increase quantity">+</button></div>
      <strong class="invoice-line-total">${money(Number(l.price || 0) * Number(l.quantity || 0))}</strong>
      <button class="invoice-remove" data-i-remove="${esc(l.itemId)}" type="button" aria-label="Remove ${esc(l.name)}">×</button>
    </div>`;
  }

  function methods() {
    return (window.PaymentEngine?.METHODS || ["Cash", "UPI", "Card", "Bank Transfer", "Credit"])
      .map(method => `<button type="button" class="invoice-payment ${P.payment === method ? "active" : ""}" data-i-pay="${esc(method)}">${esc(method)}</button>`)
      .join("");
  }

  function view() {
    return '<div id="pos-view"></div>';
  }

  function render() {
    const root = document.querySelector("#pos-view");
    if (!root) return;

    const b = B() || {};
    const totals = calc();
    const selected = customer();
    const items = C();
    const count = items.reduce((n, x) => n + Number(x.quantity || 0), 0);
    const invoiceNumber = window.InvoiceEngine?.nextInvoiceNumber?.(b) || "INV-0001";

    root.innerHTML = `<section class="invoice-page">
      <header class="invoice-head">
        <div><span class="eyebrow">Billing</span><h2>Create invoice</h2><p>Add products, choose a customer and collect payment.</p></div>
        <div class="invoice-head-actions"><span class="invoice-number">${esc(invoiceNumber)}</span><button class="secondary-btn" type="button" data-i-clear ${items.length ? "" : "disabled"}>Clear</button></div>
      </header>
      <div class="invoice-layout">
        <section class="invoice-builder">
          <div class="invoice-card">
            <div class="invoice-section-title"><div><span class="step">01</span><div><strong>Customer</strong><small>Optional for normal sales</small></div></div></div>
            <div class="invoice-customer-grid">
              <label><span>Customer</span><select id="invoice-customer"><option value="">Walk-in customer</option>${customers().map(x => `<option value="${esc(x.id)}" ${x.id === P.customer ? "selected" : ""}>${esc(x.name || x.phone || "Customer")}${x.phone ? ` · ${esc(x.phone)}` : ""}</option>`).join("")}</select></label>
              ${selected ? `<div class="invoice-customer-info"><strong>${esc(selected.name || "Customer")}</strong><small>${esc(selected.phone || selected.email || "Saved customer")}</small></div>` : `<div class="invoice-walkin">No customer account required</div>`}
            </div>
          </div>

          <div class="invoice-card">
            <div class="invoice-section-title"><div><span class="step">02</span><div><strong>Add items</strong><small>Click a product to add it</small></div></div><span class="invoice-count">${count} item${count === 1 ? "" : "s"}</span></div>
            <label class="invoice-search"><span>⌕</span><input id="invoice-search" type="search" value="${esc(P.q)}" autocomplete="off" placeholder="Search product, SKU or barcode…"><kbd>/</kbd></label>
            <div class="invoice-products">${products().map(card).join("") || '<div class="invoice-no-products"><strong>No products found</strong><span>Try another search or add the product in Inventory.</span></div>'}</div>
          </div>

          <div class="invoice-card invoice-lines-card">
            <div class="invoice-section-title"><div><span class="step">03</span><div><strong>Invoice items</strong><small>Review quantities before creating</small></div></div></div>
            ${items.length ? `<div class="invoice-lines">${items.map(line).join("")}</div>` : '<div class="invoice-empty"><div>＋</div><strong>Your invoice is empty</strong><span>Add products from the section above.</span></div>'}
          </div>
        </section>

        <aside class="invoice-checkout">
          <div class="invoice-card invoice-summary-card">
            <div class="invoice-summary-top"><div><span class="eyebrow">Total payable</span><strong>${money(totals.total)}</strong></div><span class="invoice-draft">DRAFT</span></div>
            <div class="invoice-summary-lines"><div><span>Subtotal</span><b>${money(totals.subtotal)}</b></div>${totals.discount ? `<div><span>Discount</span><b>− ${money(totals.discount)}</b></div>` : ""}${totals.cgst ? `<div><span>CGST</span><b>${money(totals.cgst)}</b></div><div><span>SGST</span><b>${money(totals.sgst)}</b></div>` : ""}${totals.igst ? `<div><span>IGST</span><b>${money(totals.igst)}</b></div>` : ""}${totals.roundOff ? `<div><span>Round-off</span><b>${money(totals.roundOff)}</b></div>` : ""}</div>
            <div class="invoice-total-row"><span>Total</span><strong>${money(totals.total)}</strong></div>
          </div>

          <div class="invoice-card">
            <div class="invoice-mini-title"><strong>Adjust</strong><small>Optional</small></div>
            <div class="invoice-adjust-grid"><label><span>Discount</span><div class="invoice-input-prefix"><b>₹</b><input id="invoice-discount" type="number" min="0" step="0.01" value="${Number(P.discount || 0)}"></div></label><label><span>Note</span><input id="invoice-notes" maxlength="250" value="${esc(P.note)}" placeholder="Optional note"></label></div>
          </div>

          <div class="invoice-card invoice-payment-card">
            <div class="invoice-mini-title"><div><strong>Payment method</strong><small>How was this sale paid?</small></div></div>
            <div class="invoice-payments">${methods()}</div>
            ${P.payment === "Credit" && !selected ? '<div class="invoice-warning">Select a customer to use Credit / Khata.</div>' : ""}
            <button class="invoice-charge" type="button" data-i-charge ${!items.length || P.busy ? "disabled" : ""}><span>${P.busy ? "Creating…" : "Create invoice"}</span><strong>${money(totals.total)}</strong></button>
            <div class="invoice-shortcuts"><span><kbd>F4</kbd> Create</span><span><kbd>F2</kbd> Search</span></div>
          </div>
        </aside>
      </div>
    </section>`;
  }

  async function charge() {
    if (P.busy) return;

    const items = C();
    const b = B();
    if (!items.length) return toast("Add at least one item.");
    if (!b) return toast("No active business found.");

    const totals = calc();
    const selected = customer();
    if (P.payment === "Credit" && !selected) return toast("Select a customer for Credit / Khata.");

    for (const line of items) {
      const p = product(line.itemId);
      if (!p || p.archived) return toast(`${line.name} is no longer available.`);
      if (Number(p.stock || 0) < Number(line.quantity || 0)) return toast(`Not enough stock for ${line.name}.`);
    }

    let paymentSummary;
    try {
      paymentSummary = window.PaymentEngine.validate(
        [{ method: P.payment, amount: totals.total }],
        totals.total,
        { allowCredit: P.payment === "Credit" }
      );
    } catch (error) {
      return toast(error.message || "Payment is invalid.");
    }

    P.busy = true;
    render();

    try {
      const invoice = window.InvoiceEngine.createInvoice({
        business: b,
        cart: items,
        customer: selected,
        payments: paymentSummary.payments,
        notes: P.note,
        discount: Number(P.discount || 0),
        status: P.payment === "Credit" ? "unpaid" : "paid",
        documentType: "Invoice"
      });

      const now = new Date().toISOString();
      const updatedItems = (b.items || []).map(p => {
        const line = items.find(x => x.itemId === p.id);
        return line ? { ...p, stock: Number(p.stock || 0) - Number(line.quantity || 0), updatedAt: now } : p;
      });

      const payments = paymentSummary.payments.map(payment => ({
        ...payment,
        invoiceId: invoice.id,
        businessId: b.id,
        customerId: selected?.id || null
      }));

      let ledger = b.ledger || [];
      if (P.payment === "Credit" && selected) {
        ledger = [...ledger, {
          id: `ledger-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          customerId: selected.id,
          businessId: b.id,
          type: "sale",
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
          debit: totals.total,
          credit: 0,
          amount: totals.total,
          dueDate: null,
          notes: P.note || "",
          createdAt: now,
          createdBy: S().user?.name || "Owner / Admin"
        }];
      }

      const stockLog = [...(b.stockLog || []), ...items.map(line => ({
        id: `stock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: "sale",
        itemId: line.itemId,
        quantity: -Number(line.quantity || 0),
        previousStock: Number(product(line.itemId)?.stock || 0),
        newStock: Number(product(line.itemId)?.stock || 0) - Number(line.quantity || 0),
        referenceId: invoice.id,
        referenceNumber: invoice.number,
        createdAt: now
      }))];

      window.AppState.updateBusiness({
        ...b,
        items: updatedItems,
        invoices: [...(b.invoices || []), invoice],
        payments: [...(b.payments || []), ...payments],
        ledger,
        stockLog,
        updatedAt: now
      });

      setCart([]);
      P.customer = "";
      P.discount = 0;
      P.note = "";
      P.payment = "Cash";
      P.q = "";

      const synced = await window.AppState.save?.();
      P.busy = false;
      render();
      toast(synced === false ? `Invoice ${invoice.number} created. Saved locally; cloud sync needs attention.` : `Invoice ${invoice.number} created successfully.`);
      window.dispatchEvent(new CustomEvent("orbit:invoice-created", { detail: { invoice } }));
    } catch (error) {
      P.busy = false;
      render();
      console.error("Orbit invoice creation failed:", error);
      toast(error.message || "Unable to create invoice.");
    }
  }

  document.addEventListener("click", event => {
    let target = event.target.closest("[data-i-add]");
    if (target) return add(target.dataset.iAdd);
    target = event.target.closest("[data-i-qty]");
    if (target) return qty(target.dataset.iQty, Number(target.dataset.d));
    target = event.target.closest("[data-i-remove]");
    if (target) return remove(target.dataset.iRemove);
    target = event.target.closest("[data-i-pay]");
    if (target) { P.payment = target.dataset.iPay; return render(); }
    if (event.target.closest("[data-i-clear]")) return clear();
    if (event.target.closest("[data-i-charge]")) return charge();
  });

  document.addEventListener("input", event => {
    if (event.target.id === "invoice-search") {
      P.q = event.target.value;
      const list = document.querySelector(".invoice-products");
      if (list) list.innerHTML = products().map(card).join("") || '<div class="invoice-no-products"><strong>No products found</strong><span>Try another search or add the product in Inventory.</span></div>';
    } else if (event.target.id === "invoice-discount") {
      P.discount = Math.max(0, Number(event.target.value) || 0);
      render();
    } else if (event.target.id === "invoice-notes") {
      P.note = event.target.value;
    }
  });

  document.addEventListener("change", event => {
    if (event.target.id === "invoice-customer") {
      P.customer = event.target.value;
      render();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "F2") {
      event.preventDefault();
      document.querySelector("#invoice-search")?.focus();
    }
    if (event.key === "F4") {
      event.preventDefault();
      charge();
    }
    if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      event.preventDefault();
      document.querySelector("#invoice-search")?.focus();
    }
  });

  window.InvoiceWorkspace = Object.freeze({ view, render, charge, clear });
  window.POS = Object.freeze({ view, render, addProduct: add, changeQuantity: qty, removeProduct: remove, clear, charge });
})();
