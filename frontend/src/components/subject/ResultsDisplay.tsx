import type { SessionPair, Experiment } from '../../types/experiment';

interface ResultsDisplayProps {
  pair: SessionPair;
  role: 's1' | 's2';
  experiment: Experiment;
}

export default function ResultsDisplay({ pair, role, experiment }: ResultsDisplayProps) {
  if (pair.phase !== 'completed') {
    return null;
  }

  const { E1, E2, m } = experiment.parameters;
  const invested = pair.s_invested ?? 0;
  const returned = pair.r_returned ?? 0;
  const received = invested * m;

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <h2 className="card-title">Round Complete</h2>

        <div className="alert alert-success mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>This experimental round has been completed!</span>
        </div>

        <div className="space-y-4">
          <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
            <div className="stat">
              <div className="stat-title">Your Role</div>
              <div className="stat-value text-sm">
                {role === 's1' ? 'Investor (S1)' : 'Trustee (S2)'}
              </div>
              <div className="stat-desc">
                {role === 's1' ? `Started with ${E1.toLocaleString()} µALGO` : `Started with ${E2.toLocaleString()} µALGO`}
              </div>
            </div>

            <div className="stat">
              <div className="stat-title">Your Final Payout</div>
              <div className="stat-value text-success">
                {role === 's1'
                  ? (pair.s1_payout ?? 0).toLocaleString()
                  : (pair.s2_payout ?? 0).toLocaleString()} µALGO
              </div>
              <div className="stat-desc">Total earnings this round</div>
            </div>
          </div>

          <div className="divider">Round Summary</div>

          <div className="bg-base-200 p-4 rounded-lg space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Investor sent:</span>
              <span>{invested.toLocaleString()} µALGO</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Multiplier applied (×{m}):</span>
              <span>{received.toLocaleString()} µALGO</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Trustee returned:</span>
              <span>{returned.toLocaleString()} µALGO</span>
            </div>
            <div className="divider my-2"></div>
            <div className="flex justify-between font-bold">
              <span>Investor final payout:</span>
              <span>{(pair.s1_payout ?? 0).toLocaleString()} µALGO</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Trustee final payout:</span>
              <span>{(pair.s2_payout ?? 0).toLocaleString()} µALGO</span>
            </div>
          </div>

          {pair.completedAt && (
            <p className="text-xs text-base-content/60 text-center">
              Completed at {new Date(pair.completedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}