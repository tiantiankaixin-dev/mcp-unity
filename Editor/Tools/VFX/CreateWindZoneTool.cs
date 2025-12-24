using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateWindZoneTool : McpToolBase
    {
        public CreateWindZoneTool()
        {
            Name = "create_wind_zone";
            Description = "Create a Wind Zone for environmental wind effects on trees and particles.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string windZoneName = parameters["windZoneName"]?.ToObject<string>() ?? "WindZone";
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

                    posY = parameters["posY"]?.ToObject<float>() ?? 0f;

                    posZ = parameters["posZ"]?.ToObject<float>() ?? 0f;

                }
                string mode = parameters["mode"]?.ToObject<string>()?.ToLower() ?? "directional";
                float windMain = parameters["windMain"]?.ToObject<float>() ?? 0.5f;
                float windTurbulence = parameters["windTurbulence"]?.ToObject<float>() ?? 0.5f;

                GameObject windZoneObj = new GameObject(windZoneName);
                windZoneObj.transform.position = new Vector3(posX, posY, posZ);

                WindZone windZone = windZoneObj.AddComponent<WindZone>();
                
                if (mode == "spherical")
                {
                    windZone.mode = WindZoneMode.Spherical;
                }
                else
                {
                    windZone.mode = WindZoneMode.Directional;
                }

                windZone.windMain = windMain;
                windZone.windTurbulence = windTurbulence;

                Undo.RegisterCreatedObjectUndo(windZoneObj, "Create Wind Zone");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created Wind Zone '{windZoneName}' in {mode} mode.",
                    ["windZoneName"] = windZoneName,
                    ["instanceId"] = windZoneObj.GetInstanceID(),
                    ["mode"] = windZone.mode.ToString(),
                    ["windMain"] = windMain
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateWindZoneTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

