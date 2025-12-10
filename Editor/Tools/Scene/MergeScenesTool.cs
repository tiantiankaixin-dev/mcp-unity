using System;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.SceneManagement;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// 合并场景工具
    /// 将多个场景合并到一个目标场景中
    /// </summary>
    public class MergeScenesTool : McpToolBase
    {
        public MergeScenesTool()
        {
            Name = "merge_scenes";
            Description = "Merge multiple Unity scenes into a single target scene.";
            IsAsync = false;
        }

        /// <summary>
        /// 执行场景合并
        /// </summary>
        /// <param name="parameters">
        /// 参数：
        /// - sourceScenePaths (string[]): 源场景路径数组
        /// - targetScenePath (string): 目标场景路径
        /// - createNew (bool, optional): 是否创建新场景作为目标，默认 false
        /// - saveAfterMerge (bool, optional): 合并后是否保存，默认 true
        /// </param>
        public override JObject Execute(JObject parameters)
        {
            try
            {
                // 1. 提取参数
                JArray sourceScenePathsArray = parameters["sourceScenePaths"] as JArray;
                string targetScenePath = parameters["targetScenePath"]?.ToObject<string>();
                bool createNew = parameters["createNew"]?.ToObject<bool>() ?? false;
                bool saveAfterMerge = parameters["saveAfterMerge"]?.ToObject<bool>() ?? true;

                // 2. 参数验证
                if (sourceScenePathsArray == null || sourceScenePathsArray.Count == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "'sourceScenePaths' parameter is required and must contain at least one scene path.",
                        "validation_error"
                    );
                }

                if (string.IsNullOrEmpty(targetScenePath))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "'targetScenePath' parameter is required.",
                        "validation_error"
                    );
                }

                // 转换为字符串列表
                List<string> sourceScenePaths = new List<string>();
                foreach (var item in sourceScenePathsArray)
                {
                    string path = item.ToObject<string>();
                    if (!string.IsNullOrEmpty(path))
                    {
                        sourceScenePaths.Add(path);
                    }
                }

                if (sourceScenePaths.Count == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "No valid source scene paths provided.",
                        "validation_error"
                    );
                }

                // 3. 验证源场景是否存在
                foreach (string scenePath in sourceScenePaths)
                {
                    if (!File.Exists(scenePath))
                    {
                        return McpUnitySocketHandler.CreateErrorResponse(
                            $"Source scene not found: {scenePath}",
                            "validation_error"
                        );
                    }
                }

                // 4. 处理目标场景
                Scene targetScene;
                
                if (createNew)
                {
                    // 创建新场景作为目标
                    targetScene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
                    
                    // 确保目标路径的文件夹存在
                    string targetFolder = Path.GetDirectoryName(targetScenePath);
                    if (!string.IsNullOrEmpty(targetFolder) && !AssetDatabase.IsValidFolder(targetFolder))
                    {
                        // 创建文件夹
                        string[] folders = targetFolder.Split('/');
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
                }
                else
                {
                    // 使用现有场景或创建
                    if (File.Exists(targetScenePath))
                    {
                        targetScene = EditorSceneManager.OpenScene(targetScenePath, OpenSceneMode.Single);
                    }
                    else
                    {
                        targetScene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
                    }
                }

                // 5. 合并源场景
                JArray mergedScenesArray = new JArray();
                int totalObjectsMerged = 0;

                foreach (string sourceScenePath in sourceScenePaths)
                {
                    // 以附加模式打开源场景
                    Scene sourceScene = EditorSceneManager.OpenScene(sourceScenePath, OpenSceneMode.Additive);
                    
                    // 获取源场景的所有根对象
                    GameObject[] rootObjects = sourceScene.GetRootGameObjects();
                    int objectCount = rootObjects.Length;
                    totalObjectsMerged += objectCount;

                    // 将所有根对象移动到目标场景
                    foreach (GameObject obj in rootObjects)
                    {
                        SceneManager.MoveGameObjectToScene(obj, targetScene);
                    }

                    // 记录合并信息
                    mergedScenesArray.Add(new JObject
                    {
                        ["path"] = sourceScenePath,
                        ["name"] = sourceScene.name,
                        ["objectCount"] = objectCount
                    });

                    // 关闭源场景（不保存）
                    EditorSceneManager.CloseScene(sourceScene, false);

                    McpLogger.LogInfo($"Merged scene: {sourceScenePath} ({objectCount} objects)");
                }

                // 6. 保存目标场景
                if (saveAfterMerge)
                {
                    bool saved = EditorSceneManager.SaveScene(targetScene, targetScenePath);
                    if (!saved)
                    {
                        return McpUnitySocketHandler.CreateErrorResponse(
                            $"Failed to save merged scene to: {targetScenePath}",
                            "execution_error"
                        );
                    }
                }

                // 7. 刷新资源数据库
                AssetDatabase.Refresh();

                // 8. 返回成功结果
                string message = $"Successfully merged {sourceScenePaths.Count} scene(s) into '{targetScenePath}'. Total objects: {totalObjectsMerged}.";
                
                McpLogger.LogInfo($"MergeScenesTool: {message}");

                return new JObject
                {
                    ["success"] = true,
                    ["type"] = "text",
                    ["message"] = message,
                    ["targetScenePath"] = targetScenePath,
                    ["mergedSceneCount"] = sourceScenePaths.Count,
                    ["totalObjectsMerged"] = totalObjectsMerged,
                    ["saved"] = saveAfterMerge,
                    ["mergedScenes"] = mergedScenesArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"MergeScenesTool error: {ex.Message}\n{ex.StackTrace}");
                return McpUnitySocketHandler.CreateErrorResponse(
                    $"Failed to merge scenes: {ex.Message}",
                    "execution_error"
                );
            }
        }
    }
}

