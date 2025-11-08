import { useState } from 'react';
import type { Experiment } from '../../types/experiment';
import { createSession } from '../../utils/sessionDB';
import SubjectInput from './SubjectInput';
import PairPreview from './PairPreview';

interface SessionCreatorProps {
  experiment: Experiment;
  experimenterId: string;
  onCreated?: (sessionId: string) => void;
}

export default function SessionCreator({
  experiment,
  experimenterId,
  onCreated,
}: SessionCreatorProps) {
  const [sessionName, setSessionName] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setError(null);

    // Validation
    if (!sessionName.trim()) {
      setError('Session name is required');
      return;
    }

    if (subjects.length === 0) {
      setError('Add at least 2 subjects');
      return;
    }

    if (subjects.length % 2 !== 0) {
      setError('Need an even number of subjects to create pairs');
      return;
    }

    try {
      setCreating(true);

      // Create pairs from subjects
      const numPairs = subjects.length / 2;
      const pairs = [];

      for (let i = 0; i < numPairs; i++) {
        pairs.push({
          pairId: crypto.randomUUID(),
          s1_id: subjects[i * 2],
          s2_id: subjects[i * 2 + 1],
          phase: 'waiting_s1' as const,
          s_invested: null,
          r_returned: null,
          s1_payout: null,
          s2_payout: null,
          completedAt: null,
        });
      }

      // Create session in IndexedDB
      const sessionId = await createSession({
        experimentId: experiment.id,
        createdBy: experimenterId,
        name: sessionName.trim(),
        status: 'active',
        pairs,
      });

      // Reset form
      setSessionName('');
      setSubjects([]);

      onCreated?.(sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setCreating(false);
    }
  }

  const canCreate = sessionName.trim() && subjects.length > 0 && subjects.length % 2 === 0;

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <h2 className="card-title">Create New Session</h2>
        <p className="text-sm text-base-content/70">
          Set up a session for {experiment.name}
        </p>

        <div className="divider"></div>

        {/* Session Name */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Session Name</span>
          </label>
          <input
            type="text"
            className="input input-bordered"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="e.g., Session 1 - Monday cohort"
          />
        </div>

        {/* Subject Input */}
        <SubjectInput value={subjects} onChange={setSubjects} />

        {/* Pair Preview */}
        {subjects.length > 0 && (
          <>
            <div className="divider"></div>
            <PairPreview subjects={subjects} />
          </>
        )}

        {/* Error Display */}
        {error && (
          <div className="alert alert-error mt-4">
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="card-actions justify-end mt-4">
          <button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={creating || !canCreate}
          >
            {creating ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Creating Session...
              </>
            ) : (
              `Create Session with ${subjects.length / 2} Pair${subjects.length / 2 !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}