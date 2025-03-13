using UnityEngine;
using UnityEngine.UIElements;
using System.Collections.Generic;


public static class UIManager
{
    private static readonly Dictionary<int, Color> LevelColors = new Dictionary<int, Color>
    {
        { 2, new Color(180f / 255f, 207f / 255f, 127f / 255f) }, // rgb(180, 207, 127)
        { 3, new Color(123f / 255f, 218f / 255f, 221f / 255f) }, // rgb(123, 218, 221)
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

            trackingCardScrollView.Add(cardContainer);
        }
    }
       
    public static void UpdateMatchHistory(VisualElement root, SortedDictionary<int, MatchHistory> playerMatchHitory)
    {
        var matchHistoryScrollView = root.Q<ScrollView>("MatchHistoryScrollView");
        if (matchHistoryScrollView == null)
        {
            Debug.LogError("MatchHistoryScrollView not found.");
            return;
        }
        matchHistoryScrollView.Clear();

        var matchHistoryList = new VisualElement();
        matchHistoryList.name = "MatchHistoryList";  // This element will have the overall background.

        bool unfold = true;
        int selectedRound = 0;

        foreach (var history in playerMatchHitory)
        {
            int round = history.Key;
            MatchHistory matchHistory = history.Value;

            var matchHistoryContainer = new VisualElement();
            matchHistoryContainer.AddToClassList("MatchHistoryContainer");

            var headerContainer = new VisualElement();
            headerContainer.AddToClassList("MatchHistoryHeader");

            var roundLabel = new Label($"第{-round}回合");
            roundLabel.AddToClassList("RoundLabel");

            var resultLabel = new Label(matchHistory.destiny_diff == 0 ? "胜" : "负");
            resultLabel.AddToClassList("ResultLabel");
            resultLabel.style.color = matchHistory.destiny_diff == 0 ? new Color(0f, 1f, 0f) : new Color(1f, 0f, 0f);

            headerContainer.Add(roundLabel);
            headerContainer.Add(resultLabel);

            var contentContainer = new VisualElement();
            contentContainer.AddToClassList("MatchHistoryContent");
            contentContainer.AddToClassList($"round{-round}");
            contentContainer.style.display = unfold ? DisplayStyle.Flex : DisplayStyle.None;

            var matchInfoContainer = new VisualElement();
            matchInfoContainer.AddToClassList("MatchInfoContainer");

            var cultivationLabel = new Label($"修为：{matchHistory.cultivation}");
            cultivationLabel.AddToClassList("MatchInfoLabel");

            var healthLabel = new Label($"生命上限：{matchHistory.health}");
            healthLabel.AddToClassList("MatchInfoLabel");

            var destinyLabel = new Label($"命元：{matchHistory.destiny}({-matchHistory.destiny_diff})");
            destinyLabel.AddToClassList("MatchInfoLabel");

            var opponentNameLabel = new Label($"对手：{matchHistory.opponent_username}");
            opponentNameLabel.AddToClassList("MatchInfoLabel");

            matchInfoContainer.Add(cultivationLabel);
            matchInfoContainer.Add(healthLabel);
            matchInfoContainer.Add(destinyLabel);
            matchInfoContainer.Add(opponentNameLabel);

            var usedCardsContainer = new VisualElement();
            usedCardsContainer.AddToClassList("UsedCardsContainer");

            foreach (var card in matchHistory.used_card)
            {
                var cardContainer = new VisualElement();
                cardContainer.AddToClassList("MatchHistoryCard");
                cardContainer.style.borderLeftColor = new StyleColor(LevelColors[card.phase]);
                cardContainer.style.borderRightColor = new StyleColor(LevelColors[card.phase]);
                cardContainer.style.borderTopColor = new StyleColor(LevelColors[card.phase]);
                cardContainer.style.borderBottomColor = new StyleColor(LevelColors[card.phase]);

                var levelLabel = new Label($"Lv.{card.level}");
                levelLabel.AddToClassList("MatchHistoryCardLevel");

                var cardImage = new VisualElement();
                cardImage.AddToClassList("MatchHistoryCardImage");
                cardImage.style.backgroundImage = new StyleBackground(Resources.Load<Texture2D>($"Textures/Images/{card.name}"));

                var nameLabel = new Label(card.name);
                nameLabel.AddToClassList("MatchHistoryCardName");

                cardContainer.Add(levelLabel);
                cardContainer.Add(cardImage);
                cardContainer.Add(nameLabel);
                usedCardsContainer.Add(cardContainer);
            }

            contentContainer.Add(matchInfoContainer);
            contentContainer.Add(usedCardsContainer);

            headerContainer.RegisterCallback<ClickEvent>(evt =>
            {
                if (selectedRound != round){
                    root.Q<VisualElement>(className: $"round{selectedRound}").style.display = DisplayStyle.None;
                }
                bool isExpanded = contentContainer.style.display == DisplayStyle.None;
                contentContainer.style.display = isExpanded ? DisplayStyle.Flex : DisplayStyle.None;
                selectedRound = -round;
            });

            matchHistoryContainer.Add(headerContainer);
            matchHistoryContainer.Add(contentContainer);
            matchHistoryList.Add(matchHistoryContainer);

            if (unfold){
                selectedRound = -round;
            }
            unfold = false;
        }

        matchHistoryScrollView.Add(matchHistoryList);
    }
}
