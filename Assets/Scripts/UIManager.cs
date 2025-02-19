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
       
     public static void UpdateMatchHistory(VisualElement root, MatchHistory[] history){
        var matchHistoryScrollView = root.Q<ScrollView>("MatchHistoryScrollView");
        if (matchHistoryScrollView == null)
        {
            Debug.LogError("MatchHistoryScrollView not found.");
            return;
        }
        matchHistoryScrollView.Clear();

        var matchHistoryList = new VisualElement();
        matchHistoryList.name = "MatchHistoryList";

        bool recent = true;

        for (int i = history.Length - 1; i >= 0; i--)
        {
            var match = history[i];

            // var matchContainer = new Foldout();
            // matchContainer.text = $"第{match.round}轮";
            // matchContainer.value = recent;
            // recent = false;

            // var detailContainer = new VisualElement();
            // detailContainer.AddToClassList("MatchDetail");

            // var statsLabel = new Label($"修为：{match.cultivation}  生命上限：{match.health}  命元：{match.destiny} {GetDestinyDiffText(match.destinyDiff)}");
            // detailContainer.Add(statsLabel);

            // var opponentLabel = new Label($"对手 {match.opponent}  {(match.isWin ? "胜" : "负")}");
            // opponentLabel.style.color = match.isWin ? Color.green : Color.red;
            // detailContainer.Add(opponentLabel);

            // matchContainer.Add(detailContainer);
            // matchHistoryList.Add(matchContainer);
        }

        matchHistoryScrollView.Add(matchHistoryList);
    }


}
