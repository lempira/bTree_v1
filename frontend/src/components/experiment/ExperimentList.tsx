import type { Experiment } from '../../types/experiment';
import ExperimentCard from './ExperimentCard';

interface ExperimentListProps {
  experiments: Experiment[];
  onExperimentClick: (experimentId: string) => void;
}

export default function ExperimentList({ experiments, onExperimentClick }: ExperimentListProps) {
  if (experiments.length === 0) {
    return (
      <div className="text-center py-12 text-base-content/50">
        <p>No experiments yet. Create your first experiment to get started.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Experiments</h2>
        <span className="text-sm text-base-content/60">
          {experiments.length} experiment{experiments.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {experiments.map((experiment) => (
          <ExperimentCard
            key={experiment.id}
            experiment={experiment}
            onClick={() => onExperimentClick(experiment.id)}
          />
        ))}
      </div>
    </div>
  );
}