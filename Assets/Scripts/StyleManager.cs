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
            root.RegisterCallback<GeometryChangedEvent>(evt => AdjustFontSize(root));
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
                userNameLabel.style.fontSize = playerInfoContainer.resolvedStyle.width * 0.06f;
            }

            var cultivationLabel = root.Q<Label>("CultivationLabel");
            if (cultivationLabel != null)
            {
                cultivationLabel.style.fontSize = playerInfoContainer.resolvedStyle.width * 0.05f;
            }

            var healthLabel = root.Q<Label>("HealthLabel");
            if (healthLabel != null)
            {
                healthLabel.style.fontSize = playerInfoContainer.resolvedStyle.width * 0.05f;
            }
            TinyLables(playerInfoContainer);
        }

        
        
        var trackingCardNavContainer = root.Q<VisualElement>("TrackingCardNavContainer");
        if (trackingCardNavContainer == null)
        {
            Debug.LogError("TrackingCardNavContainer not found.");
        }else{
            var trackingCardTitleLabel = trackingCardNavContainer.Q<VisualElement>("TrackingCardTitleLabel");
            if (trackingCardTitleLabel != null)
            {
                trackingCardTitleLabel.style.fontSize = trackingCardNavContainer.resolvedStyle.width * 0.07f;
            }

            TinyLables(trackingCardNavContainer);
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
                card.style.borderBottomLeftRadius = trackingCardContainer.resolvedStyle.width * 0.03f;
                card.style.borderBottomRightRadius = trackingCardContainer.resolvedStyle.width * 0.03f;
                card.style.borderTopLeftRadius = trackingCardContainer.resolvedStyle.width * 0.03f;
                card.style.borderTopRightRadius = trackingCardContainer.resolvedStyle.width * 0.03f;
            });
        }

    }

    private static void TinyLables(VisualElement root) {
        if (root.resolvedStyle.width <= 100){
            if (!root.ClassListContains("SmallLabels")){
                root.AddToClassList("SmallLabels");
            }
        }else{
            if (root.ClassListContains("SmallLabels")){
                root.RemoveFromClassList("SmallLabels");
            }
        }
    }
}
