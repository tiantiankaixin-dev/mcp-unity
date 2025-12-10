using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Tool to control Play mode in the Unity Editor
    /// Based on Unity API: EditorApplication.isPlaying, EnterPlaymode, ExitPlaymode
    /// https://docs.unity3d.com/ScriptReference/EditorApplication.EnterPlaymode.html
    /// </summary>
    public class PlayModeTool : McpToolBase
    {
        public PlayModeTool()
        {
            Name = "play_mode";
            Description = "Control Play mode: enter, exit, pause, or get status.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string action = parameters["action"]?.ToObject<string>()?.ToLower() ?? "status";

                bool wasPlaying = EditorApplication.isPlaying;
                bool wasPaused = EditorApplication.isPaused;

                switch (action)
                {
                    case "enter":
                    case "play":
                    case "start":
                        if (!EditorApplication.isPlaying)
                        {
                            EditorApplication.EnterPlaymode();
                            return new JObject
                            {
                                ["success"] = true,
                                ["message"] = "Entering Play mode...",
                                ["action"] = "enter",
                                ["isPlaying"] = true,
                                ["isPaused"] = false
                            };
                        }
                        else
                        {
                            return new JObject
                            {
                                ["success"] = true,
                                ["message"] = "Already in Play mode.",
                                ["action"] = "enter",
                                ["isPlaying"] = true,
                                ["isPaused"] = EditorApplication.isPaused
                            };
                        }

                    case "exit":
                    case "stop":
                        if (EditorApplication.isPlaying)
                        {
                            EditorApplication.ExitPlaymode();
                            return new JObject
                            {
                                ["success"] = true,
                                ["message"] = "Exiting Play mode...",
                                ["action"] = "exit",
                                ["isPlaying"] = false,
                                ["isPaused"] = false
                            };
                        }
                        else
                        {
                            return new JObject
                            {
                                ["success"] = true,
                                ["message"] = "Already in Edit mode.",
                                ["action"] = "exit",
                                ["isPlaying"] = false,
                                ["isPaused"] = false
                            };
                        }

                    case "pause":
                        if (EditorApplication.isPlaying)
                        {
                            EditorApplication.isPaused = !EditorApplication.isPaused;
                            string pauseMsg = EditorApplication.isPaused ? "Paused" : "Resumed";
                            return new JObject
                            {
                                ["success"] = true,
                                ["message"] = $"{pauseMsg} Play mode.",
                                ["action"] = "pause",
                                ["isPlaying"] = true,
                                ["isPaused"] = EditorApplication.isPaused
                            };
                        }
                        else
                        {
                            return McpUnitySocketHandler.CreateErrorResponse(
                                "Cannot pause - not in Play mode.",
                                "validation_error");
                        }

                    case "step":
                        if (EditorApplication.isPlaying && EditorApplication.isPaused)
                        {
                            EditorApplication.Step();
                            return new JObject
                            {
                                ["success"] = true,
                                ["message"] = "Stepped one frame.",
                                ["action"] = "step",
                                ["isPlaying"] = true,
                                ["isPaused"] = true
                            };
                        }
                        else
                        {
                            return McpUnitySocketHandler.CreateErrorResponse(
                                "Step requires Play mode to be paused.",
                                "validation_error");
                        }

                    case "status":
                    default:
                        return new JObject
                        {
                            ["success"] = true,
                            ["message"] = EditorApplication.isPlaying 
                                ? (EditorApplication.isPaused ? "Play mode (Paused)" : "Play mode (Running)")
                                : "Edit mode",
                            ["action"] = "status",
                            ["isPlaying"] = EditorApplication.isPlaying,
                            ["isPaused"] = EditorApplication.isPaused
                        };
                }
            }
            catch (Exception ex)
            {
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}
