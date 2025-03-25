export interface UsedCard {
  name: string;
  level: number;
  phase: number;
}

export interface Player {
  player_username: string;
  destiny: number;
  destiny_diff: number;
  health: number;
  cultivation: number;
  opponent_username: string;
  used_card: UsedCard[];
  match_history: Record<number, MatchHistory>;
}

export interface RoundData {
  rounds: {
    [key: string]: {
      players: Player[];
    };
  };
}

export enum CardType {
  SECT = 'sect',
  SIDE = 'side job',
  FORT = 'fortune'
}

export enum CardRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export interface Card {
  name: string;
  level: number;
  phase: number;
  type: string;
  category: string;
}

export interface TrackingCard {
  name: string;
  level: number;
  phase: number;
  type: string;
  category: string;
}

export interface MatchHistory {
  cultivation: string;
  health: number;
  destiny: number;
  destiny_diff: number;
  opponent_username: string;
  used_card: Card[];
}

export interface GameState {
  cards: Card[];
  player: Player;
  trackingCards: TrackingCard[];
}

export interface PlayerSelectorProps {
  players: Player[];
  onPlayerSelect: (player: Player) => void;
}

export interface PlayerInfoContainerProps {
  player: Player;
}

export interface TrackingCardContainerProps {
  cards: Card[];
  trackingCards: TrackingCard[];
}

export interface ManageTrackingContainerProps {
  onManageClick: () => void;
}