using System;
using System.IO;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class GeneratePrefabVariantsTool : McpToolBase
    {
        public GeneratePrefabVariantsTool()
        {
            Name = "generate_prefab_variants";
            Description = "Generate multiple prefab variants from a base prefab.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string basePrefabPath = parameters["basePrefabPath"]?.ToObject<string>();
                int count = parameters["count"]?.ToObject<int>() ?? 1;
                string outputFolder = parameters["outputFolder"]?.ToObject<string>() ?? "Assets/Prefabs/Variants";
                string namePrefix = parameters["namePrefix"]?.ToObject<string>() ?? "Variant_";

                if (string.IsNullOrEmpty(basePrefabPath))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "'basePrefabPath' is required.", "validation_error");
                }

                GameObject basePrefab = AssetDatabase.LoadAssetAtPath<GameObject>(basePrefabPath);
                if (basePrefab == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Base prefab not found: {basePrefabPath}", "validation_error");
                }

                // 确保输出文件夹存在
                if (!AssetDatabase.IsValidFolder(outputFolder))
                {
                    string[] folders = outputFolder.Split('/');
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

                JArray variantsArray = new JArray();
                for (int i = 0; i < count; i++)
                {
                    string variantName = $"{namePrefix}{i + 1}";
                    string variantPath = Path.Combine(outputFolder, variantName + ".prefab").Replace("\\", "/");

                    GameObject variant = (GameObject)PrefabUtility.InstantiatePrefab(basePrefab);
                    variant.name = variantName;

                    PrefabUtility.SaveAsPrefabAsset(variant, variantPath);
                    UnityEngine.Object.DestroyImmediate(variant);

                    variantsArray.Add(new JObject
                    {
                        ["name"] = variantName,
                        ["path"] = variantPath
                    });
                }

                AssetDatabase.Refresh();

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Generated {count} prefab variant(s).",
                    ["count"] = count,
                    ["variants"] = variantsArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"GeneratePrefabVariantsTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

