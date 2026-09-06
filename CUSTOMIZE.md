# Orbit BizAssist customization guide

The local product files are in this folder.

- **App name and parent brand:** `app.js` → `CONFIG.brand` and `CONFIG.parentBrand`.
- **Default business, currency, tax, and categories:** `app.js` → `CONFIG`.
- **Supabase URL and publishable key:** `supabase-sync.js` → `config`.
- **Colours, spacing, and fonts:** `styles.css` → the `:root` variables at the top.
- **Supabase database setup:** run `supabase-schema.sql` once in the Supabase SQL Editor, then enable Email and Phone authentication providers.

This application remains usable without a connection: changes save to this browser first and are pushed to Supabase whenever the account is connected and online.
