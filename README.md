# OrbitBiz

**Orbit East presents OrbitBiz — a modern business operating system built to make everyday business work feel simple, fast, connected, and professional.**

> **One workspace. Every operation. One connected business flow.**

OrbitBiz is being built as a serious, production-oriented business management platform for small businesses, growing teams, service businesses, retailers, distributors, and modern entrepreneurs.

The goal is not to create a collection of disconnected tools. OrbitBiz is designed around a single connected system where customers, products, sales, purchasing, inventory, invoices, payments, expenses, accounting, reporting, and business activity work together.

---

## ✦ The OrbitBiz Vision

Most business software makes users jump between spreadsheets, billing apps, inventory tools, messaging apps, notebooks, and accounting systems.

**OrbitBiz is built to bring that work together.**

The experience is intentionally structured around familiar business workflows:

**Customer → Quotation → Sales Order → Stock → Delivery → Invoice → Payment → Reports**

and:

**Vendor → Purchase Order → Receipt → Stock → Vendor Bill → Payment → Accounts → Reports**

Every step should strengthen the next one instead of creating another isolated record.

### Built around three principles

- **Clarity** — users should understand what is happening without learning complicated software first.
- **Connection** — information entered once should become useful everywhere it belongs.
- **Control** — businesses should have a clear view of records, money, stock, activity, and performance.

---

# 🚀 What OrbitBiz Is Becoming

OrbitBiz is evolving into a modular business workspace with a consistent interaction model across every application.

### Core applications

- **Sales** — quotations, sales orders, customers, invoices and receipts
- **CRM** — leads, opportunities, activities and customer relationships
- **Contacts** — customers, vendors and business contacts
- **Inventory** — products, stock movements, warehouses and stock operations
- **Purchase** — vendors, purchase orders, receipts and purchasing workflows
- **Accounting** — payments, payment accounts, expenses, reconciliation and financial records
- **Reporting** — business intelligence, operational summaries and financial analysis
- **Settings** — business configuration, users, permissions and system preferences

Applications are designed to feel like parts of **one operating system**, not separate websites.

---

# 🧠 Designed Around How People Actually Work

OrbitBiz focuses heavily on reducing mental effort.

A user should not have to remember where a record lives, what screen to open next, or which number needs to be copied into another module.

The interface is therefore built around predictable patterns:

- visual application launcher
- contextual navigation
- powerful global search
- list and table views
- visual kanban workflows
- structured record forms
- filters and saved searches
- grouping and sorting
- bulk actions
- status-based workflows
- smart record actions
- tabs for complex information
- activity and communication history
- responsive layouts for desktop and mobile

The same interaction language is intended to repeat throughout the product so that learning one part of OrbitBiz makes the rest easier to understand.

---

# 🗂️ View System

Every major business area is being built around a reusable view engine.

### List / Tree View

Designed for working with many records at once.

- sorting
- column-based information
- record selection
- select all
- bulk operations
- search
- filters
- grouping
- pagination
- inline editing where appropriate
- responsive behaviour

### Kanban View

Designed for workflows where records move through stages.

Examples:

**Lead → Qualified → Proposal → Won**

or:

**Draft → Confirmed → Processing → Completed**

Cards can expose the most useful information without forcing users to open every record.

### Form View

Designed for creating and managing a single business record.

- structured fields
- action buttons
- status bar
- tabs
- smart actions
- related records
- contextual information
- activity history
- create / edit / save / discard flows

### Search & Control Panel

The search experience is intended to become the fastest way to find and work with business information.

- keyword search
- filters
- saved filters
- group by
- favourites
- contextual actions
- view switching

### Analytics Views

The architecture is prepared for richer analytical views such as:

- graphs
- pivots
- dashboards
- operational KPIs
- financial summaries

---

# 🔄 Connected Business Workflows

OrbitBiz is not just about storing records. The long-term objective is to make business actions automatically influence the correct connected areas.

## Sales

**Quotation → Confirmation → Delivery/Stock → Invoice → Payment**

A completed sale should be able to connect the customer, products, quantities, inventory movements, invoice, payment and financial reporting.

## Purchasing

**Purchase Order → Receipt → Inventory → Vendor Bill → Payment**

Purchasing should update the operational picture without forcing duplicate data entry.

## Inventory

Inventory is intended to reflect real business activity through controlled stock movements rather than disconnected numbers.

## Finance

Payments, expenses, accounts and reconciliation should connect back to the transactions that created them.

## Reporting

Reports should be generated from operational data rather than requiring businesses to maintain another parallel dataset.

---

# ⚡ The OrbitBiz Experience

The product is being designed with a simple psychological principle:

> **Make the next useful action obvious.**

That means:

- important actions stay visible
- complex information is progressively revealed
- workflows use familiar stages
- empty screens explain what to do next
- related records remain close to the current record
- repetitive tasks can be handled in bulk
- search reduces navigation time
- visual hierarchy separates important information from noise
- consistent patterns reduce the amount of software users have to memorize

The objective is not to overwhelm users with features.

**The objective is to make powerful features feel natural.**

---

# 🎯 Built for Real Businesses

OrbitBiz is intended for businesses that need more than a basic billing page.

Potential users include:

- retailers
- wholesalers
- distributors
- service businesses
- agencies
- small manufacturers
- local businesses
- growing teams
- independent professionals
- startups
- multi-user businesses

The architecture is being designed so the platform can grow from a simple business workspace into a complete operational system without forcing users to replace their core data later.

---

# 🏗️ Architecture

OrbitBiz uses a modular architecture separating business logic, data access, services, application state, permissions and UI.

