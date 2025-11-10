import { useState } from 'react';
import type { Session } from '../../types/experiment';
import PairProgressTable from './PairProgressTable';

interface SessionTableProps {
  sessions: Session[];
}

interface SessionRowProps {
  session: Session;
}

function SessionRow({ session }: SessionRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalPairs = session.pairs.length;
  const completedPairs = session.pairs.filter(p => p.phase === 'completed').length;
  const waitingS1 = session.pairs.filter(p => p.phase === 'waiting_s1').length;
  const waitingS2 = session.pairs.filter(p => p.phase === 'waiting_s2').length;

  const statusBadgeClass =
    session.status === 'active' ? 'badge-success' :
    session.status === 'completed' ? 'badge-info' :
    'badge-ghost';

  return (
    <>
      <tr
        className="hover cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td>
          <button className="btn btn-ghost btn-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </td>
        <td>
          <div className="font-medium">{session.name}</div>
          <div className="text-xs text-base-content/60">
            {new Date(session.createdAt).toLocaleString()}
          </div>
        </td>
        <td>
          <span className={`badge ${statusBadgeClass}`}>
            {session.status}
          </span>
        </td>
        <td className="text-center">{totalPairs}</td>
        <td className="text-center">
          <span className="text-success font-semibold">{completedPairs}</span>
        </td>
        <td className="text-center">
          <span className="text-warning font-semibold">{waitingS1}</span>
        </td>
        <td className="text-center">
          <span className="text-info font-semibold">{waitingS2}</span>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={7} className="bg-base-200">
            <div className="p-4">
              <h4 className="font-semibold mb-3">Pair Progress</h4>
              <PairProgressTable pairs={session.pairs} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function SessionTable({ sessions }: SessionTableProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-base-content/50">
        <p>No sessions yet. Create a session to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th className="w-12"></th>
            <th>Session Name</th>
            <th>Status</th>
            <th className="text-center">Total Pairs</th>
            <th className="text-center">Completed</th>
            <th className="text-center">Waiting S1</th>
            <th className="text-center">Waiting S2</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))}
        </tbody>
      </table>
    </div>
  );
}