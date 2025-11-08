// Game templates index

import { TRUST_GAME_TEMPLATE, TRUST_GAME_METADATA } from './trustGameTemplate';
import { DICTATOR_GAME_TEMPLATE, DICTATOR_GAME_METADATA } from './dictatorGameTemplate';

export const GAME_TEMPLATES = {
  trust_game: {
    template: TRUST_GAME_TEMPLATE,
    metadata: TRUST_GAME_METADATA,
  },
  dictator_game: {
    template: DICTATOR_GAME_TEMPLATE,
    metadata: DICTATOR_GAME_METADATA,
  },
} as const;

export type GameTemplateType = keyof typeof GAME_TEMPLATES;