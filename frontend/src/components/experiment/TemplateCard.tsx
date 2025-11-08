import type { GameTemplateType } from '../../templates';

interface TemplateCardProps {
  templateKey: GameTemplateType;
  name: string;
  shortDescription: string;
  selected: boolean;
  disabled?: boolean;
  badge?: string;
  onClick: () => void;
}

export default function TemplateCard({
  name,
  shortDescription,
  selected,
  disabled = false,
  badge,
  onClick,
}: TemplateCardProps) {
  return (
    <div
      className={`card bg-base-100 border-2 cursor-pointer transition-all ${
        selected ? 'border-primary shadow-lg' : 'border-base-300 hover:border-base-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !disabled && onClick()}
    >
      <div className="card-body">
        <div className="flex justify-between items-start">
          <h3 className="card-title text-lg">{name}</h3>
          {badge && (
            <span className="badge badge-warning badge-sm">{badge}</span>
          )}
        </div>
        <p className="text-sm text-base-content/70">{shortDescription}</p>
        {selected && (
          <div className="mt-2">
            <span className="badge badge-primary">Selected</span>
          </div>
        )}
      </div>
    </div>
  );
}