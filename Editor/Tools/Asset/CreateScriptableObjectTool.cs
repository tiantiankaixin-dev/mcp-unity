using System;
using System.IO;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateScriptableObjectTool : McpToolBase
    {
        public CreateScriptableObjectTool()
        {
            Name = "create_scriptable_object";
            Description = "Create a ScriptableObject asset for data storage.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string assetName = parameters["assetName"]?.ToObject<string>() ?? "NewScriptableObject";
                string savePath = parameters["savePath"]?.ToObject<string>() ?? "Assets/ScriptableObjects";
                string typeName = parameters["typeName"]?.ToObject<string>();

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

                ScriptableObject asset;
                
                if (!string.IsNullOrEmpty(typeName))
                {
                    // 尝试根据类型名创建
                    System.Type type = System.Type.GetType(typeName);
                    if (type != null && type.IsSubclassOf(typeof(ScriptableObject)))
                    {
                        asset = ScriptableObject.CreateInstance(type);
                    }
                    else
                    {
                        // 如果类型不存在，创建基础ScriptableObject
                        asset = ScriptableObject.CreateInstance<ScriptableObject>();
                    }
                }
                else
                {
                    asset = ScriptableObject.CreateInstance<ScriptableObject>();
                }

                string fullPath = Path.Combine(savePath, assetName + ".asset").Replace("\\", "/");
                AssetDatabase.CreateAsset(asset, fullPath);
                AssetDatabase.SaveAssets();
                AssetDatabase.Refresh();

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created ScriptableObject '{assetName}' at '{fullPath}'.",
                    ["assetName"] = assetName,
                    ["path"] = fullPath,
                    ["typeName"] = asset.GetType().Name
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateScriptableObjectTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

