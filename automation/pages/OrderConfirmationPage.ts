import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model — Order Confirmation Page (/order-confirmation/[id])
 */
export class OrderConfirmationPage {
  readonly confirmationHeading: Locator;
  readonly orderNumber: Locator;

  constructor(private page: Page) {
    this.confirmationHeading = page.getByRole('heading', { name: /order confirmed|thank you/i });
    this.orderNumber = page.locator('.text-2xl.font-bold.text-white').first(); // Based on the view_file output
  }

  async verifySuccess() {
    await expect(this.confirmationHeading).toBeVisible({ timeout: 20000 });
  }

  async getOrderNumber(): Promise<string> {
    return await this.orderNumber.innerText();
  }
}
