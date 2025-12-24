using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateParticleSystemTool : McpToolBase
    {
        public CreateParticleSystemTool()
        {
            Name = "create_particle_system";
            Description = "Create a Particle System for visual effects.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string particleName = parameters["particleName"]?.ToObject<string>() ?? "ParticleSystem";
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
                bool playOnAwake = parameters["playOnAwake"]?.ToObject<bool>() ?? true;
                bool looping = parameters["looping"]?.ToObject<bool>() ?? true;

                GameObject particleObj = new GameObject(particleName);
                particleObj.transform.position = new Vector3(posX, posY, posZ);

                ParticleSystem ps = particleObj.AddComponent<ParticleSystem>();
                var main = ps.main;
                main.playOnAwake = playOnAwake;
                main.loop = looping;

                Undo.RegisterCreatedObjectUndo(particleObj, "Create Particle System");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created Particle System '{particleName}'.",
                    ["particleName"] = particleName,
                    ["instanceId"] = particleObj.GetInstanceID(),
                    ["playOnAwake"] = playOnAwake,
                    ["looping"] = looping
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateParticleSystemTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

