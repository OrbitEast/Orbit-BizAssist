# Orbit BizAssist V2 — Architecture

## Goal
Rebuild the application around a stable domain/data foundation before adding the full Refrens-class feature set.

## Principles
- Single source of truth for application state.
- Domain models first; UI never owns business rules.
- Every business operation is represented as a transaction/event.
- Supabase is the cloud persistence/authentication layer; the frontend remains independently hostable.
- Modules communicate through explicit services and events instead of hidden cross-file mutations.
- Permissions are enforced centrally.
- Local persistence is a cache/fallback, never a second competing source of truth.
- Every destructive or financial action is auditable.
- UI components stay presentation-focused and reusable.
- All future features should be additive and isolated behind domain services.

## Core layers

1. **App Core**
   Bootstrap, environment/config, router, session lifecycle, global error handling, feature flags.

2. **Data Layer**
   Supabase client, repositories, synchronization, offline cache, migrations and validation.

3. **Domain Layer**
   Business, user, customer, vendor, product, inventory movement, invoice, payment, expense, ledger and transaction models.

4. **Application Services**
   Sale/invoice service, inventory service, payment service, customer-credit service, expense service, reporting service and notification service.

5. **UI Layer**
   Shell, navigation, forms, tables, cards, modals, document previews, charts and responsive views.

6. **Features**
   Dashboard, POS, sales, quotations, invoices, purchases, inventory, customers, vendors, Khata/receivables, payments, expenses, accounting, reports, GST/compliance, staff, settings and automation.

## Transaction model

A sale should not directly mutate multiple unrelated screens. It should pass through a transaction service that validates the operation and produces coordinated effects:

`Sale -> Invoice -> Payment (optional) -> Inventory movements -> Receivable/Khata (optional) -> Ledger entries -> Audit event -> UI refresh`

Refunds, purchase receipts, stock adjustments and expenses follow the same pattern.

## Storage model

Cloud persistence is authoritative after successful sync. Local storage contains a user-scoped cache and pending mutation queue. Conflicts are resolved by domain rules rather than blind object spreading.

## Authentication

Supabase Auth remains the identity provider. The app receives a normalized session/user object and the rest of the application does not depend directly on provider-specific response shapes.

## UI/UX

Orbit identity: electric violet/pink gradient, white/light surfaces, rounded controls, depth, subtle 3D perspective, motion and the solar-orbit signature. Motion must be purposeful and respect reduced-motion preferences.

## Rebuild rule

Do not progressively patch the legacy modules into V2. V2 gets a clean boundary and only stable, reviewed functionality is migrated into it.
