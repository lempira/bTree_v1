import { useState, useEffect } from 'react';
import type { SessionPair, Experiment } from '../../types/experiment';
import { findSubjectPair } from '../../utils/sessionDB';
import { getExperimentForSession } from '../../utils/experimentDB';
import InvestorInterface from '../subject/InvestorInterface';
import TrusteeInterface from '../subject/TrusteeInterface';
import WaitingRoom from '../subject/WaitingRoom';
import ResultsDisplay from '../subject/ResultsDisplay';

const POLL_INTERVAL = 3000; // 3 seconds

export default function SubjectDashboard(): JSX.Element {
  const [sessionId, setSessionId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<{
    pair: SessionPair;
    role: 's1' | 's2';
  } | null>(null);
  const [experiment, setExperiment] = useState<Experiment | null>(null);

  async function handleJoinSession() {
    setError(null);

    if (!sessionId.trim() || !subjectId.trim()) {
      setError('Please enter both Session ID and Subject ID');
      return;
    }

    try {
      setLoading(true);
      const result = await findSubjectPair(sessionId.trim(), subjectId.trim());

      if (result) {
        setAssignment(result);
        // Load experiment data
        const exp = await getExperimentForSession(sessionId.trim());
        if (exp) {
          setExperiment(exp);
        }
      } else {
        setError('Subject not found in this session. Please check your IDs.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join session');
    } finally {
      setLoading(false);
    }
  }

  async function refreshPairState() {
    if (!sessionId || !subjectId) return;

    try {
      const result = await findSubjectPair(sessionId, subjectId);
      if (result) {
        setAssignment(result);
      }
    } catch (err) {
      console.error('Failed to refresh pair state:', err);
    }
  }

  // Set up polling to refresh pair state
  useEffect(() => {
    if (!assignment) return;

    const interval = setInterval(refreshPairState, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [assignment, sessionId, subjectId]);

  function handleDecisionMade() {
    // Immediately refresh state after decision
    refreshPairState();
  }

  // Determine which component to show based on role and phase
  function renderGameState() {
    if (!assignment || !experiment) return null;

    const { pair, role } = assignment;

    // Show results if completed
    if (pair.phase === 'completed') {
      return <ResultsDisplay pair={pair} role={role} experiment={experiment} />;
    }

    // Show investor interface if S1 and waiting for S1
    if (role === 's1' && pair.phase === 'waiting_s1') {
      return (
        <InvestorInterface
          sessionId={sessionId}
          pair={pair}
          subjectId={subjectId}
          experiment={experiment}
          onDecisionMade={handleDecisionMade}
        />
      );
    }

    // Show trustee interface if S2 and waiting for S2
    if (role === 's2' && pair.phase === 'waiting_s2') {
      return (
        <TrusteeInterface
          sessionId={sessionId}
          pair={pair}
          subjectId={subjectId}
          experiment={experiment}
          onDecisionMade={handleDecisionMade}
        />
      );
    }

    // Otherwise show waiting room
    return <WaitingRoom role={role} phase={pair.phase} />;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Subject Dashboard</h1>
        <p className="text-base-content/70 mt-2">
          Enter your session and subject IDs to participate in the experiment
        </p>
      </div>

      {!assignment ? (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <h2 className="card-title">Join Session</h2>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Session ID</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter session ID..."
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Subject ID</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                placeholder="Enter your subject ID..."
              />
            </div>

            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            <div className="card-actions justify-end mt-4">
              <button
                className="btn btn-primary"
                onClick={handleJoinSession}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Joining...
                  </>
                ) : (
                  'Join Session'
                )}
              </button>
            </div>
          </div>
        </div>
      ) : experiment ? (
        renderGameState()
      ) : (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <div className="flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}