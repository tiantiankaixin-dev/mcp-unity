using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateReflectionProbeTool : McpToolBase
    {
        public CreateReflectionProbeTool()
        {
            Name = "create_reflection_probe";
            Description = "Create a Reflection Probe for realistic reflections.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string probeName = parameters["probeName"]?.ToObject<string>() ?? "ReflectionProbe";
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

                    posY = parameters["posY"]?.ToObject<float>() ?? 1f;

                    posZ = parameters["posZ"]?.ToObject<float>() ?? 0f;

                }
                float size = parameters["size"]?.ToObject<float>() ?? 10f;
                int resolution = parameters["resolution"]?.ToObject<int>() ?? 128;

                GameObject probeObj = new GameObject(probeName);
                probeObj.transform.position = new Vector3(posX, posY, posZ);

                ReflectionProbe probe = probeObj.AddComponent<ReflectionProbe>();
                probe.size = new Vector3(size, size, size);
                probe.resolution = resolution;
                probe.mode = UnityEngine.Rendering.ReflectionProbeMode.Baked;

                Undo.RegisterCreatedObjectUndo(probeObj, "Create Reflection Probe");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created Reflection Probe '{probeName}'.",
                    ["probeName"] = probeName,
                    ["instanceId"] = probeObj.GetInstanceID(),
                    ["size"] = size,
                    ["resolution"] = resolution
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateReflectionProbeTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

