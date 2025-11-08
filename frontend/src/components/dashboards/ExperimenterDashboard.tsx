import { useState, useEffect } from 'react';
import type { Experiment } from '../../types/experiment';
import { getExperimenterExperiments } from '../../utils/experimentDB';

type TabType = 'experiments' | 'create';

export default function ExperimenterDashboard(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>('experiments');
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [experimenterId] = useState('experimenter-1'); // TODO: Replace with actual user ID

  useEffect(() => {
    loadExperiments();
  }, [experimenterId]);

  async function loadExperiments() {
    try {
      setLoading(true);
      const exps = await getExperimenterExperiments(experimenterId);
      setExperiments(exps);
    } catch (error) {
      console.error('Failed to load experiments:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Experimenter Dashboard</h1>
        <p className="text-base-content/70 mt-2">
          Create and manage behavioral economics experiments
        </p>
      </div>

      {/* Tabs */}
      <div role="tablist" className="tabs tabs-boxed mb-6">
        <a
          role="tab"
          className={`tab ${activeTab === 'experiments' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('experiments')}
        >
          My Experiments
        </a>
        <a
          role="tab"
          className={`tab ${activeTab === 'create' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create New
        </a>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'experiments' && (
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              <div className="text-center py-12 text-base-content/50">
                {experiments.length === 0 ? (
                  <p>No experiments yet. Create your first experiment to get started.</p>
                ) : (
                  <p>Experiment list will appear here</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="text-center py-12 text-base-content/50">
            <p>Create experiment form will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}