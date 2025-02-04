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
            return;
        }
        if (playerInfoContainer.resolvedStyle.width <= 100){
            if (!playerInfoContainer.ClassListContains("SmallLabels")){
                playerInfoContainer.AddToClassList("SmallLabels");
            }
        }else{
            if (playerInfoContainer.ClassListContains("SmallLabels")){
                playerInfoContainer.RemoveFromClassList("SmallLabels");
            }
        }
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
        
        var trackingCardNavContainer = root.Q<VisualElement>("TrackingCardNavContainer");
        if (trackingCardNavContainer == null)
        {
            Debug.LogError("TrackingCardNavContainer not found.");
        }else{
            var trackingCardTitleLabel = trackingCardNavContainer.Q<VisualElement>("TrackingCardTitleLabel");
            if (trackingCardTitleLabel != null)
            {
                trackingCardTitleLabel.style.fontSize = trackingCardNavContainer.resolvedStyle.width * 0.06f;
            }
        }
    }
}
