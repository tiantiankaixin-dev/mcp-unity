using System;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class FindUnusedAssetsTool : McpToolBase
    {
        public FindUnusedAssetsTool()
        {
            Name = "find_unused_assets";
            Description = "Find assets that are not referenced in any scene or prefab.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string folderPath = parameters["folderPath"]?.ToObject<string>() ?? "Assets";
                bool includeScripts = parameters["includeScripts"]?.ToObject<bool>() ?? false;

                string[] allAssetPaths = AssetDatabase.GetAllAssetPaths();
                HashSet<string> usedAssets = new HashSet<string>();

                // 收集所有场景中使用的资源
                string[] scenePaths = AssetDatabase.FindAssets("t:Scene");
                foreach (string sceneGuid in scenePaths)
                {
                    string scenePath = AssetDatabase.GUIDToAssetPath(sceneGuid);
                    string[] dependencies = AssetDatabase.GetDependencies(scenePath, true);
                    foreach (string dep in dependencies)
                    {
                        usedAssets.Add(dep);
                    }
                }

                // 收集所有预制体中使用的资源
                string[] prefabPaths = AssetDatabase.FindAssets("t:Prefab");
                foreach (string prefabGuid in prefabPaths)
                {
                    string prefabPath = AssetDatabase.GUIDToAssetPath(prefabGuid);
                    string[] dependencies = AssetDatabase.GetDependencies(prefabPath, true);
                    foreach (string dep in dependencies)
                    {
                        usedAssets.Add(dep);
                    }
                }

                // 查找未使用的资源
                JArray unusedArray = new JArray();
                int count = 0;

                foreach (string assetPath in allAssetPaths)
                {
                    if (!assetPath.StartsWith(folderPath)) continue;
                    if (assetPath.EndsWith(".cs") && !includeScripts) continue;
                    if (assetPath.EndsWith(".meta")) continue;
                    if (Directory.Exists(assetPath)) continue;

                    if (!usedAssets.Contains(assetPath))
                    {
                        FileInfo fileInfo = new FileInfo(assetPath);
                        unusedArray.Add(new JObject
                        {
                            ["path"] = assetPath,
                            ["name"] = Path.GetFileName(assetPath),
                            ["size"] = fileInfo.Length,
                            ["type"] = Path.GetExtension(assetPath)
                        });
                        count++;
                    }
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Found {count} unused asset(s) in '{folderPath}'.",
                    ["count"] = count,
                    ["unusedAssets"] = unusedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"FindUnusedAssetsTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

