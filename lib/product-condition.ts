/** Stored in `products.product_condition` (TEXT). Not `condition` — PostgREST/SQL reserved-word issues. */
export const PRODUCT_CONDITION_VALUES = [
  'new',
  'used_like_new',
  'used_lightly_played',
  'used_heavily_played',
  'used_damaged',
] as const;

export type ProductCondition = (typeof PRODUCT_CONDITION_VALUES)[number];

export function isNewCondition(condition: string | null | undefined): boolean {
  return condition === 'new' || condition == null || condition === '';
}

/** Short uppercase label for badges (matches card layout). */
export function conditionBadgeLabel(condition: string | null | undefined): string {
  if (isNewCondition(condition)) return 'NEW';
  const map: Record<string, string> = {
    used_like_new: 'LIKE NEW',
    used_lightly_played: 'LIGHTLY PLAYED',
    used_heavily_played: 'HEAVILY PLAYED',
    used_damaged: 'DAMAGED',
  };
  const key = condition ?? '';
  if (map[key]) return map[key];
  return key.replace(/^used_/, '').replace(/_/g, ' ').toUpperCase();
}
