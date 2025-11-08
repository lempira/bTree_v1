import { useState } from 'react';
import type { ExperimentType } from '../../types/experiment';
import { GAME_TEMPLATES } from '../../templates';
import { createExperiment } from '../../utils/experimentDB';
import TemplateCard from './TemplateCard';
import TrustGameParameterConfig from './TrustGameParameterConfig';

interface CreateExperimentModalProps {
  experimenterId: string;
  onCreated?: (experimentId: string) => void;
}

export default function CreateExperimentModal({
  experimenterId,
  onCreated,
}: CreateExperimentModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ExperimentType>('trust_game');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parameters, setParameters] = useState(GAME_TEMPLATES.trust_game.template.parameters);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('Experiment name is required');
      return;
    }

    if (selectedTemplate === 'dictator_game') {
      setError('Dictator Game is not yet implemented');
      return;
    }

    try {
      setCreating(true);

      const experimentId = await createExperiment({
        createdBy: experimenterId,
        name: name.trim(),
        description: description.trim(),
        type: selectedTemplate,
        parameters,
        status: 'draft',
      });

      // Reset form
      setName('');
      setDescription('');
      setParameters(GAME_TEMPLATES.trust_game.template.parameters);

      onCreated?.(experimentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create experiment');
    } finally {
      setCreating(false);
    }
  }

  function handleTemplateChange(template: ExperimentType) {
    setSelectedTemplate(template);
    if (template === 'trust_game') {
      setParameters(GAME_TEMPLATES.trust_game.template.parameters);
    }
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">Create New Experiment</h2>

        {/* Step 1: Template Selection */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg mb-2">1. Select Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TemplateCard
                templateKey="trust_game"
                name={GAME_TEMPLATES.trust_game.metadata.name}
                shortDescription={GAME_TEMPLATES.trust_game.metadata.shortDescription}
                selected={selectedTemplate === 'trust_game'}
                onClick={() => handleTemplateChange('trust_game')}
              />
              <TemplateCard
                templateKey="dictator_game"
                name={GAME_TEMPLATES.dictator_game.metadata.name}
                shortDescription={GAME_TEMPLATES.dictator_game.metadata.shortDescription}
                selected={selectedTemplate === 'dictator_game'}
                onClick={() => handleTemplateChange('dictator_game')}
                disabled={true}
                badge="Coming Soon"
              />
            </div>
          </div>

          {/* Step 2: Basic Info */}
          <div className="divider"></div>
          <div>
            <h3 className="font-semibold text-lg mb-2">2. Experiment Details</h3>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Experiment Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Trust Game - Spring 2025"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Description (optional)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the purpose or variations of this experiment..."
                />
              </div>
            </div>
          </div>

          {/* Step 3: Parameters (Trust Game only) */}
          {selectedTemplate === 'trust_game' && (
            <>
              <div className="divider"></div>
              <div>
                <h3 className="font-semibold text-lg mb-2">3. Configure Parameters</h3>
                <TrustGameParameterConfig
                  parameters={parameters}
                  onChange={setParameters}
                />
              </div>
            </>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error mt-4">
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="card-actions justify-end mt-6">
          <button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={creating || !name.trim()}
          >
            {creating ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Creating...
              </>
            ) : (
              'Create Experiment'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}