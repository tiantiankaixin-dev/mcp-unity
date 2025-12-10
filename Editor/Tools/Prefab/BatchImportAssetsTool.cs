using System;
using System.IO;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class BatchImportAssetsTool : McpToolBase
    {
        public BatchImportAssetsTool()
        {
            Name = "batch_import_assets";
            Description = "Import multiple assets from external folder to Unity project.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string sourceFolderPath = parameters["sourceFolderPath"]?.ToObject<string>();
                string targetFolderPath = parameters["targetFolderPath"]?.ToObject<string>() ?? "Assets/Imported";
                string filePattern = parameters["filePattern"]?.ToObject<string>() ?? "*.*";

                if (string.IsNullOrEmpty(sourceFolderPath) || !Directory.Exists(sourceFolderPath))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "Invalid source folder path.", "validation_error");
                }

                // 确保目标文件夹存在
                if (!AssetDatabase.IsValidFolder(targetFolderPath))
                {
                    string[] folders = targetFolderPath.Split('/');
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

                string[] files = Directory.GetFiles(sourceFolderPath, filePattern, SearchOption.AllDirectories);
                JArray importedArray = new JArray();
                int count = 0;

                foreach (string file in files)
                {
                    string fileName = Path.GetFileName(file);
                    string targetPath = Path.Combine(targetFolderPath, fileName).Replace("\\", "/");

                    try
                    {
                        File.Copy(file, targetPath, true);
                        AssetDatabase.ImportAsset(targetPath);
                        
                        importedArray.Add(new JObject
                        {
                            ["fileName"] = fileName,
                            ["targetPath"] = targetPath
                        });
                        count++;
                    }
                    catch (Exception ex)
                    {
                        McpLogger.LogWarning($"Failed to import {fileName}: {ex.Message}");
                    }
                }

                AssetDatabase.Refresh();

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Imported {count} asset(s) to '{targetFolderPath}'.",
                    ["count"] = count,
                    ["importedAssets"] = importedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"BatchImportAssetsTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

