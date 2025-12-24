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
                // ✅ 支持两种颜色格式

                Color color = Color.white;

                if (parameters["color"] != null)

                {

                    var colorToken = parameters["color"];

                    if (colorToken.Type == JTokenType.Array)

                    {

                        var rgba = colorToken.ToObject<float[]>();

                        if (rgba.Length >= 3)

                        {

                            color = new Color(rgba[0], rgba[1], rgba[2], rgba.Length > 3 ? rgba[3] : 1f);

                        }

                    }

                    else if (colorToken.Type == JTokenType.String)

                    {

                        string colorHex = colorToken.ToObject<string>();

                        if (!ColorUtility.TryParseHtmlString(colorHex, out color))

                        {

                            color = Color.white;

                        }

                    }

                }
                // ✅ 支持两种位置格式

                float posX = 0f, posY = 0f, posZ = 0f;

                if (parameters["position"] != null && parameters["position"].Type == JTokenType.Array)

                {

                    // 数组格式: position: [x, y, z]

                    var pos = parameters["position"].ToObject<float[]>();

                    if (pos.Length >= 3)

                    {

                        posX = pos[0];

                        posY = pos[1];

                        posZ = pos[2];

                    }

                }

                else

                {

                    // 分离格式: posX, posY, posZ

                    posX = parameters["posX"]?.ToObject<float>() ?? 0f;

                    posY = parameters["posY"]?.ToObject<float>() ?? 3f;

                    posZ = parameters["posZ"]?.ToObject<float>() ?? 0f;

                }

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
                light.color = color;

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

