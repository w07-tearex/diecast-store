import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model — Cart Page (/cart)
 */
export class CartPage {
  readonly checkoutButton: Locator;
  /** The remove/drop button for the first item in the cart */
  readonly firstDropItemButton: Locator;

  constructor(private page: Page) {
    this.checkoutButton = page.getByRole('link', { name: /proceed to gate/i });
    // Based on cart/page.tsx: button with text "Drop Item"
    this.firstDropItemButton = page.getByRole('button', { name: /drop item/i }).first();
  }

  async goto() {
    await this.page.goto('/cart');
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

  /** Wait for at least one item to appear and verify its name */
  async verifyItemInCart(productName: string) {
    const cartItem = this.page.locator('h3.font-tech');
    await cartItem.first().waitFor({ state: 'visible', timeout: 15000 });

    const shortName = productName.split(' ').slice(0, 3).join(' ');
    await expect(this.page.getByText(shortName, { exact: false }).first()).toBeVisible({ timeout: 10000 });
  }

  /** Remove the first item in the cart by clicking "Drop Item" */
  async removeFirstItem() {
    await this.firstDropItemButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.firstDropItemButton.click();
  }

  /** Verify the cart shows the empty state message */
  async verifyCartIsEmpty() {
    await expect(this.page.getByText(/your cart is empty/i)).toBeVisible({ timeout: 10000 });
  }

  /** Increase quantity of the first item in the cart by clicking the + button */
  async increaseFirstItemQuantity() {
    // The quantity row uses "+ / −" buttons; the + button is after the quantity span
    const increaseBtn = this.page.locator('button').filter({ hasText: '+' }).first();
    await increaseBtn.click();
  }

  /** Get the displayed quantity of the first cart item */
  async getFirstItemQuantity(): Promise<number> {
    // Based on cart/page.tsx: <span>{item.quantity}</span> inside the quantity row
    const qtySpan = this.page.locator('span.font-black.w-10.text-center');
    const text = await qtySpan.first().innerText();
    return parseInt(text.trim(), 10);
  }
}
