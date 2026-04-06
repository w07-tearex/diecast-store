import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model — Search Feature
 *
 * Search input: MainMenu.tsx (navbar) — navigates to /search?q=<query>
 * Search results: /search/page.tsx — Supabase ilike query on name + brand
 */
export class SearchPage {
  /** Search input in the nav bar */
  readonly searchInput: Locator;
  /** Search form wrapper */
  readonly searchForm: Locator;
  /** "Search Results" h1 heading */
  readonly resultsHeading: Locator;
  /** "X matching models for …" subtitle text */
  readonly resultsCount: Locator;
  /** "No match found" state heading */
  readonly noResultsHeading: Locator;
  /** "Back to Gallery" link in empty state */
  readonly backToGalleryLink: Locator;
  /** All product cards rendered in results */
  readonly resultCards: Locator;

  constructor(private page: Page) {
    this.searchInput = page.locator('input[placeholder*="SEARCH"]');
    this.searchForm = page.locator('form').filter({ has: this.searchInput });
    this.resultsHeading = page.getByRole('heading', { name: /search results/i });
    this.resultsCount = page.locator('p').filter({ hasText: /matching model/i });
    this.noResultsHeading = page.getByRole('heading', { name: /no match found/i });
    this.backToGalleryLink = page.getByRole('link', { name: /back to gallery/i });
    this.resultCards = page.locator('a[href^="/product/"]');
  }

  /** Navigate to homepage so the nav bar (and search input) is visible */
  async gotoHome() {
    await this.page.goto('/');
  }

  /** Navigate directly to the search results page via URL */
  async gotoSearchUrl(query: string) {
    await this.page.goto(`/search?q=${encodeURIComponent(query)}`);
    await this.resultsHeading.waitFor({ state: 'visible', timeout: 10_000 });
  }

  /** Type a query in the nav search box and press Enter */
  async searchViaNavbar(query: string) {
    await this.searchInput.waitFor({ state: 'visible', timeout: 10_000 });
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  /** Wait for the results page to finish loading */
  async waitForResults() {
    await this.resultsHeading.waitFor({ state: 'visible', timeout: 15_000 });
  }

  /** Parse the result count number from "Found X matching models…" */
  async getResultCount(): Promise<number> {
    const text = await this.resultsCount.innerText();
    const match = text.match(/Found\s+(\d+)/i);
    return match ? parseInt(match[1], 10) : 0;
  }
}
