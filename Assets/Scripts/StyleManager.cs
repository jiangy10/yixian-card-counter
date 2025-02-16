using UnityEngine;
using UnityEngine.UIElements;

public static class StyleManager
{
    public static void ApplyStyleSheet(VisualElement root, string styleSheetName)
    {
        var styleSheet = Resources.Load<StyleSheet>(styleSheetName);
        if (styleSheet != null)
        {
            root.styleSheets.Add(styleSheet);
            root.RegisterCallback<GeometryChangedEvent>(evt => AdjustFontSize(root.Q<VisualElement>("CounterContainer")));
        }
        else
        {
            Debug.LogError($"StyleSheet {styleSheetName} not found in Resources folder.");
        }
    }

    private static void AdjustFontSize(VisualElement root){
        var playerInfoContainer = root.Q<VisualElement>("PlayerInfoContainer");
        if (playerInfoContainer == null)
        {
            Debug.LogError("PlayerInfoContainer not found.");
        }
        else
        {
            var userNameLabel = root.Q<Label>("UserNameLabel");
            if (userNameLabel != null)
            {
                userNameLabel.style.fontSize = playerInfoContainer.resolvedStyle.height * 0.05f;
            }

            var cultivationLabel = root.Q<Label>("CultivationLabel");
            if (cultivationLabel != null)
            {
                cultivationLabel.style.fontSize = playerInfoContainer.resolvedStyle.height * 0.05f;
            }

            var healthLabel = root.Q<Label>("HealthLabel");
            if (healthLabel != null)
            {
                healthLabel.style.fontSize = playerInfoContainer.resolvedStyle.height * 0.05f;
            }
        }

        
        
        var trackingCardNavContainer = root.Q<VisualElement>("TrackingCardNavContainer");
        if (trackingCardNavContainer == null)
        {
            Debug.LogError("TrackingCardNavContainer not found.");
        }else{
            var trackingCardTitleLabel = trackingCardNavContainer.Q<VisualElement>("TrackingCardTitleLabel");
            if (trackingCardTitleLabel != null)
            {
                trackingCardTitleLabel.style.fontSize = root.resolvedStyle.width * 0.07f;
            }
        }
               
        var trackingCardContainer = root.Q<VisualElement>("TrackingCardContainer");
        if (trackingCardContainer == null)
        {
            Debug.LogError("TrackingCardContainer not found.");
        }
        else
        {
            trackingCardContainer.Query(className: "Card").ForEach(card =>
            {
                card.Query<Label>().ForEach(label => label.style.fontSize = card.resolvedStyle.height * 0.6f);
                card.Q<VisualElement>(className: "CardImage").style.width = card.resolvedStyle.height * 0.6f;
                card.Q<VisualElement>(className: "CardImage").style.height = card.resolvedStyle.height * 0.6f;
            });
        }

        var matchHistoryContainer = root.Q<VisualElement>("MatchHistoryContainer");
        if (matchHistoryContainer == null)
        {
            Debug.LogError("MatchHistoryContainer not found.");
        }
        else
        {
            var matchHistoryTitleLabel = matchHistoryContainer.Q<VisualElement>("MatchHistoryTitleLabel");
            if (matchHistoryTitleLabel != null)
            {
                matchHistoryTitleLabel.style.fontSize = root.resolvedStyle.width * 0.07f;
            }
        }



    }

}
