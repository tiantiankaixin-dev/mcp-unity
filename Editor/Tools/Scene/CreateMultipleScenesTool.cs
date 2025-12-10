using System;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// 批量创建场景工具
    /// 可以一次性创建多个场景文件，支持自定义路径和命名模式
    /// </summary>
    public class CreateMultipleScenesTool : McpToolBase
    {
        public CreateMultipleScenesTool()
        {
            Name = "create_multiple_scenes";
            Description = "Batch create multiple Unity scenes with custom naming patterns and paths.";
            IsAsync = false;
        }

        /// <summary>
        /// 执行批量创建场景
        /// </summary>
        /// <param name="parameters">
        /// 参数：
        /// - baseName (string): 场景基础名称
        /// - count (int): 创建数量
        /// - startNumber (int, optional): 起始编号，默认 1
        /// - folderPath (string, optional): 保存路径，默认 "Assets/Scenes"
        /// - addToBuild (bool, optional): 是否添加到构建设置，默认 false
        /// </param>
        public override JObject Execute(JObject parameters)
        {
            try
            {
                // 1. 提取参数
                string baseName = parameters["baseName"]?.ToObject<string>();
                int count = parameters["count"]?.ToObject<int>() ?? 0;
                int startNumber = parameters["startNumber"]?.ToObject<int>() ?? 1;
                string folderPath = parameters["folderPath"]?.ToObject<string>() ?? "Assets/Scenes";
                bool addToBuild = parameters["addToBuild"]?.ToObject<bool>() ?? false;
                
                // 支持 sceneNames 数组参数（与 TypeScript 端保持一致）
                JArray sceneNamesArray = parameters["sceneNames"] as JArray;
                List<string> sceneNames = null;
                if (sceneNamesArray != null && sceneNamesArray.Count > 0)
                {
                    sceneNames = new List<string>();
                    foreach (var item in sceneNamesArray)
                    {
                        sceneNames.Add(item.ToObject<string>());
                    }
                }

                // 2. 参数验证 - 支持两种模式：sceneNames 或 baseName+count
                bool useSceneNames = sceneNames != null && sceneNames.Count > 0;
                bool useBaseName = !string.IsNullOrEmpty(baseName) && count > 0;
                
                if (!useSceneNames && !useBaseName)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "Either 'sceneNames' array or 'baseName' with 'count' is required.",
                        "validation_error"
                    );
                }

                // 如果使用 sceneNames，设置 count
                if (useSceneNames)
                {
                    count = sceneNames.Count;
                }

                if (count <= 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "'count' must be greater than 0.",
                        "validation_error"
                    );
                }

                if (count > 100)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "'count' cannot exceed 100 for safety reasons.",
                        "validation_error"
                    );
                }

                // Auto-prepend "Assets/" if not already present
                if (!folderPath.StartsWith("Assets/") && !folderPath.StartsWith("Assets\\") && folderPath != "Assets")
                {
                    folderPath = "Assets/" + folderPath;
                }

                // 3. 确保文件夹存在
                if (!AssetDatabase.IsValidFolder(folderPath))
                {
                    // 创建文件夹路径
                    string[] folders = folderPath.Split('/');
                    string currentPath = folders[0]; // "Assets"
                    
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

                // 4. 批量创建场景
                JArray createdScenesArray = new JArray();
                List<string> createdScenePaths = new List<string>();

                for (int i = 0; i < count; i++)
                {
                    string sceneName;
                    int sceneNumber = startNumber + i;
                    
                    // 根据模式生成场景名称
                    if (useSceneNames)
                    {
                        sceneName = sceneNames[i];
                    }
                    else
                    {
                        sceneName = $"{baseName}{sceneNumber}";
                    }
                    
                    string scenePath = $"{folderPath}/{sceneName}.unity";

                    // 检查场景是否已存在（使用AssetDatabase而不是File.Exists）
                    if (AssetDatabase.LoadAssetAtPath<UnityEngine.Object>(scenePath) != null)
                    {
                        McpLogger.LogWarning($"Scene already exists: {scenePath}, skipping...");
                        continue;
                    }

                    // 创建新场景
                    var newScene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Additive);
                    
                    // 保存场景
                    bool saved = EditorSceneManager.SaveScene(newScene, scenePath);
                    
                    if (saved)
                    {
                        createdScenePaths.Add(scenePath);
                        createdScenesArray.Add(new JObject
                        {
                            ["name"] = sceneName,
                            ["path"] = scenePath,
                            ["number"] = sceneNumber
                        });

                        McpLogger.LogInfo($"Created scene: {scenePath}");
                    }
                    else
                    {
                        McpLogger.LogError($"Failed to save scene: {scenePath}");
                    }

                    // 关闭场景（保持编辑器整洁）
                    EditorSceneManager.CloseScene(newScene, true);
                }

                // 5. 添加到构建设置（如果需要）
                if (addToBuild && createdScenePaths.Count > 0)
                {
                    List<EditorBuildSettingsScene> buildScenes = new List<EditorBuildSettingsScene>(EditorBuildSettings.scenes);
                    
                    foreach (string scenePath in createdScenePaths)
                    {
                        // 检查是否已在构建设置中
                        bool alreadyInBuild = false;
                        foreach (var buildScene in buildScenes)
                        {
                            if (buildScene.path == scenePath)
                            {
                                alreadyInBuild = true;
                                break;
                            }
                        }

                        if (!alreadyInBuild)
                        {
                            buildScenes.Add(new EditorBuildSettingsScene(scenePath, true));
                        }
                    }

                    EditorBuildSettings.scenes = buildScenes.ToArray();
                    McpLogger.LogInfo($"Added {createdScenePaths.Count} scenes to build settings.");
                }

                // 6. 刷新资源数据库
                AssetDatabase.Refresh();

                // 7. 返回成功结果
                string message = $"Successfully created {createdScenePaths.Count} scene(s) in '{folderPath}'.";
                if (addToBuild)
                {
                    message += $" Added to build settings.";
                }

                McpLogger.LogInfo($"CreateMultipleScenesTool: {message}");

                return new JObject
                {
                    ["success"] = true,
                    ["type"] = "text",
                    ["message"] = message,
                    ["createdCount"] = createdScenePaths.Count,
                    ["folderPath"] = folderPath,
                    ["addedToBuild"] = addToBuild,
                    ["scenes"] = createdScenesArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateMultipleScenesTool error: {ex.Message}\n{ex.StackTrace}");
                return McpUnitySocketHandler.CreateErrorResponse(
                    $"Failed to create scenes: {ex.Message}",
                    "execution_error"
                );
            }
        }
    }
}

