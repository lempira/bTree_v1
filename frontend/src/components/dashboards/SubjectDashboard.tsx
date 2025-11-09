import { useState } from 'react';
import type { SessionPair } from '../../types/experiment';
import { findSubjectPair } from '../../utils/sessionDB';

export default function SubjectDashboard(): JSX.Element {
  const [sessionId, setSessionId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<{
    pair: SessionPair;
    role: 's1' | 's2';
  } | null>(null);

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
      } else {
        setError('Subject not found in this session. Please check your IDs.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join session');
    } finally {
      setLoading(false);
    }
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
      ) : (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <h2 className="card-title">Session Joined</h2>

            <div className="space-y-4">
              <div className="alert alert-success">
                <span>Successfully joined the session!</span>
              </div>

              <div className="stats stats-vertical lg:stats-horizontal shadow">
                <div className="stat">
                  <div className="stat-title">Your Role</div>
                  <div className="stat-value text-primary">
                    {assignment.role === 's1' ? 'Investor (S1)' : 'Trustee (S2)'}
                  </div>
                  <div className="stat-desc">
                    {assignment.role === 's1'
                      ? 'You will make the first decision'
                      : 'You will respond to the investor'}
                  </div>
                </div>

                <div className="stat">
                  <div className="stat-title">Current Phase</div>
                  <div className="stat-value text-sm">
                    {assignment.pair.phase === 'waiting_s1' && 'Waiting for Investor'}
                    {assignment.pair.phase === 'waiting_s2' && 'Waiting for Trustee'}
                    {assignment.pair.phase === 'completed' && 'Completed'}
                  </div>
                  <div className="stat-desc">
                    {assignment.pair.phase === 'completed'
                      ? 'Experiment round finished'
                      : 'Waiting for decisions...'}
                  </div>
                </div>
              </div>

              <div className="text-sm text-base-content/70">
                <p>Session ID: <code className="font-mono text-xs">{sessionId}</code></p>
                <p>Subject ID: <code className="font-mono text-xs">{subjectId}</code></p>
                <p>Pair ID: <code className="font-mono text-xs">{assignment.pair.pairId}</code></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}