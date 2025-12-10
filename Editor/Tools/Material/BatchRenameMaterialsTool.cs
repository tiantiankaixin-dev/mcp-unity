using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class BatchRenameMaterialsTool : McpToolBase
    {
        public BatchRenameMaterialsTool()
        {
            Name = "batch_rename_materials";
            Description = "Batch rename materials in a folder with pattern and numbering.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string folderPath = parameters["folderPath"]?.ToObject<string>() ?? "Assets";
                string newNamePrefix = parameters["newNamePrefix"]?.ToObject<string>() ?? "Material_";
                int startNumber = parameters["startNumber"]?.ToObject<int>() ?? 1;

                string[] materialGuids = AssetDatabase.FindAssets("t:Material", new[] { folderPath });
                JArray renamedArray = new JArray();
                int count = 0;

                for (int i = 0; i < materialGuids.Length; i++)
                {
                    string path = AssetDatabase.GUIDToAssetPath(materialGuids[i]);
                    Material mat = AssetDatabase.LoadAssetAtPath<Material>(path);
                    
                    if (mat != null)
                    {
                        string oldName = mat.name;
                        string newName = $"{newNamePrefix}{startNumber + i}";
                        
                        string error = AssetDatabase.RenameAsset(path, newName);
                        if (string.IsNullOrEmpty(error))
                        {
                            renamedArray.Add(new JObject
                            {
                                ["oldName"] = oldName,
                                ["newName"] = newName,
                                ["path"] = path
                            });
                            count++;
                        }
                    }
                }

                AssetDatabase.SaveAssets();
                AssetDatabase.Refresh();

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Renamed {count} material(s) in '{folderPath}'.",
                    ["count"] = count,
                    ["renamedMaterials"] = renamedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"BatchRenameMaterialsTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

