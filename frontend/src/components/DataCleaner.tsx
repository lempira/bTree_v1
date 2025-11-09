import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveAccount } from '../hooks/useActiveAccount';

export default function DataCleaner() {
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { clearActiveAccount } = useActiveAccount();
  const navigate = useNavigate();

  const clearActiveSession = useCallback(async () => {
    try {
      setClearing(true);
      clearActiveAccount();
      setMessage({ type: 'success', text: 'Active session cleared' });
      navigate('/');
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to clear session' });
    } finally {
      setClearing(false);
    }
  }, [clearActiveAccount, navigate]);

  const clearAllAccounts = useCallback(async () => {
    if (!confirm('Delete all user accounts? This cannot be undone.')) return;

    try {
      setClearing(true);
      // Delete the entire btree_accounts database
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase('btree_accounts');
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      clearActiveAccount();
      setMessage({ type: 'success', text: 'All accounts deleted' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete accounts' });
    } finally {
      setClearing(false);
    }
  }, [clearActiveAccount]);

  const clearExperimentData = useCallback(async () => {
    if (!confirm('Delete all experiment data (experiments, sessions, decisions, subjects)? This cannot be undone.')) return;

    try {
      setClearing(true);
      // Delete the entire btree_experiments database
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase('btree_experiments');
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      setMessage({ type: 'success', text: 'All experiment data deleted' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete experiment data' });
    } finally {
      setClearing(false);
    }
  }, []);

  const clearEverything = useCallback(async () => {
    if (!confirm('DELETE EVERYTHING? This will remove all accounts, experiments, sessions, and data. This cannot be undone.')) return;
    if (!confirm('Are you absolutely sure? This is permanent!')) return;

    try {
      setClearing(true);

      // Clear sessionStorage
      clearActiveAccount();

      // Delete both databases
      await Promise.all([
        new Promise<void>((resolve, reject) => {
          const request = indexedDB.deleteDatabase('btree_accounts');
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
        new Promise<void>((resolve, reject) => {
          const request = indexedDB.deleteDatabase('btree_experiments');
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
      ]);

      setMessage({ type: 'success', text: 'Everything deleted - complete reset' });
      navigate('/');
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to clear all data' });
    } finally {
      setClearing(false);
    }
  }, [clearActiveAccount, navigate]);

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <h2 className="card-title text-lg">Developer Tools</h2>
        <p className="text-sm text-base-content/70">
          Clear data for testing. Use with caution.
        </p>

        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mt-2`}>
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        <div className="card-actions flex-col items-stretch gap-2 mt-4">
          <button
            onClick={clearActiveSession}
            disabled={clearing}
            className="btn btn-sm btn-outline"
          >
            {clearing ? 'Clearing...' : 'Clear Active Session'}
          </button>

          <button
            onClick={clearAllAccounts}
            disabled={clearing}
            className="btn btn-sm btn-outline btn-warning"
          >
            {clearing ? 'Clearing...' : 'Clear All Accounts'}
          </button>

          <button
            onClick={clearExperimentData}
            disabled={clearing}
            className="btn btn-sm btn-outline btn-warning"
          >
            {clearing ? 'Clearing...' : 'Clear All Experiment Data'}
          </button>

          <button
            onClick={clearEverything}
            disabled={clearing}
            className="btn btn-sm btn-outline btn-error"
          >
            {clearing ? 'Clearing...' : 'Clear Everything (Nuclear)'}
          </button>
        </div>

        <div className="text-xs text-base-content/60 mt-2">
          <strong>Active Session:</strong> Logs out this tab<br />
          <strong>All Accounts:</strong> Deletes all user accounts<br />
          <strong>Experiment Data:</strong> Deletes experiments, sessions, decisions<br />
          <strong>Everything:</strong> Complete reset
        </div>
      </div>
    </div>
  );
}