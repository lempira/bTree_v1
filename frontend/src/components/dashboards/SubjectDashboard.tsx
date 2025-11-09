import { useState, useEffect } from 'react';
import type { SessionPair, Experiment, Session } from '../../types/experiment';
import { findSubjectPair, findSessionsForSubject } from '../../utils/sessionDB';
import { getExperimentForSession } from '../../utils/experimentDB';
import InvestorInterface from '../subject/InvestorInterface';
import TrusteeInterface from '../subject/TrusteeInterface';
import WaitingRoom from '../subject/WaitingRoom';
import ResultsDisplay from '../subject/ResultsDisplay';
import { useWallet } from '@txnlab/use-wallet';

const POLL_INTERVAL = 3000; // 3 seconds

export default function SubjectDashboard(): JSX.Element {
  const { activeAddress } = useWallet();
  const [sessionId, setSessionId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<{
    pair: SessionPair;
    role: 's1' | 's2';
  } | null>(null);
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [availableSessions, setAvailableSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Load sessions assigned to the logged-in subject
  useEffect(() => {
    async function loadMySessions() {
      if (!activeAddress) {
        setLoadingSessions(false);
        return;
      }

      try {
        const sessions = await findSessionsForSubject(activeAddress);
        setAvailableSessions(sessions);
      } catch (err) {
        console.error('Failed to load sessions:', err);
        setError('Failed to load your sessions');
      } finally {
        setLoadingSessions(false);
      }
    }

    loadMySessions();
  }, [activeAddress]);

  async function handleJoinSession(selectedSessionId?: string, selectedSubjectId?: string) {
    setError(null);

    const finalSessionId = selectedSessionId || sessionId.trim();
    const finalSubjectId = selectedSubjectId || subjectId.trim();

    if (!finalSessionId || !finalSubjectId) {
      setError('Please enter both Session ID and Subject ID');
      return;
    }

    try {
      setLoading(true);
      const result = await findSubjectPair(finalSessionId, finalSubjectId);

      if (result) {
        setSessionId(finalSessionId);
        setSubjectId(finalSubjectId);
        setAssignment(result);
        // Load experiment data
        const exp = await getExperimentForSession(finalSessionId);
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

  function truncateId(id: string): string {
    if (id.length <= 12) return id;
    return `${id.slice(0, 8)}...${id.slice(-4)}`;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Subject Dashboard</h1>
        <p className="text-base-content/70 mt-2">
          {!activeAddress
            ? 'Please sign in to view your assigned sessions'
            : assignment
            ? 'Participating in session'
            : 'Select a session to join'}
        </p>
      </div>

      {!assignment ? (
        <>
          {!activeAddress ? (
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body">
                <p className="text-center text-base-content/70">
                  Please sign in to view your assigned sessions
                </p>
              </div>
            </div>
          ) : loadingSessions ? (
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body">
                <div className="flex justify-center items-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              </div>
            </div>
          ) : availableSessions.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Your Sessions</h2>
              {availableSessions.map((session) => (
                <div
                  key={session.id}
                  className="card bg-base-100 border border-base-300 hover:border-primary transition-colors"
                >
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="card-title text-lg">{session.name}</h3>
                        <p className="text-sm text-base-content/60 mt-1">
                          Session ID: {truncateId(session.id)}
                        </p>
                        <p className="text-sm text-base-content/60">
                          Status: <span className="badge badge-sm">{session.status}</span>
                        </p>
                        <p className="text-sm text-base-content/60">
                          Pairs: {session.pairs.length}
                        </p>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleJoinSession(session.id, activeAddress!)}
                        disabled={loading || session.status === 'completed'}
                      >
                        {loading ? (
                          <>
                            <span className="loading loading-spinner loading-xs"></span>
                            Joining...
                          </>
                        ) : (
                          'Join'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body">
                <p className="text-center text-base-content/70">
                  No sessions assigned yet. Please wait for an experimenter to add you to a session.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-error mt-4">
              <span>{error}</span>
            </div>
          )}
        </>
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