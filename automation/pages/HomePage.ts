import { Page } from '@playwright/test';

/**
 * Page Object Model — Home Page (/)
 */
export class HomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  /** Click the main nav link to go to all products */
  async navigateToProducts() {
    // The link is labeled "IN STOCK" based on UI inspection
    await this.page.getByRole('link', { name: /in stock/i }).first().click();
  }
}
