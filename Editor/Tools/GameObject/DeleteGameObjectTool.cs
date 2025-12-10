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
    /// Tool to delete GameObjects from the scene
    /// Based on Unity API: Undo.DestroyObjectImmediate
    /// https://docs.unity3d.com/ScriptReference/Undo.DestroyObjectImmediate.html
    /// </summary>
    public class DeleteGameObjectTool : McpToolBase
    {
        public DeleteGameObjectTool()
        {
            Name = "delete_gameobject";
            Description = "Delete GameObjects from the scene. Supports Undo/Redo.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                string objectPath = parameters["objectPath"]?.ToObject<string>();
                string objectName = parameters["objectName"]?.ToObject<string>();
                bool includeChildren = parameters["includeChildren"]?.ToObject<bool>() ?? true;

                List<GameObject> objectsToDelete = new List<GameObject>();

                // Method 1: By instance IDs
                if (instanceIdsArray != null && instanceIdsArray.Count > 0)
                {
                    foreach (var id in instanceIdsArray)
                    {
                        GameObject obj = EditorUtility.InstanceIDToObject(id.ToObject<int>()) as GameObject;
                        if (obj != null)
                        {
                            objectsToDelete.Add(obj);
                        }
                    }
                }

                // Method 2: By object path
                if (!string.IsNullOrEmpty(objectPath))
                {
                    GameObject obj = GameObject.Find(objectPath);
                    if (obj != null && !objectsToDelete.Contains(obj))
                    {
                        objectsToDelete.Add(obj);
                    }
                }

                // Method 3: By object name (finds all with that name)
                if (!string.IsNullOrEmpty(objectName))
                {
                    GameObject[] allObjects = UnityEngine.Object.FindObjectsByType<GameObject>(FindObjectsSortMode.None);
                    foreach (var obj in allObjects)
                    {
                        if (obj.name == objectName && !objectsToDelete.Contains(obj))
                        {
                            objectsToDelete.Add(obj);
                        }
                    }
                }

                if (objectsToDelete.Count == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "No GameObjects found to delete. Provide 'instanceIds', 'objectPath', or 'objectName'.",
                        "validation_error");
                }

                JArray deletedArray = new JArray();
                int count = 0;

                foreach (GameObject obj in objectsToDelete)
                {
                    string deletedName = obj.name;
                    int deletedId = obj.GetInstanceID();
                    int childCount = obj.transform.childCount;

                    // Use Undo.DestroyObjectImmediate for undo support
                    Undo.DestroyObjectImmediate(obj);

                    deletedArray.Add(new JObject
                    {
                        ["name"] = deletedName,
                        ["instanceId"] = deletedId,
                        ["childCount"] = includeChildren ? childCount : 0
                    });
                    count++;
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Deleted {count} GameObject(s). Use Edit > Undo to restore.",
                    ["count"] = count,
                    ["deletedObjects"] = deletedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"DeleteGameObjectTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}
