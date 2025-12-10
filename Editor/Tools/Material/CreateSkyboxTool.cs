using System;
using UnityEngine;
using UnityEditor;
using UnityEngine.Rendering;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateSkyboxTool : McpToolBase
    {
        public CreateSkyboxTool()
        {
            Name = "create_skybox";
            Description = "Create and apply a skybox material to the scene.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string skyboxType = parameters["skyboxType"]?.ToObject<string>()?.ToLower() ?? "procedural";
                string colorHex = parameters["color"]?.ToObject<string>() ?? "#87CEEB";

                Material skyboxMaterial = null;

                switch (skyboxType)
                {
                    case "procedural":
                        skyboxMaterial = new Material(Shader.Find("Skybox/Procedural"));
                        break;
                    case "6sided":
                    case "cubemap":
                        skyboxMaterial = new Material(Shader.Find("Skybox/6 Sided"));
                        break;
                    case "panoramic":
                        skyboxMaterial = new Material(Shader.Find("Skybox/Panoramic"));
                        break;
                    default:
                        skyboxMaterial = new Material(Shader.Find("Skybox/Procedural"));
                        break;
                }

                if (skyboxMaterial != null)
                {
                    // 设置颜色
                    if (ColorUtility.TryParseHtmlString(colorHex, out Color color))
                    {
                        if (skyboxMaterial.HasProperty("_SkyTint"))
                        {
                            skyboxMaterial.SetColor("_SkyTint", color);
                        }
                    }

                    RenderSettings.skybox = skyboxMaterial;
                    DynamicGI.UpdateEnvironment();

                    return new JObject
                    {
                        ["success"] = true,
                        ["message"] = $"Created and applied {skyboxType} skybox.",
                        ["skyboxType"] = skyboxType,
                        ["color"] = colorHex
                    };
                }
                else
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "Failed to create skybox material.", "execution_error");
                }
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateSkyboxTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

