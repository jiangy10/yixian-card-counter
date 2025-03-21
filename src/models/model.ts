// 卡牌使用记录
export interface UsedCard {
  name: string;
  level: number;
  phase: number;
}

// 玩家信息
export interface Player {
  player_username: string;
  destiny: number;
  destiny_diff: number;
  health: number;
  cultivation: number;
  opponent_username: string;
  used_card: UsedCard[];
}

// 回合数据
export interface RoundData {
  round: number;
  players: Player[];
}

// 卡牌类型枚举
export enum CardType {
  SECT = 'sect',
  SUBCLASS = 'subclass',
  OPPORTUNITY = 'opportunity'
}

// 卡牌稀有度枚举
export enum CardRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

// 卡牌信息
export interface Card {
  id: string;
  name: string;
  type: CardType;
  description: string;
  rarity: CardRarity;
  cost: number;
}

// 追踪卡牌记录
export interface TrackingCard {
  cardId: string;
  count: number;
  lastSeen: string;
}

// 游戏状态
export interface GameState {
  cards: Card[];
  player: Player;
  trackingCards: TrackingCard[];
}

// 玩家选择器Props类型
export interface PlayerSelectorProps {
  players: Player[];
  onPlayerSelect: (player: Player) => void;
}

// 玩家信息容器Props类型
export interface PlayerInfoContainerProps {
  player?: Player;
}

// 追踪卡牌容器Props类型
export interface TrackingCardContainerProps {
  cards: Card[];
  trackingCards: TrackingCard[];
  onCardTrack: (cardId: string) => void;
  onCardUntrack: (cardId: string) => void;
}

// 管理追踪容器Props类型
export interface ManageTrackingContainerProps {
  onManageClick: () => void;
} 