using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Tool to duplicate/clone GameObjects in the scene
    /// Based on Unity API: Object.Instantiate
    /// https://docs.unity3d.com/ScriptReference/Object.Instantiate.html
    /// </summary>
    public class DuplicateGameObjectTool : McpToolBase
    {
        public DuplicateGameObjectTool()
        {
            Name = "duplicate_gameobject";
            Description = "Duplicate/clone GameObjects in the scene. Supports Undo/Redo.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                int? singleInstanceId = parameters["instanceId"]?.ToObject<int>();
                string objectPath = parameters["objectPath"]?.ToObject<string>();
                int count = parameters["count"]?.ToObject<int>() ?? 1;
                bool keepParent = parameters["keepParent"]?.ToObject<bool>() ?? true;
                
                // Position offset for multiple duplicates
                float offsetX = parameters["offsetX"]?.ToObject<float>() ?? 1f;
                float offsetY = parameters["offsetY"]?.ToObject<float>() ?? 0f;
                float offsetZ = parameters["offsetZ"]?.ToObject<float>() ?? 0f;

                List<GameObject> sourcesToDuplicate = new List<GameObject>();

                // Method 1: Single instance ID
                if (singleInstanceId.HasValue)
                {
                    GameObject obj = EditorUtility.InstanceIDToObject(singleInstanceId.Value) as GameObject;
                    if (obj != null)
                    {
                        sourcesToDuplicate.Add(obj);
                    }
                }

                // Method 2: Multiple instance IDs
                if (instanceIdsArray != null && instanceIdsArray.Count > 0)
                {
                    foreach (var id in instanceIdsArray)
                    {
                        GameObject obj = EditorUtility.InstanceIDToObject(id.ToObject<int>()) as GameObject;
                        if (obj != null && !sourcesToDuplicate.Contains(obj))
                        {
                            sourcesToDuplicate.Add(obj);
                        }
                    }
                }

                // Method 3: By object path
                if (!string.IsNullOrEmpty(objectPath))
                {
                    GameObject obj = GameObject.Find(objectPath);
                    if (obj != null && !sourcesToDuplicate.Contains(obj))
                    {
                        sourcesToDuplicate.Add(obj);
                    }
                }

                if (sourcesToDuplicate.Count == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "No source GameObjects found to duplicate. Provide 'instanceId', 'instanceIds', or 'objectPath'.",
                        "validation_error");
                }

                JArray duplicatedArray = new JArray();
                int totalCreated = 0;

                foreach (GameObject source in sourcesToDuplicate)
                {
                    Transform parent = keepParent ? source.transform.parent : null;

                    for (int i = 0; i < count; i++)
                    {
                        // Calculate position with offset
                        Vector3 newPosition = source.transform.position + new Vector3(
                            offsetX * (i + 1),
                            offsetY * (i + 1),
                            offsetZ * (i + 1)
                        );

                        // Instantiate the duplicate
                        GameObject duplicate = UnityEngine.Object.Instantiate(
                            source,
                            newPosition,
                            source.transform.rotation,
                            parent
                        );

                        // Set name without (Clone) suffix
                        duplicate.name = source.name + (count > 1 ? $" ({i + 1})" : " (Copy)");

                        // Register for undo
                        Undo.RegisterCreatedObjectUndo(duplicate, "Duplicate GameObject");

                        duplicatedArray.Add(new JObject
                        {
                            ["sourceName"] = source.name,
                            ["sourceInstanceId"] = source.GetInstanceID(),
                            ["newName"] = duplicate.name,
                            ["newInstanceId"] = duplicate.GetInstanceID(),
                            ["position"] = new JObject
                            {
                                ["x"] = duplicate.transform.position.x,
                                ["y"] = duplicate.transform.position.y,
                                ["z"] = duplicate.transform.position.z
                            }
                        });
                        totalCreated++;
                    }
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Duplicated {sourcesToDuplicate.Count} source(s), created {totalCreated} new GameObject(s).",
                    ["sourceCount"] = sourcesToDuplicate.Count,
                    ["totalCreated"] = totalCreated,
                    ["duplicatedObjects"] = duplicatedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"DuplicateGameObjectTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}
