import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveAccount } from '../hooks/useActiveAccount';
import { clearDBInstance } from '../utils/db';

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
      console.log('[DataCleaner] Starting experiment data deletion');

      // Clear the cached database instance first
      clearDBInstance();

      // Delete the entire btree_experiments database
      await new Promise<void>((resolve, reject) => {
        console.log('[DataCleaner] Requesting database deletion');
        const request = indexedDB.deleteDatabase('btree_experiments');

        request.onsuccess = () => {
          console.log('[DataCleaner] Database deleted successfully');
          resolve();
        };

        request.onerror = () => {
          console.error('[DataCleaner] Database deletion failed:', request.error);
          reject(request.error);
        };

        request.onblocked = () => {
          console.warn('[DataCleaner] Database deletion blocked - close other tabs using this app');
          resolve(); // Resolve anyway to show message
        };
      });

      setMessage({ type: 'success', text: 'All experiment data deleted - reloading in 2s...' });
      console.log('[DataCleaner] Waiting 2 seconds before reload to ensure deletion completes');
      // Reload page to reinitialize everything - wait longer to ensure deletion completes
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.error('[DataCleaner] Error during deletion:', err);
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
      console.log('[DataCleaner] Starting complete data deletion');

      // Clear sessionStorage
      clearActiveAccount();

      // Clear the cached database instance
      clearDBInstance();

      // Wait a moment for any pending transactions to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('[DataCleaner] Deleting databases...');

      // Delete both databases with timeout
      const deleteWithTimeout = (dbName: string, timeoutMs = 5000) => {
        return Promise.race([
          new Promise<void>((resolve, reject) => {
            console.log(`[DataCleaner] Requesting deletion of ${dbName}`);
            const request = indexedDB.deleteDatabase(dbName);

            request.onsuccess = () => {
              console.log(`[DataCleaner] ${dbName} deleted successfully`);
              resolve();
            };

            request.onerror = () => {
              console.error(`[DataCleaner] ${dbName} deletion error:`, request.error);
              reject(request.error);
            };

            request.onblocked = () => {
              console.warn(`[DataCleaner] ${dbName} deletion blocked - resolving anyway`);
              resolve();
            };
          }),
          new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error(`${dbName} deletion timed out after ${timeoutMs}ms`)), timeoutMs)
          )
        ]);
      };

      await Promise.all([
        deleteWithTimeout('btree_accounts'),
        deleteWithTimeout('btree_experiments')
      ]);

      console.log('[DataCleaner] All databases deleted, reloading page');
      setMessage({ type: 'success', text: 'Everything deleted - complete reset' });
      // Reload to clean state
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error('[DataCleaner] Deletion failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to clear all data';
      setMessage({ type: 'error', text: errorMsg });
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