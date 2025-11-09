import type { SessionPair } from '../../types/experiment';
import PairStatusBadge from './PairStatusBadge';

interface PairProgressRowProps {
  pair: SessionPair;
  index: number;
}

export default function PairProgressRow({ pair, index }: PairProgressRowProps) {
  return (
    <tr>
      <td className="font-medium">#{index + 1}</td>
      <td className="font-mono text-xs">{pair.s1_id}</td>
      <td className="font-mono text-xs">{pair.s2_id}</td>
      <td>
        <PairStatusBadge phase={pair.phase} />
      </td>
      <td className="text-center">
        {pair.s_invested !== null ? pair.s_invested.toLocaleString() : '—'}
      </td>
      <td className="text-center">
        {pair.r_returned !== null ? pair.r_returned.toLocaleString() : '—'}
      </td>
      <td className="text-center">
        {pair.completedAt ? new Date(pair.completedAt).toLocaleTimeString() : '—'}
      </td>
    </tr>
  );
}