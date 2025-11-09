import type { Session } from '../../types/experiment';

interface SessionStatsProps {
  session: Session;
}

export default function SessionStats({ session }: SessionStatsProps) {
  const totalPairs = session.pairs.length;
  const completedPairs = session.pairs.filter(p => p.phase === 'completed').length;
  const waitingS1 = session.pairs.filter(p => p.phase === 'waiting_s1').length;
  const waitingS2 = session.pairs.filter(p => p.phase === 'waiting_s2').length;
  const progressPercent = totalPairs > 0 ? Math.round((completedPairs / totalPairs) * 100) : 0;

  return (
    <div className="stats stats-vertical lg:stats-horizontal shadow">
      <div className="stat">
        <div className="stat-title">Total Pairs</div>
        <div className="stat-value text-primary">{totalPairs}</div>
        <div className="stat-desc">{totalPairs * 2} subjects</div>
      </div>

      <div className="stat">
        <div className="stat-title">Completed</div>
        <div className="stat-value text-success">{completedPairs}</div>
        <div className="stat-desc">{progressPercent}% complete</div>
      </div>

      <div className="stat">
        <div className="stat-title">Waiting for S1</div>
        <div className="stat-value text-warning">{waitingS1}</div>
        <div className="stat-desc">Investor decisions pending</div>
      </div>

      <div className="stat">
        <div className="stat-title">Waiting for S2</div>
        <div className="stat-value text-info">{waitingS2}</div>
        <div className="stat-desc">Trustee decisions pending</div>
      </div>
    </div>
  );
}