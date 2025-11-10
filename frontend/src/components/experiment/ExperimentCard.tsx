import { useState, useEffect } from "react";
import type { Experiment } from "../../types/experiment";
import { getExperimentSessions } from "../../utils/sessionDB";

interface ExperimentCardProps {
  experiment: Experiment;
  onClick: () => void;
}

interface SessionStats {
  total: number;
  active: number;
  completed: number;
}

export default function ExperimentCard({
  experiment,
  onClick,
}: ExperimentCardProps) {
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    total: 0,
    active: 0,
    completed: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function loadSessionStats() {
      try {
        setLoadingStats(true);
        const sessions = await getExperimentSessions(experiment.id);

        const active = sessions.filter((s) => s.status === "active").length;
        const completed = sessions.filter(
          (s) => s.status === "completed"
        ).length;

        setSessionStats({
          total: sessions.length,
          active,
          completed,
        });
      } catch (error) {
        console.error("Failed to load session stats:", error);
      } finally {
        setLoadingStats(false);
      }
    }

    loadSessionStats();
  }, [experiment.id]);

  const statusColors = {
    draft: "badge-ghost",
    active: "badge-success",
    completed: "badge-info",
  };

  const typeLabels = {
    trust_game: "Trust Game",
    dictator_game: "Dictator Game",
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

        {/* <p className="text-sm text-base-content/70 line-clamp-2">
          {experiment.description || 'No description'}
        </p> */}

        <div className="divider my-2"></div>

        {/* Session Statistics */}
        {loadingStats ? (
          <div className="flex justify-center py-2">
            <span className="loading loading-spinner loading-xs"></span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="text-center">
              <div className="text-xs text-base-content/60">Total</div>
              <div className="text-lg font-semibold">{sessionStats.total}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-base-content/60">Active</div>
              <div className="text-lg font-semibold text-success">
                {sessionStats.active}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-base-content/60">Complete</div>
              <div className="text-lg font-semibold text-info">
                {sessionStats.completed}
              </div>
            </div>
          </div>
        )}

        <div className="divider my-2"></div>

        <div className="flex justify-between items-center text-sm">
          <span className="badge badge-outline">
            {typeLabels[experiment.type]}
          </span>
          <span className="text-base-content/60">{createdDate}</span>
        </div>
      </div>
    </div>
  );
}
