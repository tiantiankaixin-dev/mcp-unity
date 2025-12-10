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
                float posX = parameters["posX"]?.ToObject<float>() ?? 0f;
                float posY = parameters["posY"]?.ToObject<float>() ?? 1f;
                float posZ = parameters["posZ"]?.ToObject<float>() ?? 0f;
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

