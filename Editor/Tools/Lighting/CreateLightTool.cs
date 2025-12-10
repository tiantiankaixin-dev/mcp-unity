using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateLightTool : McpToolBase
    {
        public CreateLightTool()
        {
            Name = "create_light";
            Description = "Create a Light source (Directional, Point, Spot) in the scene.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string lightType = parameters["lightType"]?.ToObject<string>()?.ToLower() ?? "directional";
                string lightName = parameters["lightName"]?.ToObject<string>() ?? "Light";
                float intensity = parameters["intensity"]?.ToObject<float>() ?? 1f;
                string colorHex = parameters["color"]?.ToObject<string>() ?? "#FFFFFF";
                float posX = parameters["posX"]?.ToObject<float>() ?? 0f;
                float posY = parameters["posY"]?.ToObject<float>() ?? 3f;
                float posZ = parameters["posZ"]?.ToObject<float>() ?? 0f;

                GameObject lightObj = new GameObject(lightName);
                Light light = lightObj.AddComponent<Light>();

                // 设置光源类型
                switch (lightType)
                {
                    case "directional":
                        light.type = LightType.Directional;
                        lightObj.transform.rotation = Quaternion.Euler(50, -30, 0);
                        break;
                    case "point":
                        light.type = LightType.Point;
                        light.range = 10f;
                        break;
                    case "spot":
                        light.type = LightType.Spot;
                        light.range = 10f;
                        light.spotAngle = 30f;
                        break;
                    default:
                        light.type = LightType.Directional;
                        break;
                }

                light.intensity = intensity;

                // 解析颜色
                if (ColorUtility.TryParseHtmlString(colorHex, out Color color))
                {
                    light.color = color;
                }

                lightObj.transform.position = new Vector3(posX, posY, posZ);

                Undo.RegisterCreatedObjectUndo(lightObj, "Create Light");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created {lightType} Light '{lightName}'.",
                    ["lightName"] = lightName,
                    ["lightType"] = lightType,
                    ["instanceId"] = lightObj.GetInstanceID(),
                    ["intensity"] = intensity
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateLightTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

