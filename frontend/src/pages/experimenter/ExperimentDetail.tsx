import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Experiment, Session } from '../../types/experiment';
import { getExperiment } from '../../utils/experimentDB';
import { getExperimentSessions } from '../../utils/sessionDB';
import SessionCreator from '../../components/session/SessionCreator';
import SessionTable from '../../components/session/SessionTable';

export default function ExperimentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [experimenterId] = useState('experimenter-1'); // TODO: Replace with actual user ID

  useEffect(() => {
    loadExperiment();
  }, [id]);

  async function loadExperiment() {
    if (!id) {
      setError('No experiment ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const exp = await getExperiment(id);
      if (exp) {
        setExperiment(exp);
        // Load sessions for this experiment
        const sessionList = await getExperimentSessions(id);
        setSessions(sessionList);
      } else {
        setError('Experiment not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load experiment');
    } finally {
      setLoading(false);
    }
  }

  async function handleSessionCreated(sessionId: string) {
    console.log('Session created:', sessionId);
    // Reload sessions
    if (id) {
      const sessionList = await getExperimentSessions(id);
      setSessions(sessionList);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (error || !experiment) {
    return (
      <div className="container mx-auto p-4">
        <div className="alert alert-error">
          <span>{error || 'Experiment not found'}</span>
        </div>
        <button className="btn btn-ghost mt-4" onClick={() => navigate('/dashboard/experimenter')}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <button className="btn btn-ghost btn-sm mb-4" onClick={() => navigate('/dashboard/experimenter')}>
          ← Back to Dashboard
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{experiment.name}</h1>
            <p className="text-base-content/70 mt-2">{experiment.description || 'No description'}</p>
          </div>
          <span className={`badge ${experiment.status === 'active' ? 'badge-success' : 'badge-ghost'} badge-lg`}>
            {experiment.status}
          </span>
        </div>
      </div>

      {/* Experiment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <h2 className="card-title">Experiment Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Type:</span>
                <span>{experiment.type === 'trust_game' ? 'Trust Game' : 'Dictator Game'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Created:</span>
                <span>{new Date(experiment.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Last Updated:</span>
                <span>{new Date(experiment.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <h2 className="card-title">Parameters</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">S1 Endowment (E1):</span>
                <span>{experiment.parameters.E1.toLocaleString()} µALGO</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">S2 Endowment (E2):</span>
                <span>{experiment.parameters.E2.toLocaleString()} µALGO</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Multiplier (m):</span>
                <span>{experiment.parameters.m}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Step Size (UNIT):</span>
                <span>{experiment.parameters.UNIT.toLocaleString()} µALGO</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Sessions</h2>

        {/* Create New Session */}
        <SessionCreator
          experiment={experiment}
          experimenterId={experimenterId}
          onCreated={handleSessionCreated}
        />

        {/* Existing Sessions */}
        {sessions.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Existing Sessions</h3>
            <SessionTable sessions={sessions} />
          </div>
        )}
      </div>
    </div>
  );
}