using System;
using System.IO;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateMaterialTool : McpToolBase
    {
        public CreateMaterialTool()
        {
            Name = "create_material";
            Description = "Create a new Material asset with custom shader and color.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string materialName = parameters["materialName"]?.ToObject<string>() ?? "NewMaterial";
                string savePath = parameters["savePath"]?.ToObject<string>() ?? "Assets/Materials";
                string shaderName = parameters["shaderName"]?.ToObject<string>() ?? "Standard";
                string colorHex = parameters["color"]?.ToObject<string>() ?? "#FFFFFF";

                // 确保保存路径存在 (自动补全 Assets/ 前缀)
                savePath = McpUtils.EnsureFolderExists(savePath);

                Shader shader = Shader.Find(shaderName);
                if (shader == null)
                {
                    shader = Shader.Find("Standard");
                }

                Material material = new Material(shader);
                material.name = materialName;

                // 设置颜色
                if (ColorUtility.TryParseHtmlString(colorHex, out Color color))
                {
                    if (material.HasProperty("_Color"))
                    {
                        material.SetColor("_Color", color);
                    }
                }

                string fullPath = Path.Combine(savePath, materialName + ".mat").Replace("\\", "/");
                AssetDatabase.CreateAsset(material, fullPath);
                AssetDatabase.SaveAssets();
                AssetDatabase.Refresh();

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created Material '{materialName}' at '{fullPath}'.",
                    ["materialName"] = materialName,
                    ["path"] = fullPath,
                    ["shaderName"] = shaderName
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateMaterialTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

