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

        Card tempCard1 = new Card();
        tempCard1.name = "梅开二度";
        tempCard1.level = 1;
        tempCard1.phase = 5;

        Card tempCard2 = new Card();
        tempCard2.name = "梅开二度";
        tempCard2.level = 1;
        tempCard2.phase = 5;

        Card tempCard3 = new Card();
        tempCard3.name = "梅开二度";
        tempCard3.level = 1;
        tempCard3.phase = 5;

        tempPlayer.used_card = new Card[] {tempCard1, tempCard2, tempCard3};

        var root = uiDocument.rootVisualElement;
        
        UIManager.UpdatePlayerInfo(root, tempPlayer);
        StyleManager.ApplyStyleSheet(root, "ScreenStyles");
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
    public Card[] used_card;
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
public class Card
{
    public string name;
    public int level;
    public int phase;
    public string img_url;
}
