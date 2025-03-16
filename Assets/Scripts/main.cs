using System.IO;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UIElements; 
using System.Diagnostics;
using System.Runtime.InteropServices;
using System;

public class Main : MonoBehaviour
{
    [SerializeField] private UIDocument uiDocument; 
    private Player player;
    private Process gameProcess;

    [DllImport("user32.dll")]
    private static extern IntPtr SetParent(IntPtr hWndChild, IntPtr hWndNewParent);

    [DllImport("user32.dll")]
    private static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, 
        int X, int Y, int cx, int cy, uint uFlags);

    [DllImport("user32.dll")]
    private static extern bool GetWindowRect(IntPtr hwnd, ref RECT rect);

    [StructLayout(LayoutKind.Sequential)]
    private struct RECT
    {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }

    private void Start()
    {
        string json_14 = File.ReadAllText(Path.Combine(Application.dataPath, "round14.json"));
        string json_13 = File.ReadAllText(Path.Combine(Application.dataPath, "round13.json"));
        MatchHistoryLog matchHistoryLog_14 = JsonUtility.FromJson<MatchHistoryLog>(json_14);
        MatchHistoryLog matchHistoryLog_13 = JsonUtility.FromJson<MatchHistoryLog>(json_13);

        this.player = new Player("饭缸出门扶墙", 100, 20, 10);
        this.UpdateMatchHistory(matchHistoryLog_13);
        this.UpdateMatchHistory(matchHistoryLog_14);
        var temp_tracking_card = new Card[8];
        temp_tracking_card[0] = new Card("星弈·虎", 1, 4);
        temp_tracking_card[1] = new Card("金蝉脱壳", 2, 4);
        temp_tracking_card[2] = new Card("星弈·虎", 1, 4);
        temp_tracking_card[3] = new Card("金蝉脱壳", 2, 4);
        temp_tracking_card[4] = new Card("星弈·虎", 1, 4);
        temp_tracking_card[5] = new Card("金蝉脱壳", 2, 4);
        temp_tracking_card[6] = new Card("星弈·虎", 1, 4);
        temp_tracking_card[7] = new Card("金蝉脱壳", 2, 4);
        

        var root = uiDocument.rootVisualElement;
        
        UIManager.UpdatePlayerInfo(root, this.player);
        UIManager.UpdateTackingCard(root, temp_tracking_card);
        UIManager.UpdateMatchHistory(root, this.player.match_hitory);
        UIManager.RegisterManageTrackingListener(root);
        StyleManager.ApplyStyleSheet(root, "ScreenStyles");
        StyleManager.ApplyStyleSheet(root, "UserInfoStyles");
        StyleManager.ApplyStyleSheet(root, "TrackingCardStyles");
        StyleManager.ApplyStyleSheet(root, "MatchHistoryStyles");

        LaunchGame();
    }

    private void UpdateMatchHistory(MatchHistoryLog matchHistoryLog){
        foreach (var player in matchHistoryLog.players)
        {
            if (player.player_username == this.player.player_username)
            {
                this.player.setDestiny(player.destiny);
                this.player.setHealth(player.health);
                this.player.setCultivation(player.cultivation);

                this.player.setMatchHistory(-matchHistoryLog.round, player);
            }   
        }
    }

    private void LaunchGame()
    {
        try
        {
            var root = uiDocument.rootVisualElement;
            var gameContainer = root.Q<VisualElement>("GameContainer");
            
            gameProcess = new Process();
            gameProcess.StartInfo.FileName = @"D:\steam\steamapps\common\弈仙牌\YiXianPai.exe"; //todo: should find game path
            gameProcess.StartInfo.Arguments = "-screen-fullscreen 0 -window-mode 0 -screen-width 1280 -screen-height 720";
            gameProcess.StartInfo.UseShellExecute = true;
            gameProcess.StartInfo.WindowStyle = ProcessWindowStyle.Normal;
            
            gameProcess.Start();
            gameProcess.WaitForInputIdle(10000);
            
            if (gameProcess.MainWindowHandle != IntPtr.Zero)
            {
                var unityWindow = GetUnityWindowHandle();
                if (unityWindow != IntPtr.Zero)
                {
                    SetParent(gameProcess.MainWindowHandle, unityWindow);
                    
                    var containerRect = gameContainer.worldBound;
                    SetWindowPos(gameProcess.MainWindowHandle, IntPtr.Zero,
                        (int)containerRect.x, (int)containerRect.y,
                        (int)containerRect.width, (int)containerRect.height,
                        0x0040);
                }
            }
            
            gameProcess.EnableRaisingEvents = true;
            gameProcess.Exited += OnGameExited;
        }
        catch (System.Exception e)
        {
            UnityEngine.Debug.LogError($"Failed to launch game: {e.Message}");
        }
    }

    private IntPtr GetUnityWindowHandle()
    {
        #if UNITY_EDITOR
            return System.Diagnostics.Process.GetCurrentProcess().MainWindowHandle;
        #else
            return GetActiveWindow();
        #endif
    }

    private void OnGameExited(object sender, System.EventArgs e)
    {
        UnityEngine.Debug.Log("Game exited");
        gameProcess?.Dispose();
        gameProcess = null;
    }

    private void OnApplicationQuit()
    {
        if (gameProcess != null && !gameProcess.HasExited)
        {
            gameProcess.CloseMainWindow();
            gameProcess.WaitForExit(3000);
            if (!gameProcess.HasExited)
            {
                gameProcess.Kill(); 
            }
            gameProcess.Dispose();
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
    
    public void setMatchHistory(int round, MatchHistoryPlayer MatchHistoryPlayer)
    {
        this.match_hitory.Add(round, new MatchHistory(MatchHistoryPlayer.opponent_username, MatchHistoryPlayer.destiny, MatchHistoryPlayer.destiny_diff, MatchHistoryPlayer.health, MatchHistoryPlayer.cultivation, MatchHistoryPlayer.used_card));
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

    public MatchHistory(string opponent_username, int destiny, int destiny_diff, int health, int cultivation, Card[] used_card)
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
