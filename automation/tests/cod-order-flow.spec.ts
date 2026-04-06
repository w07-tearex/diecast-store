import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage';
import { TEST_CUSTOMER } from '../fixtures/test-customer';

/**
 * E2E Test Suite — Diecast Store
 *
 * Covers the following scenarios:
 *  1. Full COD order flow (happy path)
 *  2. Add to cart → Remove from cart
 *  3. Cart quantity update (increase)
 *  4. Checkout form validation (empty submit)
 *  5. Products page sort controls
 */
test.describe('Diecast Store — Shopping Flow', () => {
  let homePage: HomePage;
  let productsPage: ProductsPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;
  let orderConfirmationPage: OrderConfirmationPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    orderConfirmationPage = new OrderConfirmationPage(page);

    // Clear Zustand cart state between tests via localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('cart-storage');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // TEST 1: Full COD Order Flow (Happy Path)
  // ─────────────────────────────────────────────────────────────
  test('TC01 — should complete a full COD order successfully', async ({ page }) => {
    // 1. Navigate to Products
    await homePage.goto();
    await homePage.navigateToProducts();
    await expect(page).toHaveURL(/.*\/products/);

    // 2. Add first in-stock product to cart
    const productName = await productsPage.addFirstInStockProductToCart();
    console.log(`[TC01] Added to cart: ${productName}`);
    await page.waitForTimeout(800);

    // 3. Go to cart and proceed to checkout
    await cartPage.goto();
    await cartPage.verifyItemInCart(productName);
    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/.*\/checkout/);

    // 4. Fill shipping form with COD
    await checkoutPage.fillShippingInfo(TEST_CUSTOMER);
    await checkoutPage.selectCOD();
    await checkoutPage.submitOrder();

    // 5. Verify success on confirmation page
    await orderConfirmationPage.verifySuccess();
    const orderNum = await orderConfirmationPage.getOrderNumber();
    console.log(`[TC01] Order confirmed: ${orderNum}`);
    await expect(page).toHaveURL(/.*\/order-confirmation\/.*/);
  });

  // ─────────────────────────────────────────────────────────────
  // TEST 2: Add to Cart → Remove from Cart
  // ─────────────────────────────────────────────────────────────
  test('TC02 — should add a product to cart then remove it', async ({ page }) => {
    // 1. Go to products and add item
    await productsPage.goto();
    const productName = await productsPage.addFirstInStockProductToCart();
    console.log(`[TC02] Added to cart: ${productName}`);
    await page.waitForTimeout(800);

    // 2. Navigate to cart and verify item is there
    await cartPage.goto();
    await cartPage.verifyItemInCart(productName);

    // 3. Remove the item
    await cartPage.removeFirstItem();

    // 4. Verify cart is now empty
    await cartPage.verifyCartIsEmpty();
    console.log(`[TC02] Item removed. Cart is now empty.`);
  });

  // ─────────────────────────────────────────────────────────────
  // TEST 3: Cart Quantity Update
  // ─────────────────────────────────────────────────────────────
  test('TC03 — should update quantity of an item in the cart', async ({ page }) => {
    // 1. Go to products and add item
    await productsPage.goto();
    await productsPage.addFirstInStockProductToCart();
    await page.waitForTimeout(800);

    // 2. Navigate to cart
    await cartPage.goto();
    const initialQty = await cartPage.getFirstItemQuantity();
    expect(initialQty).toBe(1);
    console.log(`[TC03] Initial quantity: ${initialQty}`);

    // 3. Increase quantity by 1
    await cartPage.increaseFirstItemQuantity();
    await page.waitForTimeout(500);

    // 4. Verify quantity is now 2
    const updatedQty = await cartPage.getFirstItemQuantity();
    expect(updatedQty).toBe(2);
    console.log(`[TC03] Updated quantity: ${updatedQty}`);
  });

  // ─────────────────────────────────────────────────────────────
  // TEST 4: Checkout Form Validation — Empty Submit
  // ─────────────────────────────────────────────────────────────
  test('TC04 — should show validation error when submitting empty checkout form', async ({ page }) => {
    // 1. Add a product so cart is not empty (checkout requires items)
    await productsPage.goto();
    await productsPage.addFirstInStockProductToCart();
    await page.waitForTimeout(800);

    // 2. Navigate directly to checkout
    await page.goto('/checkout');

    // 3. Submit the form without filling any field
    await checkoutPage.submitOrder();

    // 4. Verify a toast/error message appears (form validation)
    // The app uses react-hot-toast and validateForm() returning error strings
    const toastError = page.locator('[role="status"]');
    await expect(toastError).toBeVisible({ timeout: 5000 });
    const toastText = await toastError.innerText();
    console.log(`[TC04] Validation error shown: "${toastText}"`);
    expect(toastText.toLowerCase()).toMatch(/required|invalid/);

    // 5. Verify we are still on the checkout page (no redirect)
    await expect(page).toHaveURL(/.*\/checkout/);
  });

  // ─────────────────────────────────────────────────────────────
  // TEST 5: Products Page — Sort Controls
  // ─────────────────────────────────────────────────────────────
  test('TC05 — should filter products by sort options on the products page', async ({ page }) => {
    await productsPage.goto();

    // Test A-Z sort
    await page.getByRole('link', { name: /a-z/i }).click();
    await expect(page).toHaveURL(/.*sort=az/);
    await expect(productsPage.heading).toBeVisible();
    console.log(`[TC05] A-Z sort applied.`);

    // Test Price High sort
    await page.getByRole('link', { name: /price high/i }).click();
    await expect(page).toHaveURL(/.*sort=price-high/);
    await expect(productsPage.heading).toBeVisible();
    console.log(`[TC05] Price High sort applied.`);

    // Test Price Low sort
    await page.getByRole('link', { name: /price low/i }).click();
    await expect(page).toHaveURL(/.*sort=price-low/);
    await expect(productsPage.heading).toBeVisible();
    console.log(`[TC05] Price Low sort applied.`);

    // Test Newest (default) sort
    await page.getByRole('link', { name: /newest/i }).click();
    await expect(page).toHaveURL(/.*sort=newest/);
    await expect(productsPage.heading).toBeVisible();
    console.log(`[TC05] Newest sort applied.`);
  });
});
