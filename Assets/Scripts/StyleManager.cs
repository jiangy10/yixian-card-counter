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
                userNameLabel.style.paddingTop = playerInfoContainer.resolvedStyle.height * 0.01f;
                userNameLabel.style.paddingBottom = playerInfoContainer.resolvedStyle.height * 0.01f;
            }

            var cultivationLabel = root.Q<Label>("CultivationLabel");
            if (cultivationLabel != null)
            {
                cultivationLabel.style.fontSize = playerInfoContainer.resolvedStyle.height * 0.05f;
                cultivationLabel.style.paddingTop = playerInfoContainer.resolvedStyle.height * 0.01f;
                cultivationLabel.style.paddingBottom = playerInfoContainer.resolvedStyle.height * 0.01f;
            }

            var healthLabel = root.Q<Label>("HealthLabel");
            if (healthLabel != null)
            {
                healthLabel.style.fontSize = playerInfoContainer.resolvedStyle.height * 0.05f;
                healthLabel.style.paddingTop = playerInfoContainer.resolvedStyle.height * 0.01f;
                healthLabel.style.paddingBottom = playerInfoContainer.resolvedStyle.height * 0.01f;
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
		
		var tabContainer = root.Q<VisualElement>("TabContainer");
		if (tabContainer == null){
            Debug.LogError("TabContainer not found.");
		}
		else{
			foreach (var tab in tabContainer.Children())
            {
                tab.style.width = tabContainer.resolvedStyle.width * 0.25f;
                tab.style.height = tabContainer.resolvedStyle.height * 0.8f;
                tab.style.marginLeft = tabContainer.resolvedStyle.width * 0.01f;
                tab.style.fontSize = tabContainer.resolvedStyle.height * 0.7f;
            }
		}

    }

}
