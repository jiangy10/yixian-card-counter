import { TrackingCard } from '../models/model';

export class TrackingCardManager {
  private static instance: TrackingCardManager;
  private cards: TrackingCard[] = [];
  private readonly STORAGE_KEY = 'tracking_cards';

  private constructor() {
    this.loadTrackingCards();
  }

  public static getInstance(): TrackingCardManager {
    if (!TrackingCardManager.instance) {
      TrackingCardManager.instance = new TrackingCardManager();
    }
    return TrackingCardManager.instance;
  }

  public async loadTrackingCards(): Promise<TrackingCard[]> {
    try {
      const storedCards = localStorage.getItem(this.STORAGE_KEY);
      if (storedCards) {
        this.cards = JSON.parse(storedCards);
      }
      return this.cards;
    } catch (error) {
      console.error('Error loading tracking cards:', error);
      return [];
    }
  }

  private async saveTrackingCards(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cards));
    } catch (error) {
      console.error('Error saving tracking cards:', error);
    }
  }

  public async addTrackingCard(cardId: string): Promise<TrackingCard> {
    const existingCard = this.cards.find(card => card.name === cardId);
    
    if (!existingCard) {
      const newCard: TrackingCard = {
        name: cardId,
        level: 1,
        phase: 1,
        type: 'unknown',
        category: 'unknown',
        recommend: false
      };
      this.cards.push(newCard);
      await this.saveTrackingCards();
    }
    
    return this.cards.find(card => card.name === cardId)!;
  }

  public async removeTrackingCard(cardId: string): Promise<void> {
    this.cards = this.cards.filter(card => card.name !== cardId);
    await this.saveTrackingCards();
  }

  public getTrackingCards(): TrackingCard[] {
    return [...this.cards];
  }
}