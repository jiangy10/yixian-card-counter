using System.IO;
using UnityEngine;

public static class Functions
{
    public static T LoadJson<T>(string filePath) where T : class
    {
        if (File.Exists(filePath))
        {
            try
            {
                string jsonContent = File.ReadAllText(filePath);
                return JsonUtility.FromJson<T>(jsonContent);
            }
            catch (System.Exception ex)
            {
                Debug.LogError($"Failed to load or parse JSON file at {filePath}: {ex.Message}");
                return null;
            }
        }
        else
        {
            Debug.LogError($"JSON file not found: {filePath}");
            return null;
        }
    }
}
