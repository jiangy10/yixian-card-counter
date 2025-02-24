using UnityEngine;
using UnityEngine.UIElements;
using System.Collections.Generic;


public static class UIManager
{
    private static readonly Dictionary<int, Color> LevelColors = new Dictionary<int, Color>
    {
        { 4, new Color(137f / 255f, 115f / 255f, 236f / 255f) }, // rgb(137, 115, 236)
        { 5, new Color(247f / 255f, 222f / 255f, 121f / 255f) }  // rgb(247, 222, 121)
    };
    
    public static void UpdatePlayerInfo(VisualElement root, Player player)
    {
        var playerInfoContainer = root.Q<VisualElement>("PlayerInfoContainer");
        if (playerInfoContainer == null)
        {
            Debug.LogError("PlayerInfoContainer not found.");
            return;
        }

        var userNameLabel = playerInfoContainer.Q<Label>("UserNameLabel");
        if (userNameLabel != null)
        {
            userNameLabel.text = player.player_username;
        }

        var cultivationLabel = playerInfoContainer.Q<Label>("CultivationLabel");
        if (cultivationLabel != null)
        {
            cultivationLabel.text = $"修为： {player.cultivation}";
        }

        var healthLabel = playerInfoContainer.Q<Label>("HealthLabel");
        if (healthLabel != null)
        {
            healthLabel.text = $"生命上限： {player.health}";
        }
    }

    public static void UpdateTackingCard(VisualElement root, Card[] cards){
        var trackingCardScrollView = root.Q<ScrollView>("TrackingCardScrollView");
        if (trackingCardScrollView == null)
        {
            Debug.LogError("TrackingCardScrollView not found.");
            return;
        }
        trackingCardScrollView.Clear();

        var trackingCardContainer = new VisualElement();
        trackingCardContainer.name = "TrackingCardContainer";

        foreach (var card in cards)
        {
            var cardContainer = new VisualElement();
            cardContainer.AddToClassList("Card");
            cardContainer.style.borderLeftColor = new StyleColor(LevelColors[card.phase]);
            cardContainer.style.borderRightColor = new StyleColor(LevelColors[card.phase]);
            cardContainer.style.borderTopColor = new StyleColor(LevelColors[card.phase]);
            cardContainer.style.borderBottomColor = new StyleColor(LevelColors[card.phase]);

            var levelLabel = new Label($"Lv.{card.level}");
            levelLabel.AddToClassList("CardLevel");

            var cardImage = new VisualElement();
            cardImage.AddToClassList("CardImage");
            cardImage.style.backgroundImage = new StyleBackground(Resources.Load<Texture2D>($"Textures/Images/{card.name}"));

            var nameLabel = new Label(card.name);
            nameLabel.AddToClassList("CardName");

            cardContainer.Add(levelLabel);
            cardContainer.Add(cardImage);
            cardContainer.Add(nameLabel);

            trackingCardContainer.Add(cardContainer);
        }

        trackingCardScrollView.Add(trackingCardContainer);
    }
       
    public static void UpdateMatchHistory(VisualElement root, SortedDictionary<int, MatchHistory> playerMatchHitory){
        var matchHistoryScrollView = root.Q<ScrollView>("MatchHistoryScrollView");
        if (matchHistoryScrollView == null)
        {
            Debug.LogError("MatchHistoryScrollView not found.");
            return;
        }
        matchHistoryScrollView.Clear();

        var matchHistoryList = new VisualElement();
        // matchHistoryList.name = "MatchHistoryList";

        foreach (var history in playerMatchHitory)
        {
            Debug.Log(history.Key);
            Debug.Log(history.Value);
            int round = history.Key;
            MatchHistory matchHistory = history.Value;

            var matchHistoryContainer = new VisualElement();
            matchHistoryContainer.AddToClassList("MatchHistoryContainer");

            var roundLabel = new Label($"第{round}回合");
            roundLabel.AddToClassList("RoundLabel");

            var cultivationLabel = new Label($"修为：{matchHistory.cultivation}");
            cultivationLabel.AddToClassList("CultivationLabel");

            var healthLabel = new Label($"生命上限：{matchHistory.health}");
            healthLabel.AddToClassList("HealthLabel");

            var destinyLabel = new Label($"命元：{matchHistory.destiny}({-matchHistory.destiny_diff})");
            destinyLabel.AddToClassList("DestinyLabel");

            var resultLabel = new Label(matchHistory.destiny_diff == 0 ? "胜" : "负");
            resultLabel.AddToClassList("ResultLabel");

            var opponentNameLabel = new Label($"对手：{matchHistory.opponent_username}");
            opponentNameLabel.AddToClassList("OpponentNameLabel");

            matchHistoryContainer.Add(roundLabel);
            matchHistoryContainer.Add(cultivationLabel);
            matchHistoryContainer.Add(healthLabel);
            matchHistoryContainer.Add(destinyLabel);
            matchHistoryContainer.Add(resultLabel);
            matchHistoryContainer.Add(opponentNameLabel);

            foreach(var card in matchHistory.used_card){
                var usedCardContainer = new VisualElement();
                usedCardContainer.AddToClassList("Card");

                var levelLabel = new Label($"Lv.{card.level}");
                levelLabel.AddToClassList("CardLevel");

                var cardImage = new VisualElement();
                cardImage.AddToClassList("CardImage");
                cardImage.style.backgroundImage = new StyleBackground(Resources.Load<Texture2D>($"Textures/Images/{card.name}"));

                var nameLabel = new Label(card.name);
                nameLabel.AddToClassList("CardName");

                usedCardContainer.Add(levelLabel);
                usedCardContainer.Add(cardImage);
                usedCardContainer.Add(nameLabel);

                matchHistoryContainer.Add(usedCardContainer);
            }

            matchHistoryList.Add(matchHistoryContainer);
            
        }   

        matchHistoryScrollView.Add(matchHistoryList);

        
    }


}
