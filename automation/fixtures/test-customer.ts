/**
 * Test customer fixture data for COD order flow automation.
 * Uses realistic Vietnamese customer data.
 * Email pattern: test-auto@* to allow easy cleanup if needed.
 */
export const TEST_CUSTOMER = {
  name: 'Nguyen Van Test',
  email: 'test-auto@diecast.dev',
  phone: '0901234567',
  address: '21 Phung Khac Khoan, Quan 1',
  city: 'Ho Chi Minh City',
  state: 'Ho Chi Minh',
  postalCode: '700000',
  country: 'Vietnam',
} as const;

export type TestCustomer = typeof TEST_CUSTOMER;
