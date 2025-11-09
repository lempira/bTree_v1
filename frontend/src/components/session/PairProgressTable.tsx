import type { SessionPair } from '../../types/experiment';
import PairProgressRow from './PairProgressRow';

interface PairProgressTableProps {
  pairs: SessionPair[];
}

export default function PairProgressTable({ pairs }: PairProgressTableProps) {
  if (pairs.length === 0) {
    return (
      <div className="text-center py-8 text-base-content/50">
        <p>No pairs in this session</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm">
        <thead>
          <tr>
            <th>Pair</th>
            <th>S1 (Investor)</th>
            <th>S2 (Trustee)</th>
            <th>Status</th>
            <th className="text-center">Invested</th>
            <th className="text-center">Returned</th>
            <th className="text-center">Completed</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair, index) => (
            <PairProgressRow key={pair.pairId} pair={pair} index={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
}