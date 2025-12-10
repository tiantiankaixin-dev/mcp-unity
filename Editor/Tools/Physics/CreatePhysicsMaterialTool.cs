using System;
using System.IO;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    // Unity 2023.3+ renamed PhysicMaterial to PhysicsMaterial
    // and PhysicMaterialCombine to PhysicsMaterialCombine
#if UNITY_2023_3_OR_NEWER
    using PhysicMaterialType = UnityEngine.PhysicsMaterial;
    using CombineMode = UnityEngine.PhysicsMaterialCombine;
#else
    using PhysicMaterialType = UnityEngine.PhysicMaterial;
    using CombineMode = UnityEngine.PhysicMaterialCombine;
#endif
    /// <summary>
    /// Creates a new PhysicMaterial asset with friction and bounciness properties
    /// Unity API: https://docs.unity3d.com/ScriptReference/PhysicMaterial.html
    /// </summary>
    public class CreatePhysicsMaterialTool : McpToolBase
    {
        public CreatePhysicsMaterialTool()
        {
            Name = "create_physics_material";
            Description = "Create a new PhysicMaterial asset with friction and bounciness properties";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string materialName = parameters["materialName"]?.ToString();
                string savePath = parameters["savePath"]?.ToString() ?? "Assets/Physics";
                float dynamicFriction = parameters["dynamicFriction"]?.ToObject<float>() ?? 0.6f;
                float staticFriction = parameters["staticFriction"]?.ToObject<float>() ?? 0.6f;
                string frictionCombine = parameters["frictionCombine"]?.ToString() ?? "Average";
                float bounciness = parameters["bounciness"]?.ToObject<float>() ?? 0f;
                string bounceCombine = parameters["bounceCombine"]?.ToString() ?? "Average";

                if (string.IsNullOrEmpty(materialName))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "materialName is required", "validation_error");
                }

                // Ensure directory exists
                if (!Directory.Exists(savePath))
                {
                    Directory.CreateDirectory(savePath);
                    AssetDatabase.Refresh();
                }

                // Create PhysicMaterial (Unity 2023.3+ renamed to PhysicsMaterial)
                PhysicMaterialType material = new PhysicMaterialType(materialName);
                material.dynamicFriction = Mathf.Clamp01(dynamicFriction);
                material.staticFriction = Mathf.Clamp01(staticFriction);
                material.bounciness = Mathf.Clamp01(bounciness);
                
                // Set combine modes
                material.frictionCombine = ParseCombineMode(frictionCombine);
                material.bounceCombine = ParseCombineMode(bounceCombine);

                // Save asset
                string assetPath = Path.Combine(savePath, materialName + ".physicMaterial");
                assetPath = AssetDatabase.GenerateUniqueAssetPath(assetPath);
                AssetDatabase.CreateAsset(material, assetPath);
                AssetDatabase.SaveAssets();
                AssetDatabase.Refresh();

                McpLogger.LogInfo($"Created PhysicMaterial: {materialName} at {assetPath}");

                return new JObject
                {
                    ["success"] = true,
                    ["materialPath"] = assetPath,
                    ["materialName"] = materialName,
                    ["properties"] = new JObject
                    {
                        ["dynamicFriction"] = material.dynamicFriction,
                        ["staticFriction"] = material.staticFriction,
                        ["bounciness"] = material.bounciness,
                        ["frictionCombine"] = material.frictionCombine.ToString(),
                        ["bounceCombine"] = material.bounceCombine.ToString()
                    }
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreatePhysicsMaterialTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }

        private CombineMode ParseCombineMode(string mode)
        {
            switch (mode)
            {
                case "Average": return CombineMode.Average;
                case "Minimum": return CombineMode.Minimum;
                case "Maximum": return CombineMode.Maximum;
                case "Multiply": return CombineMode.Multiply;
                default: return CombineMode.Average;
            }
        }
    }
}
