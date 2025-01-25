using System.IO;
using UnityEngine;
using UnityEngine.UIElements; 

public class Main : MonoBehaviour
{
    [SerializeField] private UIDocument uiDocument; 
    private void Start()
    {
        var root = uiDocument.rootVisualElement;
        Player tempPlayer = new Player();
        tempPlayer.player_username = "Player1";
        tempPlayer.cultivation = 20;
        tempPlayer.health = 105;
        tempPlayer.destiny = 100;
        UIManager.UpdatePlayerInfo(root, tempPlayer);
    }

    private void ApplyStyleSheet(VisualElement root, string styleSheetName)
    {
        var styleSheet = Resources.Load<StyleSheet>("Assets/Data/UIDocuments/ScreenStyles.uss");
        if (styleSheet != null){
            root.styleSheets.Add(styleSheet);
        }
        else{
            Debug.LogError("StyleSheet not found: " + "Assets/Data/UIDocuments/ScreenStyles.uss");
        }
    }

}


[System.Serializable]

public class Root
{
    public int rounds;
    public Player[] players;
}

[System.Serializable]
public class Player
{
    public string player_username;
    public int destiny;
    public int destiny_diff;
    public int health;
    public int cultivation;
    public MatchResult match_result;
    public UsedCard[] used_card;
}

[System.Serializable]
public class MatchResult
{
    public string opponent_username;
    public int destiny;
    public int destiny_diff;
    public int health;
    public int cultivation;
}

[System.Serializable]
public class UsedCard
{
    public string name;
    public int Level;
    public int Phase;
    public string img_url;
}
