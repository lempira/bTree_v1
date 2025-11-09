import type { PairPhase } from '../../types/experiment';

interface PairStatusBadgeProps {
  phase: PairPhase;
}

export default function PairStatusBadge({ phase }: PairStatusBadgeProps) {
  const config = {
    waiting_s1: {
      label: 'Waiting for S1',
      className: 'badge-warning',
    },
    waiting_s2: {
      label: 'Waiting for S2',
      className: 'badge-info',
    },
    completed: {
      label: 'Completed',
      className: 'badge-success',
    },
  };

  const { label, className } = config[phase];

  return <span className={`badge ${className} badge-sm`}>{label}</span>;
}