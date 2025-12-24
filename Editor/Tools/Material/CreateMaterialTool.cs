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

                // ✅ 支持两种颜色格式
                Color color = Color.white;
                if (parameters["color"] != null)
                {
                    var colorToken = parameters["color"];
                    if (colorToken.Type == JTokenType.Array)
                    {
                        // 数组格式: color: [r, g, b, a] (0-1 范围)
                        var rgba = colorToken.ToObject<float[]>();
                        if (rgba.Length >= 3)
                        {
                            color = new Color(
                                rgba[0],
                                rgba[1],
                                rgba[2],
                                rgba.Length > 3 ? rgba[3] : 1f
                            );
                        }
                    }
                    else if (colorToken.Type == JTokenType.String)
                    {
                        // 字符串格式: color: "#FF0000"
                        string colorHex = colorToken.ToObject<string>();
                        if (!ColorUtility.TryParseHtmlString(colorHex, out color))
                        {
                            color = Color.white;
                        }
                    }
                }

                // 获取 metallic 和 smoothness 参数
                float metallic = parameters["metallic"]?.ToObject<float>() ?? 0f;
                float smoothness = parameters["smoothness"]?.ToObject<float>() ?? 0.5f;

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
                if (material.HasProperty("_Color"))
                {
                    material.SetColor("_Color", color);
                }

                // 设置 metallic 和 smoothness (仅对 Standard shader)
                if (shaderName == "Standard" || shader.name == "Standard")
                {
                    if (material.HasProperty("_Metallic"))
                    {
                        material.SetFloat("_Metallic", Mathf.Clamp01(metallic));
                    }
                    if (material.HasProperty("_Glossiness"))
                    {
                        material.SetFloat("_Glossiness", Mathf.Clamp01(smoothness));
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

