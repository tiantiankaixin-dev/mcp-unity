using System;
using System.IO;
using UnityEngine;
using UnityEditor;
using UnityEngine.Timeline;
using UnityEngine.Playables;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateTimelineTool : McpToolBase
    {
        public CreateTimelineTool()
        {
            Name = "create_timeline";
            Description = "Create a Timeline asset and PlayableDirector for cutscenes and sequences.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string timelineName = parameters["timelineName"]?.ToObject<string>() ?? "NewTimeline";
                string savePath = parameters["savePath"]?.ToObject<string>() ?? "Assets/Timelines";
                bool createDirector = parameters["createDirector"]?.ToObject<bool>() ?? true;

                // 确保保存路径存在
                if (!AssetDatabase.IsValidFolder(savePath))
                {
                    string[] folders = savePath.Split('/');
                    string currentPath = folders[0];
                    for (int i = 1; i < folders.Length; i++)
                    {
                        string newPath = currentPath + "/" + folders[i];
                        if (!AssetDatabase.IsValidFolder(newPath))
                        {
                            AssetDatabase.CreateFolder(currentPath, folders[i]);
                        }
                        currentPath = newPath;
                    }
                }

                // 创建Timeline资源
                TimelineAsset timeline = ScriptableObject.CreateInstance<TimelineAsset>();
                string fullPath = Path.Combine(savePath, timelineName + ".playable").Replace("\\", "/");
                AssetDatabase.CreateAsset(timeline, fullPath);
                AssetDatabase.SaveAssets();

                GameObject directorObj = null;
                if (createDirector)
                {
                    directorObj = new GameObject(timelineName + "_Director");
                    PlayableDirector director = directorObj.AddComponent<PlayableDirector>();
                    director.playableAsset = timeline;
                    Undo.RegisterCreatedObjectUndo(directorObj, "Create Timeline Director");
                }

                AssetDatabase.Refresh();

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created Timeline '{timelineName}' at '{fullPath}'.",
                    ["timelineName"] = timelineName,
                    ["path"] = fullPath,
                    ["directorCreated"] = createDirector,
                    ["directorInstanceId"] = directorObj != null ? directorObj.GetInstanceID() : 0
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateTimelineTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

