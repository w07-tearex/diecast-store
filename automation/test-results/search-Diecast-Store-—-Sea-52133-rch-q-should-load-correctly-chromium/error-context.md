# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: search.spec.ts >> Diecast Store — Search Feature >> TC-S04 — direct URL navigation to /search?q=... should load correctly
- Location: tests/search.spec.ts:83:7

# Error details

```
Error: locator.waitFor: Target page, context or browser has been closed
Call log:
  - waiting for getByRole('heading', { name: /search results/i }) to be visible

```

# Test source

```ts
  1  | import { Page, Locator, expect } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * Page Object Model — Search Feature
  5  |  *
  6  |  * Search input: MainMenu.tsx (navbar) — navigates to /search?q=<query>
  7  |  * Search results: /search/page.tsx — Supabase ilike query on name + brand
  8  |  */
  9  | export class SearchPage {
  10 |   /** Search input in the nav bar */
  11 |   readonly searchInput: Locator;
  12 |   /** Search form wrapper */
  13 |   readonly searchForm: Locator;
  14 |   /** "Search Results" h1 heading */
  15 |   readonly resultsHeading: Locator;
  16 |   /** "X matching models for …" subtitle text */
  17 |   readonly resultsCount: Locator;
  18 |   /** "No match found" state heading */
  19 |   readonly noResultsHeading: Locator;
  20 |   /** "Back to Gallery" link in empty state */
  21 |   readonly backToGalleryLink: Locator;
  22 |   /** All product cards rendered in results */
  23 |   readonly resultCards: Locator;
  24 | 
  25 |   constructor(private page: Page) {
  26 |     this.searchInput = page.locator('input[placeholder*="SEARCH"]');
  27 |     this.searchForm  = page.locator('form').filter({ has: this.searchInput });
  28 |     this.resultsHeading   = page.getByRole('heading', { name: /search results/i });
  29 |     this.resultsCount     = page.locator('p').filter({ hasText: /matching model/i });
  30 |     this.noResultsHeading = page.getByRole('heading', { name: /no match found/i });
  31 |     this.backToGalleryLink = page.getByRole('link', { name: /back to gallery/i });
  32 |     this.resultCards = page.locator('a[href^="/product/"]');
  33 |   }
  34 | 
  35 |   /** Navigate to homepage so the nav bar (and search input) is visible */
  36 |   async gotoHome() {
  37 |     await this.page.goto('/');
  38 |   }
  39 | 
  40 |   /** Navigate directly to the search results page via URL */
  41 |   async gotoSearchUrl(query: string) {
  42 |     await this.page.goto(`/search?q=${encodeURIComponent(query)}`);
  43 |     await this.resultsHeading.waitFor({ state: 'visible', timeout: 10_000 });
  44 |   }
  45 | 
  46 |   /** Type a query in the nav search box and press Enter */
  47 |   async searchViaNavbar(query: string) {
  48 |     await this.searchInput.waitFor({ state: 'visible', timeout: 10_000 });
  49 |     await this.searchInput.fill(query);
  50 |     await this.searchInput.press('Enter');
  51 |   }
  52 | 
  53 |   /** Wait for the results page to finish loading */
  54 |   async waitForResults() {
> 55 |     await this.resultsHeading.waitFor({ state: 'visible', timeout: 15_000 });
     |                               ^ Error: locator.waitFor: Target page, context or browser has been closed
  56 |   }
  57 | 
  58 |   /** Parse the result count number from "Found X matching models…" */
  59 |   async getResultCount(): Promise<number> {
  60 |     const text = await this.resultsCount.innerText();
  61 |     const match = text.match(/Found\s+(\d+)/i);
  62 |     return match ? parseInt(match[1], 10) : 0;
  63 |   }
  64 | }
  65 | 
```