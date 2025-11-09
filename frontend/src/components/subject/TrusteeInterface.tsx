import { useState } from 'react';
import type { SessionPair, Experiment } from '../../types/experiment';
import { submitTrusteeDecision } from '../../utils/decisionDB';
import { calculateTrusteeReceived } from '../../game/trustGame';

interface TrusteeInterfaceProps {
  sessionId: string;
  pair: SessionPair;
  subjectId: string;
  experiment: Experiment;
  onDecisionMade?: () => void;
}

export default function TrusteeInterface({
  sessionId,
  pair,
  subjectId,
  experiment,
  onDecisionMade,
}: TrusteeInterfaceProps) {
  const { E1, E2, m, UNIT } = experiment.parameters;
  const investment = pair.s_invested ?? 0;
  const received = calculateTrusteeReceived(investment, m);

  const [returnAmount, setReturnAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trusteeKeeps = received - returnAmount;

  async function handleSubmit() {
    setError(null);

    try {
      setSubmitting(true);
      await submitTrusteeDecision(
        sessionId,
        pair.pairId,
        subjectId,
        returnAmount,
        received,
        E1,
        E2,
        m,
        investment,
        UNIT
      );
      onDecisionMade?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit decision');
    } finally {
      setSubmitting(false);
    }
  }

  // Generate return options based on UNIT step size
  const options: number[] = [];
  for (let i = 0; i <= received; i += UNIT) {
    options.push(i);
  }

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <h2 className="card-title">Trustee Decision</h2>

        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <p className="font-medium">You are the Trustee (S2)</p>
            <p className="text-sm">The Investor sent you {investment.toLocaleString()} µALGO. After multiplication (×{m}), you received {received.toLocaleString()} µALGO.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
            <div className="stat">
              <div className="stat-title">Your Endowment</div>
              <div className="stat-value text-primary">{E2.toLocaleString()}</div>
              <div className="stat-desc">µALGO initial</div>
            </div>

            <div className="stat">
              <div className="stat-title">You Received</div>
              <div className="stat-value text-secondary">{received.toLocaleString()}</div>
              <div className="stat-desc">From investor (×{m})</div>
            </div>
          </div>

          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">What Happened:</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Investor sent:</span>
                <span className="font-medium">{investment.toLocaleString()} µALGO</span>
              </div>
              <div className="flex justify-between">
                <span>Multiplied by {m}:</span>
                <span className="font-medium">{received.toLocaleString()} µALGO</span>
              </div>
            </div>
          </div>

          <div className="divider">Make Your Decision</div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">How much do you want to return to the Investor?</span>
            </label>

            {options.length <= 10 ? (
              // Show as buttons if few options
              <div className="grid grid-cols-3 gap-2">
                {options.map((amount) => (
                  <button
                    key={amount}
                    className={`btn ${returnAmount === amount ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setReturnAmount(amount)}
                    disabled={submitting}
                  >
                    {amount.toLocaleString()}
                  </button>
                ))}
              </div>
            ) : (
              // Show as range slider if many options
              <div className="space-y-2">
                <input
                  type="range"
                  min={0}
                  max={received}
                  step={UNIT}
                  value={returnAmount}
                  onChange={(e) => setReturnAmount(Number(e.target.value))}
                  className="range range-primary"
                  disabled={submitting}
                />
                <div className="flex justify-between text-xs text-base-content/60">
                  <span>0</span>
                  <span className="font-bold text-base text-primary">{returnAmount.toLocaleString()} µALGO</span>
                  <span>{received.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-base-200 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-sm">Preview:</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>You return to Investor:</span>
                <span className="font-medium">{returnAmount.toLocaleString()} µALGO</span>
              </div>
              <div className="flex justify-between">
                <span>You keep from received:</span>
                <span className="font-medium">{trusteeKeeps.toLocaleString()} µALGO</span>
              </div>
              <div className="divider my-1"></div>
              <div className="flex justify-between font-semibold">
                <span>Your total payout:</span>
                <span className="text-success">{(E2 + trusteeKeeps).toLocaleString()} µALGO</span>
              </div>
              <div className="flex justify-between text-base-content/60">
                <span>Investor's total payout:</span>
                <span>{(E1 - investment + returnAmount).toLocaleString()} µALGO</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <div className="card-actions justify-end">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Submitting...
                </>
              ) : (
                'Submit Return Decision'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}