import { TrackingCard } from '../models/model';

const TRACKING_FILE = 'tracking_cards.json';

export class TrackingCardManager {
  private static instance: TrackingCardManager;
  private trackingFilePath: string;

  private constructor() {
    // 在用户数据目录下创建存储文件
    const userDataPath = (window as any).electron.getUserDataPath();
    this.trackingFilePath = `${userDataPath}/${TRACKING_FILE}`;
  }

  public static getInstance(): TrackingCardManager {
    if (!TrackingCardManager.instance) {
      TrackingCardManager.instance = new TrackingCardManager();
    }
    return TrackingCardManager.instance;
  }

  // 获取存储文件路径
  public getStoragePath(): string {
    return this.trackingFilePath;
  }

  // 保存追踪卡牌
  public async saveTrackingCards(cards: TrackingCard[]): Promise<void> {
    try {
      const data = JSON.stringify(cards, null, 2);
      await (window as any).electron.writeFile(this.trackingFilePath, data);
    } catch (error) {
      console.error('保存追踪卡牌失败:', error);
      throw error;
    }
  }

  // 读取追踪卡牌
  public async loadTrackingCards(): Promise<TrackingCard[]> {
    try {
      const data = await (window as any).electron.readFile(this.trackingFilePath);
      return JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // 文件不存在，返回空数组
        return [];
      }
      console.error('读取追踪卡牌失败:', error);
      throw error;
    }
  }

  // 添加追踪卡牌
  public async addTrackingCard(cardId: string): Promise<TrackingCard> {
    const cards = await this.loadTrackingCards();
    const newCard: TrackingCard = {
      cardId,
      count: 1,
      lastSeen: new Date().toISOString()
    };
    cards.push(newCard);
    await this.saveTrackingCards(cards);
    return newCard;
  }

  // 移除追踪卡牌
  public async removeTrackingCard(cardId: string): Promise<void> {
    const cards = await this.loadTrackingCards();
    const newCards = cards.filter(card => card.cardId !== cardId);
    await this.saveTrackingCards(newCards);
  }

  // 更新追踪卡牌计数
  public async updateCardCount(cardId: string, count: number): Promise<void> {
    const cards = await this.loadTrackingCards();
    const cardIndex = cards.findIndex(card => card.cardId === cardId);
    if (cardIndex !== -1) {
      cards[cardIndex].count = count;
      cards[cardIndex].lastSeen = new Date().toISOString();
      await this.saveTrackingCards(cards);
    }
  }
} 