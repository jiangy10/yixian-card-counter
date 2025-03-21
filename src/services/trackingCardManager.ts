import { TrackingCard } from '../models/model';
import { STORAGE } from '../constants';

export class TrackingCardManager {
  private static instance: TrackingCardManager;
  private trackingFilePath: string;

  private constructor() {
    // Check if in development environment
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      // Use project directory file in development
      this.trackingFilePath = STORAGE.DEV_TRACKING_FILE;
    } else {
      // Use user data directory in production
      const userDataPath = (window as any).electron.getUserDataPath();
      this.trackingFilePath = `${userDataPath}/${STORAGE.PROD_TRACKING_FILE}`;
    }
  }

  public static getInstance(): TrackingCardManager {
    if (!TrackingCardManager.instance) {
      TrackingCardManager.instance = new TrackingCardManager();
    }
    return TrackingCardManager.instance;
  }

  // Get storage file path
  public getStoragePath(): string {
    return this.trackingFilePath;
  }

  // Save tracking cards
  public async saveTrackingCards(cards: TrackingCard[]): Promise<void> {
    try {
      const data = JSON.stringify(cards, null, STORAGE.JSON_INDENT);
      await (window as any).electron.writeFile(this.trackingFilePath, data);
    } catch (error) {
      console.error('Failed to save tracking cards:', error);
      throw error;
    }
  }

  // Load tracking cards
  public async loadTrackingCards(): Promise<TrackingCard[]> {
    try {
      const data = await (window as any).electron.readFile(this.trackingFilePath);
      return JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // Return empty array if file doesn't exist
        return [];
      }
      console.error('Failed to load tracking cards:', error);
      throw error;
    }
  }

  // Add a tracking card
  public async addTrackingCard(cardId: string): Promise<TrackingCard> {
    const cards = await this.loadTrackingCards();
    const newCard: TrackingCard = {
      name: cardId,
      count: 1,
      lastSeen: new Date().toISOString()
    };
    cards.push(newCard);
    await this.saveTrackingCards(cards);
    return newCard;
  }

  // Remove a tracking card
  public async removeTrackingCard(cardName: string): Promise<void> {
    const cards = await this.loadTrackingCards();
    const updatedCards = cards.filter(card => card.name !== cardName);
    await this.saveTrackingCards(updatedCards);
  }

  // Update card count
  public async updateCardCount(cardName: string): Promise<void> {
    const cards = await this.loadTrackingCards();
    const updatedCards = cards.map(card => {
      if (card.name === cardName) {
        return {
          ...card,
          count: card.count + 1,
          lastSeen: new Date().toISOString()
        };
      }
      return card;
    });
    await this.saveTrackingCards(updatedCards);
  }
}