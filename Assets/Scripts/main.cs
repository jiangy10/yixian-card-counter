using System.IO;
using SimpleJSON;
using UnityEngine;
using UnityEngine.UIElements; 

public class Main : MonoBehaviour
{
    [SerializeField] private UIDocument uiDocument; 
    private void Start()
    {
        string filePath = Path.Combine(Application.dataPath, "round14.json");
        string json = File.ReadAllText(filePath);
        var history = JSONNode.Parse(json);
        Debug.Log(history["rounds"]);
        Player tempPlayer = new Player("饭缸出门扶墙", 100, 20, 10);
        // Player.setDestiny(history.players[0].destiny);
        // Player.setHealth(history.players[0].health);
        // Player.setCultivation(history.players[0].cultivation);

        var root = uiDocument.rootVisualElement;
        
        UIManager.UpdatePlayerInfo(root, tempPlayer);
        // UIManager.UpdateTackingCard(root, tempPlayer.used_card);
        StyleManager.ApplyStyleSheet(root, "ScreenStyles");
        StyleManager.ApplyStyleSheet(root, "UserInfoStyles");
        StyleManager.ApplyStyleSheet(root, "TrackingCardStyles");
        StyleManager.ApplyStyleSheet(root, "MatchHistoryStyles");
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
    public int health;
    public int cultivation;
    public MatchHistory[] match_hitory;

    public Player(string player_username, int destiny, int health, int cultivation)
    {
        this.player_username = player_username;
        this.destiny = destiny;
        this.health = health;
        this.cultivation = cultivation;
        this.match_hitory = new MatchHistory[0];
    }

    public void setDestiny(int destiny)
    {
        this.destiny = destiny;
    }

    public void setHealth(int health)
    {
        this.health = health;
    }

    public void setCultivation(int cultivation)
    {
        this.cultivation = cultivation;
    }
}

[System.Serializable]
public class MatchHistory
{
    public int round;
    public string opponent_username;
    public int destiny;
    public int destiny_diff;
    public int health;
    public int cultivation;
    public Card[] used_card;

    public MatchHistory(int round, string opponent_username, int destiny, int destiny_diff, int health, int cultivation)
    {
        this.round = round;
        this.opponent_username = opponent_username;
        this.destiny = destiny;
        this.destiny_diff = destiny_diff;
        this.health = health;
        this.cultivation = cultivation;
    }
}

[System.Serializable]
public class Card
{
    public string name;
    public int level;
    public int phase;
    public string img_url;

    public Card(string name, int level, int phase)
    {
        this.name = name;
        this.level = level;
        this.phase = phase;
    }
}
