using UnityEngine;
using System.Collections;

public class GuiLogger : MonoBehaviour
{
    uint QueueSize = 10;
    Queue logs = new Queue();

    void Start()
    {
    }

    void OnEnable()
    {
        Application.logMessageReceived += HandleLog;
    }

    void OnDisable()
    {
        Application.logMessageReceived -= HandleLog;
    }

    void HandleLog(string logString, string stackTrace, LogType type)
    {
        logs.Enqueue("[" + type + "] : " + logString);
        while (logs.Count > QueueSize)
        {
            logs.Dequeue();
        }
    }

    void OnGUI()
    {
        GUILayout.BeginArea(new Rect(5, Screen.height - 185, Screen.width - 10, 180));
        GUILayout.Label("\n" + string.Join("\n", logs.ToArray()));
        GUILayout.EndArea();
    }
}
