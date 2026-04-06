import { test, expect } from '@playwright/test';
import { SearchPage } from '../pages/SearchPage';

/**
 * E2E Test Suite — Search Feature
 *
 * Covers all search scenarios:
 *  TC-01: Navbar search → navigates to /search?q=...
 *  TC-02: Valid keyword → shows product results
 *  TC-03: Nonsense keyword → "No match found" state
 *  TC-04: Direct URL access /search?q=...
 *  TC-05: Empty search box → does NOT navigate
 *  TC-06: Case-insensitive search (lowercase query)
 *  TC-07: Search by brand name
 *  TC-8: Multi-word search query
 *  TC-9: Click a search result → navigates to product detail
 *  TC-10: "Back to Gallery" link in empty state
 */
test.describe('Diecast Store — Search Feature', () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
  });

  // ─────────────────────────────────────────────────────────────
  // TC-01: Navbar search box → redirects to /search?q=...
  // ─────────────────────────────────────────────────────────────
  test('TC-01 — navbar search should redirect to /search with correct query param', async ({ page }) => {
    await searchPage.gotoHome();

    await searchPage.searchViaNavbar('Porsche');

    // URL should update to /search?q=Porsche
    await expect(page).toHaveURL(/\/search\?q=Porsche/i);
    await searchPage.waitForResults();

    console.log('[TC-01] Redirected to /search?q=Porsche ✓');
  });

  // ─────────────────────────────────────────────────────────────
  // TC-02: Valid keyword → product cards appear
  // ─────────────────────────────────────────────────────────────
  test('TC-02 — valid keyword should return product results', async ({ page }) => {
    await searchPage.gotoSearchUrl('Porsche');

    // Results heading visible
    await expect(searchPage.resultsHeading).toBeVisible();

    // At least one product card should appear
    await expect(searchPage.resultCards.first()).toBeVisible({ timeout: 10_000 });

    const count = await searchPage.getResultCount();
    expect(count).toBeGreaterThan(0);

    console.log(`[TC-02] Found ${count} result(s) for "Porsche" ✓`);
  });

  // ─────────────────────────────────────────────────────────────
  // TC-03: Nonsense keyword → "No match found" empty state
  // ─────────────────────────────────────────────────────────────
  test('TC-03 — nonsense keyword should show empty state', async ({ page }) => {
    const GARBAGE_QUERY = 'xyzabc99999nonexistent';
    await searchPage.gotoSearchUrl(GARBAGE_QUERY);

    // "No match found" heading must appear
    await expect(searchPage.noResultsHeading).toBeVisible({ timeout: 10_000 });

    // No product cards should be visible
    const cardCount = await searchPage.resultCards.count();
    expect(cardCount).toBe(0);

    // Count text shows 0
    const count = await searchPage.getResultCount();
    expect(count).toBe(0);

    console.log(`[TC-03] No results for "${GARBAGE_QUERY}" — empty state shown ✓`);
  });

  // ─────────────────────────────────────────────────────────────
  // TC-04: Direct URL access with encoded query
  // ─────────────────────────────────────────────────────────────
  test('TC-04 — direct URL navigation to /search?q=... should load correctly', async ({ page }) => {
    // Navigate directly via URL (bypasses navbar)
    await page.goto('/search?q=MiniGT');
    await searchPage.waitForResults();

    await expect(searchPage.resultsHeading).toBeVisible();
    await expect(page).toHaveURL(/\/search\?q=MiniGT/);

    const count = await searchPage.getResultCount();
    console.log(`[TC-04] Direct URL /search?q=MiniGT → ${count} result(s) ✓`);
  });

  // ─────────────────────────────────────────────────────────────
  // TC-05: Empty search box → does NOT navigate away
  // ─────────────────────────────────────────────────────────────
  test('TC-05 — submitting empty search box should not navigate', async ({ page }) => {
    await searchPage.gotoHome();
    const currentUrl = page.url();

    // Click search box but don't type anything
    await searchPage.searchInput.click();
    await searchPage.searchInput.clear();
    await searchPage.searchInput.press('Enter');

    // Wait briefly, then verify URL hasn't changed
    await page.waitForTimeout(800);
    expect(page.url()).toBe(currentUrl);

    console.log('[TC-05] Empty search did not navigate ✓');
  });

  // ─────────────────────────────────────────────────────────────
  // TC-06: Case-insensitive search (search "porsche" lowercase)
  // ─────────────────────────────────────────────────────────────
  test('TC-06 — search should be case-insensitive', async ({ page }) => {
    // Search with lowercase
    await searchPage.gotoSearchUrl('porsche');
    const lowercaseCount = await searchPage.getResultCount();

    // Search with uppercase
    await searchPage.gotoSearchUrl('PORSCHE');
    const uppercaseCount = await searchPage.getResultCount();

    // Both queries should return the same number of results (ilike)
    expect(lowercaseCount).toBe(uppercaseCount);
    expect(lowercaseCount).toBeGreaterThan(0);

    console.log(`[TC-S06] "porsche" → ${lowercaseCount}, "PORSCHE" → ${uppercaseCount} (case-insensitive ✓)`);
  });

  // ─────────────────────────────────────────────────────────────
  // TC-07: Search by brand name
  // ─────────────────────────────────────────────────────────────
  test('TC-07 — should find products when searching by brand name', async ({ page }) => {
    const BRAND = 'Cool Car';
    await searchPage.gotoSearchUrl(BRAND);

    await expect(searchPage.resultsHeading).toBeVisible();

    const count = await searchPage.getResultCount();
    expect(count).toBeGreaterThan(0);

    // Verify the subtitle text includes the searched brand name
    const countText = await searchPage.resultsCount.innerText();
    expect(countText.toLowerCase()).toContain(BRAND.toLowerCase());

    console.log(`[TC-07] Brand search "${BRAND}" → ${count} result(s) ✓`);
  });

  // ─────────────────────────────────────────────────────────────
  // TC-08: Multi-word search query
  // ─────────────────────────────────────────────────────────────
  test('TC-08 — multi-word search should return relevant results', async ({ page }) => {
    const QUERY = 'Cool Car Porsche';
    await searchPage.gotoSearchUrl(QUERY);

    await expect(searchPage.resultsHeading).toBeVisible();

    // Multi-word uses OR logic (each word is independently matched)
    const count = await searchPage.getResultCount();
    expect(count).toBeGreaterThan(0);

    console.log(`[TC-08] Multi-word "${QUERY}" → ${count} result(s) ✓`);
  });

  // ─────────────────────────────────────────────────────────────
  // TC-09: Click a search result → navigate to product detail
  // ─────────────────────────────────────────────────────────────
  test('TC-09 — clicking a search result should navigate to product detail page', async ({ page }) => {
    await searchPage.gotoSearchUrl('Porsche');

    // Wait for at least one card
    await expect(searchPage.resultCards.first()).toBeVisible({ timeout: 10_000 });

    // Click the first product card
    await searchPage.resultCards.first().click();

    // Should navigate to /product/[id]
    await expect(page).toHaveURL(/\/product\//);

    console.log(`[TC-09] Clicked result → navigated to ${page.url()} ✓`);
  });

  // ─────────────────────────────────────────────────────────────
  // TC-10: "Back to Gallery" in empty state → navigates to /products
  // ─────────────────────────────────────────────────────────────
  test('TC-10 — "Back to Gallery" in empty state should link to /products', async ({ page }) => {
    // Force empty state
    await searchPage.gotoSearchUrl('xyzabc99999nonexistent');
    await expect(searchPage.noResultsHeading).toBeVisible();

    // Click "Back to Gallery"
    await searchPage.backToGalleryLink.click();

    // Should navigate to /products
    await expect(page).toHaveURL(/\/products/);
    console.log('[TC-10] "Back to Gallery" → /products ✓');
  });
});