Current structure includes:

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
    ├── dashboard.js
    ├── invoice-ux.js
    ├── inventory-ux.js
    ├── feature-suite.js
    ├── global-operations.js
    ├── odoo-modern.js
    ├── odoo-modern.css
    └── ...
```

The interface layer is being progressively reorganized around reusable application, action, model and view concepts so new business modules can share the same foundation instead of reinventing UI behaviour.

---

# 🗄️ Data & Backend

OrbitBiz uses **Supabase** for its backend foundation.

The platform is being designed around:

- authenticated users
- business-level data isolation
- role-aware access
- relational business records
- Row Level Security
- operational documents
- inventory movements
- financial records
- application configuration
- server-side transactional operations

A business application registry allows enabled modules and their settings to be managed per business.

The long-term architecture favours transactional database operations for critical business actions so that related changes succeed or fail together.

---

# 🔐 Security Principles

Business software must treat data integrity and privacy as core product features.

OrbitBiz is being built with:

- authenticated access
- business-scoped data
- Row Level Security
- permission-aware operations
- validated inputs
- controlled database mutations
- separation between UI and business logic
- server-side enforcement for critical operations

Security is treated as part of the architecture, not a feature added at the end.

---

# 📱 Responsive by Design

OrbitBiz is intended to work across:

- desktop
- laptop
- tablet
- mobile

The goal is not simply to shrink the desktop interface.

Navigation, forms, tables, cards, actions and workflows should adapt to the device while preserving the same underlying business logic.

---

# 🌙 Interface Direction

OrbitBiz is moving toward a clean, focused ERP-style workspace with:

- compact navigation
- application launcher
- contextual top navigation
- structured content areas
- information-dense business views
- clear primary actions
- responsive layouts
- optional dark-mode support
- Orbit East visual identity

The visual system will continue to evolve, but the core interaction language will remain consistent.

---

# 🧩 Extensible Application Model

OrbitBiz is designed so new applications can be added without rebuilding the entire product.

Each application can eventually define:

```text
Application
├── Identity
├── Menu
├── Actions
├── Models
├── Views
│   ├── List
│   ├── Form
│   ├── Kanban
│   ├── Search
│   ├── Graph
│   └── Pivot
├── Permissions
└── Settings
```

This creates a common foundation for future applications such as:

- Projects
- Employees
- Timesheets
- Helpdesk
- Manufacturing
- Subscription-free business services
- advanced analytics
- automation

The platform should be able to grow horizontally without becoming structurally chaotic.

---

# 🛠️ Development Roadmap

## Phase 1 — Foundation

- [x] authentication foundation
- [x] business workspace
- [x] Supabase integration
- [x] core customer and item data
- [x] invoice foundation
- [x] inventory foundation
- [x] payment foundation
- [x] application registry foundation

## Phase 2 — Unified Workspace

- [x] application launcher direction
- [x] modular navigation
- [x] responsive workspace
- [x] consistent application identity
- [ ] database-backed application preferences
- [ ] unified action registry

## Phase 3 — View Engine

- [ ] reusable list view
- [ ] reusable form view
- [ ] reusable kanban view
- [ ] reusable search view
- [ ] filters
- [ ] group by
- [ ] favourites
- [ ] pagination
- [ ] bulk actions
- [ ] inline editing
- [ ] drag-and-drop workflows

## Phase 4 — Record Experience

- [ ] status bars
- [ ] smart buttons
- [ ] structured tabs
- [ ] contextual actions
- [ ] activity timeline
- [ ] chatter-style communication layer
- [ ] reminders and scheduled activities

## Phase 5 — Connected Operations

- [ ] quotation → order workflow
- [ ] order → stock workflow
- [ ] stock → delivery workflow
- [ ] delivery → invoice workflow
- [ ] invoice → payment workflow
- [ ] purchase → receipt workflow
- [ ] vendor bill → payment workflow
- [ ] atomic transaction RPCs
- [ ] live business dashboard

## Phase 6 — Intelligence & Scale

- [ ] advanced reporting
- [ ] financial analytics
- [ ] business health indicators
- [ ] automation
- [ ] intelligent recommendations
- [ ] advanced permissions
- [ ] larger-team workflows

---

# 💡 Product Philosophy

OrbitBiz follows a simple belief:

**Business software should remove work, not create more work.**

Every new feature should answer at least one of these questions:

1. Does it save the user time?
2. Does it reduce duplicate entry?
3. Does it make business information easier to understand?
4. Does it prevent avoidable mistakes?
5. Does it connect two previously separate parts of the business?
6. Does it help the user take the next action faster?

If the answer is no, the feature probably does not belong in the core experience.

---

# 🌍 Why OrbitBiz

OrbitBiz is being built with a long-term ambition: create a business platform that feels capable enough for serious operations while remaining approachable for the person running a small business from a laptop or phone.

No unnecessary complexity.

No fragmented workflows.

No artificial separation between sales, stock and money.

Just one connected workspace that grows with the business.

### **OrbitBiz**
**Business, in one orbit.**

---

## Brand

**Orbit East** is the technology brand behind OrbitBiz.

Orbit East is building a family of practical digital products with a focus on clarity, privacy, reliability, and modern user experience.

**OrbitBiz is the business operating system within that ecosystem.**

---

## Status

🚧 **Actively under development**

The current repository contains working foundations and production-oriented modules while the unified application and view architecture is being built out.

Features marked in the roadmap are developed progressively and should not be interpreted as completed until they are implemented and verified in the application.

---

## License

This repository's licensing terms will be defined as the product architecture and distribution model are finalized.
