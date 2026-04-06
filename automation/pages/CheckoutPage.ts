import { Page, Locator, expect } from '@playwright/test';
import { TestCustomer } from '../fixtures/test-customer';

/**
 * Page Object Model — Checkout Page (/checkout)
 */
export class CheckoutPage {
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly postalCodeInput: Locator;
  readonly countryInput: Locator;
  readonly paymentMethodSelect: Locator;
  readonly submitButton: Locator;

  constructor(private page: Page) {
    this.fullNameInput = page.locator('input[name="name"]');
    this.emailInput = page.locator('input[name="email"]');
    this.phoneInput = page.locator('input[name="phone"]');
    this.addressInput = page.locator('input[name="address"]');
    this.cityInput = page.locator('input[name="city"]');
    this.postalCodeInput = page.locator('input[name="postalCode"]');
    this.countryInput = page.locator('input[name="country"]');
    this.paymentMethodSelect = page.locator('select[name="paymentMethod"]');
    this.submitButton = page.getByRole('button', { name: /finalize collection|submit order/i });
  }

  async goto() {
    await this.page.goto('/checkout');
  }

  async fillShippingInfo(customer: TestCustomer) {
    await this.fullNameInput.fill(customer.name);
    await this.emailInput.fill(customer.email);
    await this.phoneInput.fill(customer.phone);
    await this.addressInput.fill(customer.address);
    await this.cityInput.fill(customer.city);
    await this.postalCodeInput.fill(customer.postalCode);
    await this.countryInput.fill(customer.country);
  }

  async selectCOD() {
    await this.paymentMethodSelect.selectOption('cod');
  }

  async submitOrder() {
    await this.submitButton.click();
  }
}
