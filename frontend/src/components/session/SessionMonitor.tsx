import type { Session } from '../../types/experiment';
import SessionStats from './SessionStats';
import PairProgressTable from './PairProgressTable';

interface SessionMonitorProps {
  session: Session;
}

export default function SessionMonitor({ session }: SessionMonitorProps) {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="card-title">{session.name}</h3>
            <p className="text-sm text-base-content/60">
              Created {new Date(session.createdAt).toLocaleString()}
            </p>
          </div>
          <span className={`badge ${
            session.status === 'active' ? 'badge-success' :
            session.status === 'completed' ? 'badge-info' :
            'badge-ghost'
          } badge-lg`}>
            {session.status}
          </span>
        </div>

        <SessionStats session={session} />

        <div className="divider"></div>

        <h4 className="font-semibold mb-3">Pair Progress</h4>
        <PairProgressTable pairs={session.pairs} />
      </div>
    </div>
  );
}