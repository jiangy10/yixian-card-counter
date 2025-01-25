using System.IO;
using UnityEngine;
using UnityEngine.UIElements; 

public class Main : MonoBehaviour
{
    [SerializeField] private UIDocument uiDocument; 
    private void Start()
    {
        string filePath = Application.dataPath + "/Data/sample.json";

        if (File.Exists(filePath))
        {
            string jsonContent = File.ReadAllText(filePath);

            Root data = JsonUtility.FromJson<Root>(jsonContent);

            var root = uiDocument.rootVisualElement;
            foreach (var child in root.Children()){
                Debug.Log(child.style);
            }
            ApplyStyleSheet(root, "ScreenStyles.uss");
            root.styleSheets.Add(styleSheet);

            var playerInfo = root.Q<VisualElement>("PlayerInfoContainer");

            // foreach (var player in data.players)
            // {
            //     Debug.Log($"Player Username: {player.player_username}");
            //     Debug.Log($"Destiny: {player.destiny}, Health: {player.health}, Cultivation: {player.cultivation}");
            //     Debug.Log($"Opponent Username: {player.match_result.opponent_username}");
            //     Debug.Log($"Opponent Destiny: {player.match_result.destiny}, Health: {player.match_result.health}");
            // }
        }
        else
        {
            Debug.LogError("JSON not found: " + filePath);
        }
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
