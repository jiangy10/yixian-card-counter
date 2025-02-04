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


        var userNameLabel = root.Q<Label>("UserNameLabel");
        if (userNameLabel != null)
        {
            userNameLabel.style.fontSize = playerInfoContainer.resolvedStyle.width * 0.06f;
            if(playerInfoContainer.resolvedStyle.width <= 70){
                userNameLabel.style.paddingTop = 0;
                userNameLabel.style.paddingBottom = 0;
            }

        }

        var cultivationLabel = root.Q<Label>("CultivationLabel");
        if (cultivationLabel != null)
        {
            cultivationLabel.style.fontSize = playerInfoContainer.resolvedStyle.width * 0.05f;
            if(playerInfoContainer.resolvedStyle.width <= 70){
                cultivationLabel.style.paddingTop = 0;
                cultivationLabel.style.paddingBottom = 0;
            }
        }

        var healthLabel = root.Q<Label>("HealthLabel");
        if (healthLabel != null)
        {
            healthLabel.style.fontSize = playerInfoContainer.resolvedStyle.width * 0.05f;
            if(playerInfoContainer.resolvedStyle.width <= 70){
                healthLabel.style.paddingTop = 0;
                healthLabel.style.paddingBottom = 0;
            }
        }
    }
}
