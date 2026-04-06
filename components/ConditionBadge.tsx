import { conditionBadgeLabel, isNewCondition } from '@/lib/product-condition';

type Props = {
  condition?: string | null;
  className?: string;
};

const base =
  'inline-block text-[9px] font-black px-3 py-1 rounded-sm shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] uppercase tracking-widest font-gaming border-2 text-white bg-black/45';

export function ConditionBadge({ condition, className = '' }: Props) {
  const isNew = isNewCondition(condition);
  const border = isNew ? 'border-emerald-500' : 'border-yellow-400';
  const label = conditionBadgeLabel(condition);

  return (
    <span className={`${base} ${border} ${className}`.trim()}>{label}</span>
  );
}
