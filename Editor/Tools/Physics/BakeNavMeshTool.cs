using System;

using UnityEditor;
using UnityEngine.AI;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class BakeNavMeshTool : McpToolBase
    {
        public BakeNavMeshTool()
        {
            Name = "bake_navmesh";
            Description = "Bake NavMesh for AI navigation in the scene.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                float agentRadius = parameters["agentRadius"]?.ToObject<float>() ?? 0.5f;
                float agentHeight = parameters["agentHeight"]?.ToObject<float>() ?? 2f;
                float maxSlope = parameters["maxSlope"]?.ToObject<float>() ?? 45f;
                float stepHeight = parameters["stepHeight"]?.ToObject<float>() ?? 0.4f;

                // 设置NavMesh构建设置
                NavMeshBuildSettings buildSettings = NavMesh.GetSettingsByID(0);
                buildSettings.agentRadius = agentRadius;
                buildSettings.agentHeight = agentHeight;
                buildSettings.agentSlope = maxSlope;
                buildSettings.agentClimb = stepHeight;

                // 烘焙NavMesh
                UnityEditor.AI.NavMeshBuilder.BuildNavMesh();

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = "NavMesh baked successfully.",
                    ["agentRadius"] = agentRadius,
                    ["agentHeight"] = agentHeight,
                    ["maxSlope"] = maxSlope
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"BakeNavMeshTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

