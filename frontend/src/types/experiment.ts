// Experiment types for bTree frontend-only implementation

export type ExperimentType = 'trust_game' | 'dictator_game';
export type ExperimentStatus = 'draft' | 'active' | 'completed';

export interface Experiment {
  id: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;

  name: string;
  type: ExperimentType;
  description: string;

  parameters: {
    E1: number;      // S1 endowment (microAlgos)
    E2: number;      // S2 endowment (microAlgos)
    m: number;       // multiplier
    UNIT: number;    // step size (microAlgos)
  };

  status: ExperimentStatus;
}

export type SessionStatus = 'draft' | 'active' | 'completed';
export type PairPhase = 'waiting_s1' | 'waiting_s2' | 'completed';

export interface SessionPair {
  pairId: string;
  s1_id: string;
  s2_id: string;
  phase: PairPhase;

  // Decisions
  s_invested: number | null;
  r_returned: number | null;

  // Outcomes
  s1_payout: number | null;
  s2_payout: number | null;

  completedAt: number | null;
}

export interface Session {
  id: string;
  experimentId: string;
  createdBy: string;
  createdAt: number;

  name: string;
  status: SessionStatus;

  pairs: SessionPair[];
}

export type SubjectRole = 's1' | 's2';

export interface Subject {
  id: string;              // Algorand account address (used as primary key)
  account: string;         // Algorand account address (same as id)
  alias: string;           // Human-readable name/alias for the subject
  createdAt: number;       // Timestamp when subject was registered
  lastParticipated?: number; // Optional: timestamp of last session participation
}

export interface Decision {
  id: string;
  sessionId: string;
  pairId: string;
  subjectId: string;
  role: SubjectRole;
  decision: number;
  timestamp: number;
}