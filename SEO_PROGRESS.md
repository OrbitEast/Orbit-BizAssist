# Orbit Biz — SEO Progress

Last updated: 2026-09-10

## Current status

### Technical SEO — COMPLETE
- [x] Google Search Console ownership verification completed.
- [x] Google verification HTML file is present in the repository and should be kept while verification is needed.
- [x] Google verification meta tag added to `index.html`.
- [x] SEO title improved to target Orbit Biz + business management software.
- [x] Meta description added and aligned with the actual product.
- [x] `robots` / `googlebot` indexing directives added.
- [x] Canonical URL added for `https://orbitbiz.web.app/`.
- [x] Open Graph metadata added for social sharing previews.
- [x] Twitter card metadata added.
- [x] `SoftwareApplication` structured data added with Orbit East as publisher.
- [x] `robots.txt` created and points crawlers to the sitemap.
- [x] `sitemap.xml` created with the real public homepage URL.
- [x] Web manifest added.
- [x] GitHub → Firebase automatic deployment is working.
- [x] Google Search Console currently reports the homepage as **“URL is on Google”**, meaning the homepage is already indexed.

## Important note about the sitemap

The sitemap currently contains only the homepage. This is intentional: Orbit Biz is currently a JavaScript single-page application, and we should not submit fake/duplicate URLs such as `/invoice` or `/inventory` until those become genuine, crawlable public SEO pages.

## SEO work still remaining

### Priority 1 — Public SEO pages
- [ ] Build genuine crawlable pages for major product capabilities, e.g. invoice, inventory, expenses, payments and business management.
- [ ] Give each public page its own title, description, H1, useful content and canonical URL.
- [ ] Add those real URLs to `sitemap.xml` after they exist.
- [ ] Add internal links between related public pages.

### Priority 2 — Useful search content
Create genuinely useful resources rather than keyword-stuffed pages, for example:
- [ ] How to manage inventory for a small business
- [ ] Invoice vs receipt: what is the difference?
- [ ] How to track business expenses
- [ ] Small-business billing/invoicing guide for India
- [ ] Inventory management basics for small businesses

### Priority 3 — Search performance
- [ ] Monitor Search Console impressions, clicks, CTR and average position.
- [ ] Improve titles/descriptions based on actual queries and CTR.
- [ ] Check indexing coverage and crawl issues.
- [ ] Check Core Web Vitals / mobile performance.
- [ ] Fix broken links, missing metadata and other crawl issues discovered by Search Console.

### Priority 4 — Authority / discovery
- [ ] Create genuine brand profiles where appropriate (GitHub, LinkedIn, Product Hunt, relevant startup/business directories, etc.).
- [ ] Earn relevant backlinks through useful product/content—not spam or paid link schemes.
- [ ] Keep Orbit Biz branding and descriptions consistent across public profiles.

## Manual Google Search Console actions

Already indexed:
- Homepage status: **URL is on Google**.

Still recommended:
- [ ] In Search Console → Sitemaps, submit `sitemap.xml` if not already submitted.
- [ ] Do not repeatedly request indexing if the URL already says **“URL is on Google.”**

## SEO target direction

Initial target terms should focus on relevant, achievable long-tail searches rather than trying to rank immediately for extremely broad terms:
- free business management software India
- small business billing software India
- inventory management software for small business
- business invoice software India
- khata and inventory software
- GST invoice software for small business
- free invoice generator India

These are targets for content planning, not guarantees of ranking. Do not stuff keywords into pages.

## Product/SEO constraint

Orbit Biz is primarily a web app. The biggest next SEO improvement is making useful public product/resource content crawlable without requiring Google to execute the entire authenticated application. Authenticated workspace screens should remain focused on the actual app experience, while public SEO pages should explain the product and provide useful information.

## Next chat starting point

**Start with Priority 1: create the first genuine public SEO/product page (recommended: Invoice/Billing), then update navigation, metadata, internal links and sitemap as part of the same implementation.**
