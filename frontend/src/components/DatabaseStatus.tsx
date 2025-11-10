import { useState, useEffect } from 'react';
import { getAllAccounts } from '../utils/indexdb';
import { getAllSessions } from '../utils/sessionDB';
import { executeReadArrayTransaction, STORES } from '../utils/db';
import type { Experiment, Decision } from '../types/experiment';

interface DBStats {
  accounts: {
    total: number;
    experimenters: number;
    subjects: number;
  };
  experiments: {
    total: number;
    active: number;
    completed: number;
  };
  sessions: {
    total: number;
    active: number;
    completed: number;
  };
  decisions: {
    total: number;
    investor: number;
    trustee: number;
  };
}

export default function DatabaseStatus() {
  const [stats, setStats] = useState<DBStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [accounts, sessions, experiments, decisions] = await Promise.all([
          getAllAccounts(),
          getAllSessions(),
          executeReadArrayTransaction<Experiment>(
            STORES.EXPERIMENTS,
            (store) => store.getAll()
          ),
          executeReadArrayTransaction<Decision>(
            STORES.DECISIONS,
            (store) => store.getAll()
          ),
        ]);

        // Calculate account stats
        const experimenters = accounts.filter(a => a.userType === 'experimenter').length;
        const subjects = accounts.filter(a => a.userType === 'subject').length;

        // Calculate experiment stats
        const activeExperiments = experiments.filter(e => e.status === 'active').length;
        const completedExperiments = experiments.filter(e => e.status === 'completed').length;

        // Calculate session stats
        const activeSessions = sessions.filter(s => s.status === 'active').length;
        const completedSessions = sessions.filter(s => s.status === 'completed').length;

        // Calculate decision stats
        const investorDecisions = decisions.filter(d => d.role === 's1').length;
        const trusteeDecisions = decisions.filter(d => d.role === 's2').length;

        setStats({
          accounts: {
            total: accounts.length,
            experimenters,
            subjects,
          },
          experiments: {
            total: experiments.length,
            active: activeExperiments,
            completed: completedExperiments,
          },
          sessions: {
            total: sessions.length,
            active: activeSessions,
            completed: completedSessions,
          },
          decisions: {
            total: decisions.length,
            investor: investorDecisions,
            trustee: trusteeDecisions,
          },
        });
      } catch (err) {
        console.error('Failed to load database stats:', err);
        setError('Failed to load database statistics');
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h2 className="card-title text-lg">Database Status</h2>
          <div className="flex items-center justify-center py-8">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h2 className="card-title text-lg">Database Status</h2>
          <div className="alert alert-warning">
            <span className="text-sm">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <h2 className="card-title text-lg">Database Status</h2>
        <p className="text-sm text-base-content/70">
          High-level overview of data stored in IndexedDB
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* User Accounts */}
          <div className="stats shadow">
            <div className="stat p-4">
              <div className="stat-title text-xs">User Accounts</div>
              <div className="stat-value text-2xl">{stats.accounts.total}</div>
              <div className="stat-desc text-xs mt-1">
                <div>{stats.accounts.experimenters} experimenters</div>
                <div>{stats.accounts.subjects} subjects</div>
              </div>
            </div>
          </div>

          {/* Experiments */}
          <div className="stats shadow">
            <div className="stat p-4">
              <div className="stat-title text-xs">Experiments</div>
              <div className="stat-value text-2xl">{stats.experiments.total}</div>
              <div className="stat-desc text-xs mt-1">
                <div>{stats.experiments.active} active</div>
                <div>{stats.experiments.completed} completed</div>
              </div>
            </div>
          </div>

          {/* Sessions */}
          <div className="stats shadow">
            <div className="stat p-4">
              <div className="stat-title text-xs">Sessions</div>
              <div className="stat-value text-2xl">{stats.sessions.total}</div>
              <div className="stat-desc text-xs mt-1">
                <div>{stats.sessions.active} active</div>
                <div>{stats.sessions.completed} completed</div>
              </div>
            </div>
          </div>

          {/* Decisions */}
          <div className="stats shadow">
            <div className="stat p-4">
              <div className="stat-title text-xs">Decisions</div>
              <div className="stat-value text-2xl">{stats.decisions.total}</div>
              <div className="stat-desc text-xs mt-1">
                <div>{stats.decisions.investor} investor</div>
                <div>{stats.decisions.trustee} trustee</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}