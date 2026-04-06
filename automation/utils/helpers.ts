import { Page } from '@playwright/test';

/**
 * Shared helper functions for automation tests
 */

/**
 * Waits for a specific amount of time. Use sparingly.
 */
export async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates a random email for testing to avoid collisions
 */
export function generateRandomEmail(baseEmail: string) {
  const [user, domain] = baseEmail.split('@');
  const timestamp = Date.now();
  return `${user}+${timestamp}@${domain}`;
}
