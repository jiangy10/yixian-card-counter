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
}

export interface RoundData {
  round: number;
  players: Player[];
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
  type: CardType;
  phase: number;
}

export interface TrackingCard {
  name: string;
  count: number;
  lastSeen: string;
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
  player?: Player;
}

export interface TrackingCardContainerProps {
  cards: Card[];
  trackingCards: TrackingCard[];
  onCardTrack: (cardName: string) => void;
  onCardUntrack: (cardName: string) => void;
}

export interface ManageTrackingContainerProps {
  onManageClick: () => void;
}