# OrbitBiz

**OrbitBiz** is a business management platform being built by **Orbit East**.

The product is intended to bring everyday business operations into one connected workspace: customers, CRM, sales, invoices, purchasing, inventory, payments, expenses, finance and reporting.

> **Business, connected.**

## Current status

🚧 **Under development**

The public entry screen is intentionally minimal while the application is being rebuilt. The backend, authentication, business data layer and deployment configuration remain part of the project foundation.

## Architecture

```text
app/
├── core/
│   ├── auth.js
│   ├── bootstrap.js
│   ├── config.js
│   ├── events.js
│   ├── permissions.js
│   ├── store.js
│   └── validate.js
│
├── data/
│   └── repository.js
│
├── domain/
│   ├── models.js
│   ├── money.js
│   └── transactions.js
│
├── services/
│   └── transaction-engine.js
│
└── ui/
    ├── app.js
    ├── auth.css
    ├── boot-loader.css
    ├── boot-loader.js
    ├── brand.css
    ├── brand.js
    ├── landing.js
    ├── onboarding.css
    ├── onboarding.js
    ├── orbit-core.css
    ├── orbit-form-view.css
    ├── orbit-kanban.css
    ├── orbit-modern.css
    ├── rebuild.css
    └── workspace-rebuild.css
```

## Backend

OrbitBiz uses **Supabase** as its application data and authentication foundation.

The repository includes:

- authenticated users
- business-scoped records
- permission handling
- relational business data
- customer and catalogue foundations
- sales and invoice foundations
- inventory foundations
- payment and transaction foundations
- business onboarding

Critical backend and deployment files are intentionally kept separate from the presentation layer.

## Product direction

The planned workspace will connect:

**Customer → Quotation → Sale → Invoice → Payment**

and:

**Vendor → Purchase → Stock → Payment → Finance**

Planned areas include:

- CRM
- Customers and contacts
- Quotations
- Sales and invoices
- Receipts
- Products and inventory
- Warehouses
- Purchasing and purchase orders
- Vendor payments
- Expenses
- Finance and reconciliation
- GST
- Reports
- Business settings
- AI-assisted business insights

## Design principles

- **Connected:** records should work across related workflows.
- **Clear:** important information should be easy to understand.
- **Fast:** common actions should require minimal navigation.
- **Reliable:** business calculations and data mutations should remain consistent.
- **Responsive:** the workspace should work across desktop, tablet and mobile.
- **Private by design:** access control and business-level data isolation are part of the foundation.

## Development roadmap

### Foundation

- [x] Supabase integration
- [x] authentication foundation
- [x] onboarding foundation
- [x] business-scoped data layer
- [x] core domain models
- [x] transaction service foundation

### Workspace rebuild

- [x] new public entry screen
- [x] new workspace visual foundation
- [ ] rebuild application shell
- [ ] rebuild dashboard
- [ ] unify list, form and record experiences
- [ ] responsive navigation
- [ ] global search and command actions

### Connected operations

- [ ] quotation to sales workflow
- [ ] sales to inventory workflow
- [ ] invoice to payment workflow
- [ ] purchase to stock workflow
- [ ] vendor payment workflow
- [ ] finance reconciliation
- [ ] richer reports

### Intelligence

- [ ] business assistant
- [ ] automated summaries
- [ ] trend analysis
- [ ] business alerts
- [ ] workflow recommendations

## Repository safety

The UI layer can be rebuilt independently while preserving the core application connections. Authentication, Supabase configuration, database schemas, deployment files, verification files and business logic should not be removed as part of visual cleanup.

## Brand

**Orbit East** is the technology brand behind OrbitBiz.

**OrbitBiz — Business, connected.**
