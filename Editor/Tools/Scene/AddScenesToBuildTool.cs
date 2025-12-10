using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class AddScenesToBuildTool : McpToolBase
    {
        public AddScenesToBuildTool()
        {
            Name = "add_scenes_to_build";
            Description = "Add scenes to Build Settings.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray scenePathsArray = parameters["scenePaths"] as JArray;

                if (scenePathsArray == null || scenePathsArray.Count == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "At least 1 scene path required.", "validation_error");
                }

                List<string> scenePaths = new List<string>();
                foreach (var path in scenePathsArray)
                {
                    scenePaths.Add(path.ToObject<string>());
                }

                // 获取当前构建设置中的场景
                List<EditorBuildSettingsScene> buildScenes = EditorBuildSettings.scenes.ToList();

                JArray addedArray = new JArray();
                int count = 0;

                foreach (string scenePath in scenePaths)
                {
                    // 检查场景是否已存在
                    bool exists = buildScenes.Any(s => s.path == scenePath);
                    
                    if (!exists)
                    {
                        EditorBuildSettingsScene newScene = new EditorBuildSettingsScene(scenePath, true);
                        buildScenes.Add(newScene);

                        addedArray.Add(new JObject
                        {
                            ["scenePath"] = scenePath,
                            ["enabled"] = true
                        });
                        count++;
                    }
                }

                // 更新构建设置
                EditorBuildSettings.scenes = buildScenes.ToArray();

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Added {count} scene(s) to Build Settings.",
                    ["count"] = count,
                    ["totalScenes"] = buildScenes.Count,
                    ["addedScenes"] = addedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"AddScenesToBuildTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

