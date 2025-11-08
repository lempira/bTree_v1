import type { Experiment } from '../../types/experiment';

interface ExperimentCardProps {
  experiment: Experiment;
  onClick: () => void;
}

export default function ExperimentCard({ experiment, onClick }: ExperimentCardProps) {
  const statusColors = {
    draft: 'badge-ghost',
    active: 'badge-success',
    completed: 'badge-info',
  };

  const typeLabels = {
    trust_game: 'Trust Game',
    dictator_game: 'Dictator Game',
  };

  const createdDate = new Date(experiment.createdAt).toLocaleDateString();

  return (
    <div
      className="card bg-base-100 border border-base-300 hover:border-primary cursor-pointer transition-all hover:shadow-lg"
      onClick={onClick}
    >
      <div className="card-body">
        <div className="flex justify-between items-start mb-2">
          <h3 className="card-title text-lg">{experiment.name}</h3>
          <span className={`badge ${statusColors[experiment.status]}`}>
            {experiment.status}
          </span>
        </div>

        <p className="text-sm text-base-content/70 line-clamp-2">
          {experiment.description || 'No description'}
        </p>

        <div className="divider my-2"></div>

        <div className="flex justify-between items-center text-sm">
          <span className="badge badge-outline">{typeLabels[experiment.type]}</span>
          <span className="text-base-content/60">{createdDate}</span>
        </div>
      </div>
    </div>
  );
}