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
        var trackingCardContainer = root.Q<VisualElement>("TrackingCardContainer");
        if (trackingCardContainer == null)
        {
            Debug.LogError("TrackingCardContainer not found.");
            return;
        }
        trackingCardContainer.Clear();

        foreach (var card in cards)
        {
            var cardContainer = new VisualElement();
            cardContainer.AddToClassList("Cards");
            cardContainer.style.borderLeftColor = new StyleColor(LevelColors[card.phase]);
            cardContainer.style.borderRightColor = new StyleColor(LevelColors[card.phase]);
            cardContainer.style.borderTopColor = new StyleColor(LevelColors[card.phase]);
            cardContainer.style.borderBottomColor = new StyleColor(LevelColors[card.phase]);;

            var levelLabel = new Label($"Lv.{card.level}");
            levelLabel.AddToClassList("card-level");

            var cardImage = new VisualElement();
            cardImage.AddToClassList("card-image");
            cardImage.style.backgroundImage = new StyleBackground(Resources.Load<Texture2D>($"Textures/Images/{card.name}"));


            var nameLabel = new Label(card.name);
            nameLabel.AddToClassList("card-name");

            cardContainer.Add(levelLabel);
            cardContainer.Add(cardImage);
            cardContainer.Add(nameLabel);

            trackingCardContainer.Add(cardContainer);
        }

    }
}
