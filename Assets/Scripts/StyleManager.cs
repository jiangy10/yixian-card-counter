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
                tab.style.width = root.resolvedStyle.width * 0.2f;
                tab.style.height = root.resolvedStyle.width * 0.1f;
                tab.style.marginLeft = root.resolvedStyle.width * 0.02f;
                tab.style.fontSize = root.resolvedStyle.width * 0.07f;
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
                card.style.borderBottomLeftRadius = trackingCardContainer.resolvedStyle.width * 0.02f;
                card.style.borderBottomRightRadius = trackingCardContainer.resolvedStyle.width * 0.02f;
                card.style.borderTopLeftRadius = trackingCardContainer.resolvedStyle.width * 0.02f;
                card.style.borderTopRightRadius = trackingCardContainer.resolvedStyle.width * 0.02f;
                card.style.borderLeftWidth = trackingCardContainer.resolvedStyle.width * 0.01f;
                card.style.borderRightWidth = trackingCardContainer.resolvedStyle.width * 0.01f;
                card.style.borderTopWidth = trackingCardContainer.resolvedStyle.width * 0.01f;
                card.style.borderBottomWidth = trackingCardContainer.resolvedStyle.width * 0.01f;
                card.style.height = trackingCardContainer.resolvedStyle.height * 0.2f;
                card.style.width = trackingCardContainer.resolvedStyle.width * 0.9f;
                card.Query<Label>().ForEach(label => label.style.fontSize = card.resolvedStyle.height * 0.8f);
                card.Q<VisualElement>(className: "CardImage").style.width = card.resolvedStyle.height * 0.8f;
                card.Q<VisualElement>(className: "CardImage").style.height = card.resolvedStyle.height * 0.8f;
            });
        }

    }

}
