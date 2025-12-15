import React, { useState, useMemo, useEffect } from 'react';
import './FloatingMatch.css';
import { Card as CardType, Player, RoundData } from '../models/model';
import Card, { TrackButton, RecommendLabel } from './Card';
import { useTracking } from '../contexts/TrackingContext';
import cardLibData from '../data/card_lib.json';
import specialCardLibData from '../data/special_card_lib.json';

const FloatingMatch: React.FC = () => {
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const { trackingCards } = useTracking();

  // Load game data
  useEffect(() => {
    const loadBattleLog = async () => {
      try {
        if (!window.electron) return;
        
        const gamePath = await window.electron.getUserDataPath();
        const battleLogPath = `${gamePath}/ConvertedBattleLog.json`;
        const battleLogContent = await window.electron.readFile(battleLogPath);
        const data = JSON.parse(battleLogContent);
        
        if (data.status === 'waiting') {
          setRoundData(null);
          setSelectedPlayer(null);
          return;
        }
        
        setRoundData(data);
        
        // Auto-select the first player
        const latestRound = Math.max(...Object.keys(data.rounds).map(Number));
        if (data.rounds[latestRound]?.players?.length > 0) {
          setSelectedPlayer(data.rounds[latestRound].players[0]);
        }
      } catch (error) {
        console.error('Error loading battle log:', error);
      }
    };

    loadBattleLog();
    
    if (window.electron?.onBattleLogUpdated) {
      const removeListener = window.electron.onBattleLogUpdated(() => {
        loadBattleLog();
      });
      return removeListener;
    }
  }, []);

  // Load all cards from card_lib.json and special_card_lib.json
  const allCards = useMemo(() => {
    const cards: CardType[] = [];
    
    const processCardLibrary = (libData: Record<string, any>) => {
      Object.entries(libData).forEach(([name, card]) => {
        cards.push({
          ...card,
          name,
          level: -1,
          isTracking_match: false
        });
      });
    };

    processCardLibrary(cardLibData);
    processCardLibrary(specialCardLibData);
    
    return cards;
  }, []);

  // Get a set of card names used by the selected player in all rounds
  const playerUsedCardNames = useMemo(() => {
    if (!roundData || !selectedPlayer) return new Set<string>();
    
    const usedNames = new Set<string>();
    
    Object.values(roundData.rounds).forEach(round => {
      const player = round.players.find(p => p.player_username === selectedPlayer.player_username);
      if (player) {
        player.used_card.forEach(card => {
          usedNames.add(card.name);
        });
      }
    });
    
    return usedNames;
  }, [roundData, selectedPlayer]);

  // Filter tracked cards that were also used by the selected player
  const trackingFilteredCards = useMemo(() => {
    // First, filter the cards currently being tracked
    const tracking = allCards.filter(card => trackingCards[card.name]);
    
    // If a player is selected, filter the tracked cards that player has used
    const filteredByPlayer = selectedPlayer 
      ? tracking.filter(card => playerUsedCardNames.has(card.name))
      : tracking;
    
    // De-duplicate, keep the card with the highest level
    const cardGroups = filteredByPlayer.reduce<Record<string, CardType>>((groups, card) => {
      if (!groups[card.name] || groups[card.name].level < card.level) {
        groups[card.name] = card;
      }
      return groups;
    }, {});

    return Object.values(cardGroups);
  }, [allCards, trackingCards, selectedPlayer, playerUsedCardNames]);

  // Get the list of all players
  const allPlayers = useMemo(() => {
    if (!roundData) return [];
    const latestRound = Math.max(...Object.keys(roundData.rounds).map(Number));
    return roundData.rounds[latestRound]?.players || [];
  }, [roundData]);

  const handlePlayerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const playerUsername = event.target.value;
    const player = allPlayers.find(p => p.player_username === playerUsername);
    if (player) {
      setSelectedPlayer(player);
    }
  };

  return (
    <div className="floating-match-container">
      
      <div className="player-selector-wrapper">
        <select 
          className="player-dropdown"
          value={selectedPlayer?.player_username || ''}
          onChange={handlePlayerChange}
          disabled={allPlayers.length === 0}
        >
          {allPlayers.length === 0 ? (
            <option value="">等待对战数据...</option>
          ) : (
            allPlayers.map(player => (
              <option key={player.player_username} value={player.player_username}>
                {player.player_username}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="list-container">
        <div className="floating-card-scroll-view">
          {trackingFilteredCards.length === 0 ? (
            <div className="no-cards-message">暂无追踪的卡牌</div>
          ) : (
            trackingFilteredCards.map(card => (
              <Card
                key={card.name}
                card={card}
                inHistory={false}
                tail={
                  <></>
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FloatingMatch;

