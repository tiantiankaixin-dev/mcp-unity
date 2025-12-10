using System;
using System.IO;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// 复制场景工具
    /// 复制现有场景到新位置
    /// </summary>
    public class DuplicateSceneTool : McpToolBase
    {
        public DuplicateSceneTool()
        {
            Name = "duplicate_scene";
            Description = "Duplicate an existing Unity scene to a new location.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                // 支持 scenePath 作为 sourceScenePath 的别名
                string sourceScenePath = parameters["sourceScenePath"]?.ToObject<string>() 
                    ?? parameters["scenePath"]?.ToObject<string>();
                string targetScenePath = parameters["targetScenePath"]?.ToObject<string>();
                string newSceneName = parameters["newSceneName"]?.ToObject<string>();
                bool overwrite = parameters["overwrite"]?.ToObject<bool>() ?? false;

                if (string.IsNullOrEmpty(sourceScenePath))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "'sourceScenePath' or 'scenePath' is required.", "validation_error");
                }

                // 如果没有 targetScenePath 但有 newSceneName，则自动构建目标路径
                if (string.IsNullOrEmpty(targetScenePath) && !string.IsNullOrEmpty(newSceneName))
                {
                    int lastSlash = sourceScenePath.LastIndexOf('/');
                    if (lastSlash > 0)
                    {
                        string folder = sourceScenePath.Substring(0, lastSlash);
                        // 确保 newSceneName 有 .unity 扩展名
                        if (!newSceneName.EndsWith(".unity"))
                        {
                            newSceneName += ".unity";
                        }
                        targetScenePath = $"{folder}/{newSceneName}";
                    }
                }

                if (string.IsNullOrEmpty(targetScenePath))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "'targetScenePath' or 'newSceneName' is required.", "validation_error");
                }

                if (!File.Exists(sourceScenePath))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Source scene not found: {sourceScenePath}", "validation_error");
                }

                if (File.Exists(targetScenePath) && !overwrite)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Target scene already exists: {targetScenePath}. Set 'overwrite' to true to replace.", 
                        "validation_error");
                }

                // 确保目标文件夹存在
                string targetFolder = Path.GetDirectoryName(targetScenePath);
                if (!string.IsNullOrEmpty(targetFolder) && !AssetDatabase.IsValidFolder(targetFolder))
                {
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

                // 复制场景文件
                bool success = AssetDatabase.CopyAsset(sourceScenePath, targetScenePath);
                
                if (!success)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Failed to duplicate scene from {sourceScenePath} to {targetScenePath}", 
                        "execution_error");
                }

                AssetDatabase.Refresh();

                return new JObject
                {
                    ["success"] = true,
                    ["type"] = "text",
                    ["message"] = $"Successfully duplicated scene to '{targetScenePath}'.",
                    ["sourceScenePath"] = sourceScenePath,
                    ["targetScenePath"] = targetScenePath
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"DuplicateSceneTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

