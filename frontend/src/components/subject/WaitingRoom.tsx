import type { PairPhase } from '../../types/experiment';

interface WaitingRoomProps {
  role: 's1' | 's2';
  phase: PairPhase;
}

export default function WaitingRoom({ role, phase }: WaitingRoomProps) {
  // Determine if this subject should wait
  const shouldWait =
    (role === 's1' && phase === 'waiting_s2') ||
    (role === 's2' && phase === 'waiting_s1');

  if (!shouldWait) {
    return null;
  }

  const message = role === 's1'
    ? 'Waiting for the Trustee to make their decision...'
    : 'Waiting for the Investor to make their decision...';

  const description = role === 's1'
    ? 'The Trustee is deciding how much to return to you.'
    : 'The Investor is deciding how much to invest.';

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <h2 className="card-title">Please Wait</h2>

        <div className="flex flex-col items-center justify-center py-8">
          <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
          <p className="text-lg font-medium text-center">{message}</p>
          <p className="text-sm text-base-content/70 text-center mt-2">{description}</p>
        </div>

        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>This page will automatically update when it's your turn.</span>
        </div>
      </div>
    </div>
  );
}