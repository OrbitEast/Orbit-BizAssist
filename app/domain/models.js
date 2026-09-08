/* Orbit BizAssist V2 — domain model factories */
(() => {
  "use strict";

  const now = () => new Date().toISOString();
  const id = prefix => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const business = input => ({
    id: input?.id || id("biz"),
    name: String(input?.name || "").trim(),
    legalName: String(input?.legalName || "").trim(),
    currency: input?.currency || "INR",
    taxId: String(input?.taxId || "").trim(),
    address: input?.address || {},
    createdAt: input?.createdAt || now(),
    updatedAt: now()
  });

  const customer = input => ({
    id: input?.id || id("cus"),
    name: String(input?.name || "").trim(),
    phone: String(input?.phone || "").trim(),
    email: String(input?.email || "").trim(),
    openingBalance: Number(input?.openingBalance || 0),
    creditLimit: Number(input?.creditLimit || 0),
    notes: String(input?.notes || "").trim(),
    createdAt: input?.createdAt || now(),
    updatedAt: now()
  });

  const product = input => ({
    id: input?.id || id("prd"),
    sku: String(input?.sku || "").trim(),
    name: String(input?.name || "").trim(),
    unit: input?.unit || "pcs",
    salePrice: Number(input?.salePrice || 0),
    purchasePrice: Number(input?.purchasePrice || 0),
    taxRate: Number(input?.taxRate || 0),
    openingStock: Number(input?.openingStock || 0),
    reorderLevel: Number(input?.reorderLevel || 0),
    active: input?.active !== false,
    createdAt: input?.createdAt || now(),
    updatedAt: now()
  });

  const invoice = input => ({
    id: input?.id || id("inv"),
    number: String(input?.number || "").trim(),
    customerId: input?.customerId || null,
    status: input?.status || "draft",
    items: Array.isArray(input?.items) ? input.items : [],
    subtotal: Number(input?.subtotal || 0),
    discount: Number(input?.discount || 0),
    tax: Number(input?.tax || 0),
    total: Number(input?.total || 0),
    amountPaid: Number(input?.amountPaid || 0),
    balanceDue: Number(input?.balanceDue || 0),
    issueDate: input?.issueDate || now().slice(0, 10),
    dueDate: input?.dueDate || null,
    notes: String(input?.notes || "").trim(),
    createdAt: input?.createdAt || now(),
    updatedAt: now()
  });

  const payment = input => ({
    id: input?.id || id("pay"),
    reference: String(input?.reference || "").trim(),
    invoiceId: input?.invoiceId || null,
    customerId: input?.customerId || null,
    amount: Number(input?.amount || 0),
    method: input?.method || "cash",
    direction: input?.direction || "in",
    status: input?.status || "completed",
    paidAt: input?.paidAt || now(),
    createdAt: input?.createdAt || now()
  });

  const expense = input => ({
    id: input?.id || id("exp"),
    category: String(input?.category || "General").trim(),
    description: String(input?.description || "").trim(),
    amount: Number(input?.amount || 0),
    paymentMethod: input?.paymentMethod || "cash",
    expenseDate: input?.expenseDate || now().slice(0, 10),
    createdAt: input?.createdAt || now(),
    updatedAt: now()
  });

  const inventoryMovement = input => ({
    id: input?.id || id("mov"),
    productId: input?.productId || null,
    type: input?.type || "adjustment",
    quantity: Number(input?.quantity || 0),
    referenceType: input?.referenceType || null,
    referenceId: input?.referenceId || null,
    note: String(input?.note || "").trim(),
    occurredAt: input?.occurredAt || now()
  });

  const auditEvent = input => ({
    id: input?.id || id("audit"),
    actorId: input?.actorId || null,
    action: String(input?.action || "").trim(),
    entityType: String(input?.entityType || "").trim(),
    entityId: input?.entityId || null,
    before: input?.before || null,
    after: input?.after || null,
    createdAt: input?.createdAt || now()
  });

  window.OrbitV2 = window.OrbitV2 || {};
  window.OrbitV2.models = Object.freeze({
    business,
    customer,
    product,
    invoice,
    payment,
    expense,
    inventoryMovement,
    auditEvent
  });
})();
