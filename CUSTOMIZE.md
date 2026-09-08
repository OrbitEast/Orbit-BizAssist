# Orbit BizAssist customization guide

The application source is organized into `index.html`, `css/`, `js/`, and `modules/`.

- **App name and parent brand:** `js/state.js` → `CONFIG.brand` and `CONFIG.parentBrand`.
- **Default business, currency, tax, and categories:** `js/state.js` → `CONFIG`.
- **Supabase URL and publishable key:** `js/supabase.js` → `CONFIG`.
- **Colours, spacing, and fonts:** the files under `css/`.
- **Supabase database setup:** run `supabase-schema.sql` once in the Supabase SQL Editor, then enable the Google authentication provider.

The app keeps a local copy for resilience and syncs the authenticated business state to Supabase when the cloud session is available.
