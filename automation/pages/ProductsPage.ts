import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model — Products Listing Page (/products)
 */
export class ProductsPage {
  readonly heading: Locator;
  readonly productCards: Locator;

  constructor(private page: Page) {
    this.heading = page.getByRole('heading', { name: /all products/i });
    // Each product card is a link wrapping the card content
    this.productCards = page.locator('a[href^="/product/"]');
  }

  async goto() {
    await this.page.goto('/products');
    await this.heading.waitFor({ state: 'visible' });
  }

  /**
   * Returns the first product card that has an "ADD TO BAG" button visible
   * (i.e. is in-stock, not showing "GAME OVER")
   */
  async getFirstInStockCard(): Promise<Locator> {
    await this.productCards.first().waitFor({ state: 'visible' });
    const cards = await this.productCards.all();
    for (const card of cards) {
      const addBtn = card.getByRole('button', { name: /add to bag/i });
      if (await addBtn.isVisible()) {
        return card;
      }
    }
    throw new Error('No in-stock product found on /products page');
  }

  /** Click ADD TO BAG on the first in-stock product */
  async addFirstInStockProductToCart(): Promise<string> {
    const card = await this.getFirstInStockCard();
    const productName = await card.locator('h3').innerText();
    const addBtn = card.getByRole('button', { name: /add to bag/i });
    await addBtn.click();
    return productName.trim();
  }
}
