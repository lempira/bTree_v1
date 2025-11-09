import { useState, useEffect } from 'react';
import type { Subject } from '../../types/experiment';
import { getAllAccounts } from '../../utils/indexdb';

interface SubjectInputProps {
  value: string[];
  onChange: (subjects: string[]) => void;
}

export default function SubjectInput({ value, onChange }: SubjectInputProps) {
  const [mode, setMode] = useState<'select' | 'manual'>('select');
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(value));

  // Load subjects from IndexedDB (accounts with userType === 'subject')
  useEffect(() => {
    async function loadSubjects() {
      try {
        const allAccounts = await getAllAccounts();
        // Filter accounts to only include subjects and map to Subject format
        const subjects: Subject[] = allAccounts
          .filter(acc => acc.userType === 'subject')
          .map(acc => ({
            id: acc.accountAddress,
            account: acc.accountAddress,
            alias: acc.displayName || acc.accountAddress,
            createdAt: acc.createdAt,
          }));
        setAvailableSubjects(subjects);
      } catch (error) {
        console.error('Failed to load subjects:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSubjects();
  }, []);

  // Handle checkbox toggle
  function handleToggle(subjectId: string) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(subjectId)) {
      newSelected.delete(subjectId);
    } else {
      newSelected.add(subjectId);
    }
    setSelectedIds(newSelected);
    onChange(Array.from(newSelected));
  }

  // Handle manual text entry
  const textValue = value.join('\n');
  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const lines = e.target.value.split('\n');
    const subjects = lines
      .map(line => line.trim())
      .filter(line => line.length > 0);
    onChange(subjects);
  }

  // Truncate account address for display
  function truncateAddress(address: string): string {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  const hasOddNumber = value.length > 0 && value.length % 2 !== 0;

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text font-medium">Select Subjects</span>
        <div className="flex gap-2 items-center">
          <span className="label-text-alt">
            {value.length} subject{value.length !== 1 ? 's' : ''} selected
            {hasOddNumber && ' (need even number)'}
          </span>
          <div className="btn-group btn-group-sm">
            <button
              type="button"
              className={`btn btn-xs ${mode === 'select' ? 'btn-active' : ''}`}
              onClick={() => setMode('select')}
            >
              Select
            </button>
            <button
              type="button"
              className={`btn btn-xs ${mode === 'manual' ? 'btn-active' : ''}`}
              onClick={() => setMode('manual')}
            >
              Manual
            </button>
          </div>
        </div>
      </label>

      {mode === 'select' ? (
        <div className="border border-base-300 rounded-lg p-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : availableSubjects.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              <p className="text-sm">No subjects registered yet.</p>
              <p className="text-xs mt-2">Switch to Manual mode to add subject IDs.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableSubjects.map((subject) => (
                <label
                  key={subject.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 cursor-pointer border border-transparent hover:border-base-300 transition-colors"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={selectedIds.has(subject.id)}
                    onChange={() => handleToggle(subject.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{subject.alias}</div>
                    <div className="text-xs text-base-content/60 font-mono">
                      {truncateAddress(subject.account)}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <textarea
            className={`textarea textarea-bordered h-48 font-mono text-sm ${
              hasOddNumber ? 'textarea-warning' : ''
            }`}
            placeholder="Enter subject IDs (Algorand addresses), one per line:&#10;ADDR1ABC...XYZ&#10;ADDR2DEF...UVW&#10;ADDR3GHI...RST&#10;ADDR4JKL...OPQ"
            value={textValue}
            onChange={handleTextChange}
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Each subject ID should be on its own line. You need an even number of subjects for pairing.
            </span>
          </label>
        </>
      )}

      {hasOddNumber && (
        <div className="alert alert-warning mt-2">
          <span className="text-sm">
            You have {value.length} subject{value.length !== 1 ? 's' : ''}.
            Add one more to create {Math.ceil(value.length / 2)} pair{Math.ceil(value.length / 2) !== 1 ? 's' : ''}.
          </span>
        </div>
      )}
    </div>
  );
}