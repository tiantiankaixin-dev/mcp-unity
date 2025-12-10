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
                float posX = parameters["posX"]?.ToObject<float>() ?? 0f;
                float posY = parameters["posY"]?.ToObject<float>() ?? 0f;
                float posZ = parameters["posZ"]?.ToObject<float>() ?? 0f;
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

