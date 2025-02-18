using System.IO;
using UnityEngine;
using UnityEngine.UIElements; 

public class Main : MonoBehaviour
{
    [SerializeField] private UIDocument uiDocument; 
    private void Start()
    {
        Player tempPlayer = new Player();
        tempPlayer.player_username = "饭缸出门扶墙";
        tempPlayer.cultivation = 20;
        tempPlayer.health = 105;
        tempPlayer.destiny = 100;

        Card tempCard1 = new Card("梅开二度", 2, 5);
        Card tempCard2 = new Card("星弈·断", 1, 5);
        Card tempCard3 = new Card("万花迷魂阵", 1, 5);

        tempPlayer.match_hitory.used_card = new Card[] {tempCard1, tempCard2, tempCard3};

        var root = uiDocument.rootVisualElement;
        
        UIManager.UpdatePlayerInfo(root, tempPlayer);
        UIManager.UpdateTackingCard(root, tempPlayer.used_card);
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

    public Player(string player_username, int destiny, int destiny_diff, int health, int cultivation)
    {
        this.player_username = player_username;
        this.destiny = destiny;
        this.destiny_diff = destiny_diff;
        this.health = health;
        this.cultivation = cultivation;
        this.match_hitory = new MatchHistory[];
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
