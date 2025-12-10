using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateFolderStructureTool : McpToolBase
    {
        public CreateFolderStructureTool()
        {
            Name = "create_folder_structure";
            Description = "Create a standard folder structure for Unity projects.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string rootPath = parameters["rootPath"]?.ToObject<string>() ?? "Assets";
                JArray folderNamesArray = parameters["folderNames"] as JArray;

                // 确保 rootPath 以 "Assets" 开头
                if (!rootPath.StartsWith("Assets"))
                {
                    rootPath = "Assets/" + rootPath;
                }

                // 首先确保 rootPath 存在
                if (!AssetDatabase.IsValidFolder(rootPath) && rootPath != "Assets")
                {
                    // 递归创建 rootPath
                    string[] parts = rootPath.Split('/');
                    string currentPath = parts[0]; // "Assets"
                    for (int i = 1; i < parts.Length; i++)
                    {
                        string newPath = currentPath + "/" + parts[i];
                        if (!AssetDatabase.IsValidFolder(newPath))
                        {
                            AssetDatabase.CreateFolder(currentPath, parts[i]);
                        }
                        currentPath = newPath;
                    }
                }

                string[] defaultFolders = new string[]
                {
                    "Scripts", "Prefabs", "Materials", "Textures", "Scenes",
                    "Audio", "Animations", "Models", "Fonts", "Resources"
                };

                string[] foldersToCreate = defaultFolders;
                
                if (folderNamesArray != null && folderNamesArray.Count > 0)
                {
                    foldersToCreate = new string[folderNamesArray.Count];
                    for (int i = 0; i < folderNamesArray.Count; i++)
                    {
                        foldersToCreate[i] = folderNamesArray[i].ToObject<string>();
                    }
                }

                JArray createdArray = new JArray();
                JArray skippedArray = new JArray();
                int count = 0;

                foreach (string folderName in foldersToCreate)
                {
                    string folderPath = rootPath + "/" + folderName;
                    
                    if (!AssetDatabase.IsValidFolder(folderPath))
                    {
                        string guid = AssetDatabase.CreateFolder(rootPath, folderName);
                        if (!string.IsNullOrEmpty(guid))
                        {
                            createdArray.Add(new JObject
                            {
                                ["folderName"] = folderName,
                                ["path"] = folderPath
                            });
                            count++;
                            McpLogger.LogInfo($"Created folder: {folderPath}");
                        }
                        else
                        {
                            McpLogger.LogWarning($"Failed to create folder: {folderPath}");
                        }
                    }
                    else
                    {
                        // 文件夹已存在
                        skippedArray.Add(new JObject
                        {
                            ["folderName"] = folderName,
                            ["path"] = folderPath,
                            ["reason"] = "already exists"
                        });
                    }
                }

                AssetDatabase.Refresh();

                string message = $"Created {count} folder(s) in '{rootPath}'.";
                if (skippedArray.Count > 0)
                {
                    message += $" Skipped {skippedArray.Count} folder(s) (already exist).";
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = message,
                    ["count"] = count,
                    ["createdFolders"] = createdArray,
                    ["skippedFolders"] = skippedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateFolderStructureTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

