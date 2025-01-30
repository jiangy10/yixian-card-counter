using UnityEngine;
using UnityEngine.UIElements;

public static class UIManager
{
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

    }
}
