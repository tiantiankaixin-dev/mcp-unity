using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using UnityEngine.AI;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class AddNavMeshAgentTool : McpToolBase
    {
        public AddNavMeshAgentTool()
        {
            Name = "add_navmesh_agent";
            Description = "Add NavMeshAgent component to GameObjects for AI navigation.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                float speed = parameters["speed"]?.ToObject<float>() ?? 3.5f;
                float acceleration = parameters["acceleration"]?.ToObject<float>() ?? 8f;
                float stoppingDistance = parameters["stoppingDistance"]?.ToObject<float>() ?? 0f;

                if (instanceIdsArray == null || instanceIdsArray.Count == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "At least 1 GameObject required.", "validation_error");
                }

                List<GameObject> objects = new List<GameObject>();
                foreach (var id in instanceIdsArray)
                {
                    GameObject obj = EditorUtility.InstanceIDToObject(id.ToObject<int>()) as GameObject;
                    if (obj != null) objects.Add(obj);
                }

                JArray addedArray = new JArray();
                int count = 0;

                foreach (GameObject obj in objects)
                {
                    NavMeshAgent agent = obj.GetComponent<NavMeshAgent>();
                    if (agent == null)
                    {
                        agent = Undo.AddComponent<NavMeshAgent>(obj);
                    }
                    else
                    {
                        Undo.RecordObject(agent, "Modify NavMeshAgent");
                    }

                    agent.speed = speed;
                    agent.acceleration = acceleration;
                    agent.stoppingDistance = stoppingDistance;

                    EditorUtility.SetDirty(obj);

                    addedArray.Add(new JObject
                    {
                        ["objectName"] = obj.name,
                        ["speed"] = speed
                    });
                    count++;
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Added/Updated NavMeshAgent on {count} GameObject(s).",
                    ["count"] = count,
                    ["agents"] = addedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"AddNavMeshAgentTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

