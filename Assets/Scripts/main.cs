using System.IO;
using System.Collections.Generic;
using SimpleJSON;
using UnityEngine;
using UnityEngine.UIElements; 

public class Main : MonoBehaviour
{
    [SerializeField] private UIDocument uiDocument; 
    private Player player;

    private void Start()
    {
        string filePath = Path.Combine(Application.dataPath, "round14.json");
        string json = File.ReadAllText(filePath);
        MatchHistoryLog matchHistoryLog = JsonUtility.FromJson<MatchHistoryLog>(json);

        this.player = new Player("饭缸出门扶墙", 100, 20, 10);
        //listen to server
        this.UpdateMatchHistory(matchHistoryLog);

        var root = uiDocument.rootVisualElement;
        
        UIManager.UpdatePlayerInfo(root, this.player);
        UIDocument.UpdateMatchHistory(root, this.player.match_hitory);
        StyleManager.ApplyStyleSheet(root, "ScreenStyles");
        StyleManager.ApplyStyleSheet(root, "UserInfoStyles");
        StyleManager.ApplyStyleSheet(root, "TrackingCardStyles");
        StyleManager.ApplyStyleSheet(root, "MatchHistoryStyles");
    }

    private void UpdateMatchHistory(MatchHistoryLog matchHistoryLog){
        foreach (var player in matchHistoryLog.players)
        {
            if (player.player_username == this.player.player_username)
            {
                this.player.setDestiny(player.destiny);
                this.player.setHealth(player.health);
                this.player.setCultivation(player.cultivation);

                this.player.setMatchHistory(player);
            }
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
    public int health;
    public int cultivation;
    public SortedDictionary<int, MatchHistory> match_hitory;

    public Player(string player_username, int destiny, int health, int cultivation)
    {
        this.player_username = player_username;
        this.destiny = destiny;
        this.health = health;
        this.cultivation = cultivation;
        this.match_hitory = new SortedDictionary<int, MatchHistory>();
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
    
    public void setMatchHistory(MatchHistoryPlayer MatchHistoryPlayer)
    {
        this.match_hitory.Add(MatchHistoryPlayer.round, new MatchHistory(MatchHistoryPlayer.opponent_username, MatchHistoryPlayer.destiny, MatchHistoryPlayer.destiny_diff, MatchHistoryPlayer.health, MatchHistoryPlayer.cultivation));
    }
}

[System.Serializable]
public class MatchHistory
{
    public string opponent_username;
    public int destiny;
    public int destiny_diff;
    public int health;
    public int cultivation;
    public Card[] used_card;

    public MatchHistory(string opponent_username, int destiny, int destiny_diff, int health, int cultivation, Card used_card)
    {
        this.opponent_username = opponent_username;
        this.destiny = destiny;
        this.destiny_diff = destiny_diff;
        this.health = health;
        this.cultivation = cultivation;
        this.used_card = used_card;
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

[System.Serializable]
public class MatchHistoryPlayer
{
    public string player_username;
    public int destiny;
    public int destiny_diff;
    public int health;
    public int cultivation;
    public string opponent_username;
    public Card[] used_card;
}

[System.Serializable]
public class MatchHistoryLog
{
    public int round;
    public MatchHistoryPlayer[] players;
}
