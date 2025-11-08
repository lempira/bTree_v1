// Trust Game template definition

import type { Experiment } from '../types/experiment';

export const TRUST_GAME_TEMPLATE: Omit<Experiment, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'name' | 'description' | 'status'> = {
  type: 'trust_game',
  parameters: {
    E1: 100_000,      // 0.1 ALGO (investor endowment)
    E2: 100_000,      // 0.1 ALGO (trustee endowment)
    m: 3,             // triple the investment
    UNIT: 1_000,      // 0.001 ALGO step size
  },
};

export const TRUST_GAME_METADATA = {
  name: 'Trust Game',
  shortDescription: 'Two-player sequential game testing trust and reciprocity',
  fullDescription: `
    Player A (Investor) receives an endowment and decides how much to send to Player B.
    The amount sent is multiplied by 3x.
    Player B (Trustee) then decides how much to return to Player A.

    This classic experiment tests trust (how much A sends) and reciprocity (how much B returns).
  `,
  roles: [
    'Investor (Player A / S1)',
    'Trustee (Player B / S2)',
  ],
  phases: [
    'Waiting for S1 - Investor makes decision',
    'Waiting for S2 - Trustee makes decision',
    'Completed - Results available',
  ],
};